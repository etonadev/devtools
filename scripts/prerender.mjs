import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const siteUrl = (process.env.VITE_SITE_URL || 'https://example.com').replace(/\/$/, '')
const routes = {
  'json-formatter': ['JSON Formatter & Editor Online | DevTools', 'Format, validate, edit, and beautify JSON online with precision-safe, local browser processing.'],
  'yaml-formatter': ['YAML Formatter & Editor Online | DevTools', 'Format and validate YAML online while preserving comments, anchors, and aliases locally in your browser.'],
  'xml-formatter': ['XML Formatter & Editor Online | DevTools', 'Format, validate, and safely minify XML online with namespace, CDATA, and comment support.'],
  'sql-formatter': ['SQL Formatter Online | DevTools', 'Format SQL online for MySQL, MariaDB, PostgreSQL, SQL Server, SQLite, and standard SQL.'],
  'markdown-editor': ['Markdown Editor & Preview Online | DevTools', 'Write and format GitHub Flavored Markdown with a safe live preview and local browser processing.'],
  about: ['About DevTools', 'Learn about DevTools’ local-first developer workbench.'],
  privacy: ['Privacy | DevTools', 'Learn how DevTools keeps document processing local to your browser.'],
  contact: ['Contact | DevTools', 'Share feedback about DevTools.'],
}

const template = await readFile('dist/index.html', 'utf8')
for (const [route, [title, description]] of Object.entries(routes)) {
  const html = template
    .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
    .replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${description}" />`)
    .replace('</head>', `<link rel="canonical" href="${siteUrl}/${route}" /></head>`)
  await mkdir(join('dist', route), { recursive: true })
  await writeFile(join('dist', route, 'index.html'), html)
}

for (const file of ['robots.txt', 'sitemap.xml']) {
  const path = join('dist', file)
  const content = await readFile(path, 'utf8')
  await writeFile(path, content.replaceAll('{{SITE_URL}}', siteUrl))
}

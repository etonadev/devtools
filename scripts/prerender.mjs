import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { loadEnv } from 'vite'

const seo = JSON.parse(await readFile('src/app/seo.json', 'utf8'))
const env = loadEnv('production', process.cwd(), '')
const siteUrl = (process.env.VITE_SITE_URL || env.VITE_SITE_URL || seo.site.url).replace(/\/$/, '')
const productName = process.env.VITE_PRODUCT_NAME || env.VITE_PRODUCT_NAME || seo.site.name
const imageUrl = `${siteUrl}${seo.site.imagePath}`
const template = await readFile('dist/index.html', 'utf8')

function escapeHtml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function pageUrl(path) {
  return `${siteUrl}${path === '/' ? '/' : path}`
}

function structuredData(page) {
  const url = pageUrl(page.path)
  const websiteId = `${siteUrl}/#website`
  if (page.kind === 'website') {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'WebSite', '@id': websiteId, name: productName, url, description: page.description, inLanguage: seo.site.language },
        { '@type': 'WebApplication', name: productName, url, description: page.description, applicationCategory: 'DeveloperApplication', operatingSystem: 'Any', browserRequirements: 'Requires a modern web browser', isAccessibleForFree: true, isPartOf: { '@id': websiteId } },
      ],
    }
  }
  if (page.kind === 'application') {
    return { '@context': 'https://schema.org', '@type': 'WebApplication', name: page.heading, url, description: page.description, applicationCategory: 'DeveloperApplication', operatingSystem: 'Any', browserRequirements: 'Requires a modern web browser', isAccessibleForFree: true, isPartOf: { '@id': websiteId } }
  }
  return { '@context': 'https://schema.org', '@type': 'WebPage', name: page.title, url, description: page.description, inLanguage: seo.site.language, isPartOf: { '@id': websiteId } }
}

function metadataBlock(page) {
  const url = pageUrl(page.path)
  const title = escapeHtml(page.title)
  const description = escapeHtml(page.description)
  const imageAlt = escapeHtml(seo.site.imageAlt)
  const jsonLd = JSON.stringify(structuredData(page)).replaceAll('<', '\\u003c')
  return `<!-- SEO:START -->
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${imageAlt}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${escapeHtml(productName)}" />
    <meta property="og:locale" content="${seo.site.locale}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${imageUrl}" />
    <meta name="twitter:image:alt" content="${imageAlt}" />
    <script type="application/ld+json" id="devmastertools-structured-data">${jsonLd}</script>
    <!-- SEO:END -->`
}

function staticContent(page) {
  const toolLinks = page.path === '/' ? '<nav aria-label="Developer tools"><a href="/json-formatter">JSON Formatter</a> <a href="/yaml-formatter">YAML Formatter</a> <a href="/xml-formatter">XML Formatter</a> <a href="/sql-formatter">SQL Formatter</a> <a href="/markdown-editor">Markdown Editor</a></nav>' : ''
  return `<main data-static-seo="true"><h1>${escapeHtml(page.heading)}</h1><p>${escapeHtml(page.description)}</p>${toolLinks}</main>`
}

function renderPage(page) {
  return template
    .replace(/<!-- SEO:START -->[\s\S]*?<!-- SEO:END -->/, metadataBlock(page))
    .replace(/<div id="root">[\s\S]*?<\/div>/, `<div id="root">${staticContent(page)}</div>`)
}

for (const page of Object.values(seo.pages)) {
  const html = renderPage(page)
  if (page.path === '/') {
    await writeFile('dist/index.html', html)
    continue
  }
  const route = page.path.slice(1)
  await mkdir(join('dist', route), { recursive: true })
  await writeFile(join('dist', route, 'index.html'), html)
}

const sitemapUrls = Object.values(seo.pages).map((page) => `  <url><loc>${pageUrl(page.path)}</loc></url>`).join('\n')
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls}\n</urlset>\n`)
await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`)

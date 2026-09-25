import { Braces, Brackets, Database, FileCode2, FileText } from 'lucide-react'
import type { ToolDefinition, ToolId } from '../types/tools'
import seoMetadata from './seo.json'

export const PRODUCT_NAME = import.meta.env.VITE_PRODUCT_NAME || 'DevMaster Tools'
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://devmastertools.com').replace(/\/$/, '')
export const SUPPORT_EMAIL = 'etona.dev@gmail.com'
export const MAX_FILE_SIZE = 5 * 1024 * 1024

export const SUPPORT_OPTIONS = {
  buyMeACoffee: {
    label: 'Buy Me a Coffee',
    url: 'https://buymeacoffee.com/etonadev',
    enabled: true,
  },
  githubSponsors: {
    label: 'GitHub Sponsors',
    url: 'https://github.com/sponsors/etonadev',
    // Enable only after this URL serves a public sponsorship page instead of redirecting to the profile.
    enabled: false,
  },
} as const

type ToolContent = Pick<ToolDefinition, 'about' | 'features' | 'instructions' | 'faqs'>
const contentFor = (id: ToolId) => seoMetadata.pages[id].content as ToolContent

export const tools: ToolDefinition[] = [
  {
    id: 'json', name: 'JSON Formatter & Editor', shortName: 'JSON', path: '/json-formatter',
    description: 'Format, validate, minify, and explore JSON without uploading it.',
    intro: 'A precision-safe JSON workbench for APIs, configuration files, and structured data.',
    language: 'json', extensions: ['.json'], filename: 'formatted.json', icon: Braces,
    example: '{\n  "project": "DevMaster Tools",\n  "private": true,\n  "releases": [\n    { "version": "1.0.0", "stable": true },\n    { "version": "9007199254740993", "stable": false }\n  ]\n}',
    ...contentFor('json'),
  },
  {
    id: 'yaml', name: 'YAML Formatter & Editor', shortName: 'YAML', path: '/yaml-formatter',
    description: 'Validate and format YAML while preserving YAML-specific structure.',
    intro: 'Review configuration files with comment-aware parsing, anchors, aliases, and precise errors.',
    language: 'yaml', extensions: ['.yaml', '.yml'], filename: 'formatted.yaml', icon: Brackets,
    example: '# Deployment settings\nservice: &service\n  name: devmaster-tools\n  replicas: 3\nproduction:\n  <<: *service\n  replicas: 5\nfeatures:\n  - formatting\n  - validation\n',
    ...contentFor('yaml'),
  },
  {
    id: 'xml', name: 'XML Formatter & Editor', shortName: 'XML', path: '/xml-formatter',
    description: 'Beautify and validate XML with namespace, CDATA, and comment support.',
    intro: 'A careful XML editor that avoids unsafe network fetching and protects mixed-content documents.',
    language: 'xml', extensions: ['.xml'], filename: 'formatted.xml', icon: FileCode2,
    example: '<?xml version="1.0" encoding="UTF-8"?>\n<catalog xmlns="https://example.test/catalog">\n  <!-- Local-only example -->\n  <item id="tool-1"><name>DevMaster Tools</name><details><![CDATA[Fast & private]]></details></item>\n</catalog>',
    ...contentFor('xml'),
  },
  {
    id: 'sql', name: 'SQL Formatter', shortName: 'SQL', path: '/sql-formatter',
    description: 'Format realistic SQL with dialect and keyword-case controls.',
    intro: 'Make complex queries readable across major SQL dialects—without executing a single statement.',
    language: 'sql', extensions: ['.sql'], filename: 'formatted.sql', icon: Database,
    example: 'WITH active_projects AS (SELECT id, owner_id FROM projects WHERE archived = false)\nSELECT u.name, COUNT(p.id) AS project_count\nFROM users u LEFT JOIN active_projects p ON p.owner_id = u.id\nGROUP BY u.name ORDER BY project_count DESC;',
    ...contentFor('sql'),
  },
  {
    id: 'markdown', name: 'Markdown Editor & Preview', shortName: 'Markdown', path: '/markdown-editor',
    description: 'Write GitHub Flavored Markdown with a safe, live preview.',
    intro: 'Draft documentation with tables, task lists, code fences, and a sanitized live preview.',
    language: 'markdown', extensions: ['.md', '.markdown'], filename: 'document.md', icon: FileText,
    example: '# Ship checklist\n\nA **local-first** Markdown workspace.\n\n- [x] Format source\n- [x] Preview GFM\n- [ ] Publish docs\n\n| Tool | Status |\n| --- | --- |\n| JSON | Ready |\n| YAML | Ready |\n\n```ts\nconst privateByDefault = true\n```\n',
    ...contentFor('markdown'),
  },
]

export const toolById = Object.fromEntries(tools.map((tool) => [tool.id, tool])) as Record<string, ToolDefinition>

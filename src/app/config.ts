import { Braces, Brackets, Database, FileCode2, FileText } from 'lucide-react'
import type { ToolDefinition } from '../types/tools'

export const PRODUCT_NAME = import.meta.env.VITE_PRODUCT_NAME || 'DevTools'
export const SITE_URL = import.meta.env.VITE_SITE_URL?.replace(/\/$/, '') || ''
export const MAX_FILE_SIZE = 5 * 1024 * 1024

export const tools: ToolDefinition[] = [
  {
    id: 'json', name: 'JSON Formatter & Editor', shortName: 'JSON', path: '/json-formatter',
    description: 'Format, validate, minify, and explore JSON without uploading it.',
    intro: 'A precision-safe JSON workbench for APIs, configuration files, and structured data.',
    language: 'json', extensions: ['.json'], filename: 'formatted.json', icon: Braces,
    example: '{\n  "project": "DevTools",\n  "private": true,\n  "releases": [\n    { "version": "1.0.0", "stable": true },\n    { "version": "9007199254740993", "stable": false }\n  ]\n}',
    features: ['Precision-safe formatting', 'Expandable tree view', 'Line-aware validation', 'Minification and downloads'],
    instructions: ['Paste JSON or upload a .json file.', 'Choose indentation, then format or validate.', 'Inspect nested data in Tree view, then copy or download the result.'],
    faqs: [
      { question: 'Does formatting change large integers?', answer: 'No. DevTools uses a lossless JSON number representation so integers beyond JavaScript’s safe range are not silently rounded.' },
      { question: 'Is my JSON uploaded?', answer: 'No. Parsing and formatting happen entirely in your browser.' },
    ],
  },
  {
    id: 'yaml', name: 'YAML Formatter & Editor', shortName: 'YAML', path: '/yaml-formatter',
    description: 'Validate and format YAML while preserving YAML-specific structure.',
    intro: 'Review configuration files with comment-aware parsing, anchors, aliases, and precise errors.',
    language: 'yaml', extensions: ['.yaml', '.yml'], filename: 'formatted.yaml', icon: Brackets,
    example: '# Deployment settings\nservice: &service\n  name: devtools\n  replicas: 3\nproduction:\n  <<: *service\n  replicas: 5\nfeatures:\n  - formatting\n  - validation\n',
    features: ['Comment preservation', 'Anchors and aliases', 'Line-aware validation', 'YAML document model'],
    instructions: ['Paste YAML or upload a .yaml/.yml file.', 'Select an indentation size and choose Format.', 'Review validation feedback before copying or downloading.'],
    faqs: [
      { question: 'Are comments preserved?', answer: 'Yes. Formatting uses the YAML document model rather than converting YAML to JSON.' },
      { question: 'Does this resolve aliases?', answer: 'No. Anchors and aliases remain YAML syntax and are not flattened.' },
    ],
  },
  {
    id: 'xml', name: 'XML Formatter & Editor', shortName: 'XML', path: '/xml-formatter',
    description: 'Beautify and validate XML with namespace, CDATA, and comment support.',
    intro: 'A careful XML editor that avoids unsafe network fetching and protects mixed-content documents.',
    language: 'xml', extensions: ['.xml'], filename: 'formatted.xml', icon: FileCode2,
    example: '<?xml version="1.0" encoding="UTF-8"?>\n<catalog xmlns="https://example.test/catalog">\n  <!-- Local-only example -->\n  <item id="tool-1"><name>DevTools</name><details><![CDATA[Fast & private]]></details></item>\n</catalog>',
    features: ['Namespace preservation', 'CDATA and comments', 'Safe minification checks', 'Malformed XML detection'],
    instructions: ['Paste XML or upload an .xml file.', 'Validate before formatting or minifying.', 'If mixed content is detected, DevTools refuses destructive whitespace changes.'],
    faqs: [
      { question: 'Does the validator fetch DTDs?', answer: 'No. DevTools never fetches external XML resources.' },
      { question: 'Why can minify be refused?', answer: 'Whitespace can be meaningful in mixed-content XML, so destructive transformations are blocked when safety cannot be guaranteed.' },
    ],
  },
  {
    id: 'sql', name: 'SQL Formatter', shortName: 'SQL', path: '/sql-formatter',
    description: 'Format realistic SQL with dialect and keyword-case controls.',
    intro: 'Make complex queries readable across major SQL dialects—without executing a single statement.',
    language: 'sql', extensions: ['.sql'], filename: 'formatted.sql', icon: Database,
    example: 'WITH active_projects AS (SELECT id, owner_id FROM projects WHERE archived = false)\nSELECT u.name, COUNT(p.id) AS project_count\nFROM users u LEFT JOIN active_projects p ON p.owner_id = u.id\nGROUP BY u.name ORDER BY project_count DESC;',
    features: ['Six SQL dialects', 'Keyword casing', 'CTEs and joins', 'Multiple statements'],
    instructions: ['Paste SQL or upload a .sql file.', 'Choose the closest dialect and keyword style.', 'Format, review, then copy or download the query.'],
    faqs: [
      { question: 'Does DevTools run my query?', answer: 'Never. This tool only formats text and has no database connection.' },
      { question: 'Does formatting prove SQL is valid?', answer: 'No. Formatting can detect some syntax problems, but it is not a complete dialect-aware validator.' },
    ],
  },
  {
    id: 'markdown', name: 'Markdown Editor & Preview', shortName: 'Markdown', path: '/markdown-editor',
    description: 'Write GitHub Flavored Markdown with a safe, live preview.',
    intro: 'Draft documentation with tables, task lists, code fences, and a sanitized live preview.',
    language: 'markdown', extensions: ['.md', '.markdown'], filename: 'document.md', icon: FileText,
    example: '# Ship checklist\n\nA **local-first** Markdown workspace.\n\n- [x] Format source\n- [x] Preview GFM\n- [ ] Publish docs\n\n| Tool | Status |\n| --- | --- |\n| JSON | Ready |\n| YAML | Ready |\n\n```ts\nconst privateByDefault = true\n```\n',
    features: ['Live GFM preview', 'Safe HTML handling', 'Tables and task lists', 'Editor and preview modes'],
    instructions: ['Write Markdown or upload a .md/.markdown file.', 'Use split, editor-only, or preview-only mode.', 'Format the document before copying or downloading.'],
    faqs: [
      { question: 'Can Markdown run scripts?', answer: 'No. Raw HTML is disabled and rendered output is sanitized.' },
      { question: 'Are fenced code blocks reformatted?', answer: 'Their contents are preserved by the Markdown formatter.' },
    ],
  },
]

export const toolById = Object.fromEntries(tools.map((tool) => [tool.id, tool])) as Record<string, ToolDefinition>

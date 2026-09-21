import { describe, expect, it } from 'vitest'
import { formatJson, minifyJson, validateJson } from './json'
import { formatYaml, validateYaml } from './yaml'
import { formatXml, minifyXml, validateXml } from './xml'
import { formatSql } from './sql'
import { formatMarkdown } from './markdown'

const options = { indent: 2 as const }

describe('JSON processing', () => {
  it('formats valid nested objects and arrays', async () => expect((await formatJson('{"a":{"b":[1,2]}}', options)).output).toContain('\n  "a"'))
  it('reports invalid JSON', async () => expect((await validateJson('{"a":}')).valid).toBe(false))
  it('minifies JSON', async () => expect((await minifyJson('{\n "ok": true\n}')).output).toBe('{"ok":true}'))
  it('preserves integers beyond the safe range', async () => expect((await formatJson('{"id":9007199254740993}', options)).output).toContain('9007199254740993'))
})

describe('YAML processing', () => {
  it('formats valid YAML and preserves comments', async () => expect((await formatYaml('# note\na: 1\n', options)).output).toContain('# note'))
  it('preserves anchors and aliases', async () => expect((await formatYaml('a: &x { value: 1 }\nb: *x\n', options)).output).toContain('*x'))
  it('reports invalid YAML with location', async () => expect((await validateYaml('a: [1,')).valid).toBe(false))
})

describe('XML processing', () => {
  it('validates attributes, namespaces, and CDATA', async () => expect((await validateXml('<x:root xmlns:x="urn:x" a="1"><![CDATA[a < b]]></x:root>')).valid).toBe(true))
  it('reports malformed XML', async () => expect((await validateXml('<root>')).valid).toBe(false))
  it('formats element-only XML', async () => expect((await formatXml('<root><child a="1"/></root>', options)).output).toContain('\n'))
  it('refuses destructive mixed-content minification', async () => expect(minifyXml('<p>Hello <b>world</b>.</p>')).rejects.toThrow(/mixed-content/i))
})

describe('SQL processing', () => {
  it.each([
    ['SELECT * FROM users;', 'sql'],
    ['SELECT a.id FROM a JOIN b ON a.id=b.id;', 'mysql'],
    ['WITH x AS (SELECT 1 AS n) SELECT * FROM x;', 'postgresql'],
    ['SELECT 1; SELECT 2;', 'sqlite'],
    ['SELECT TOP 2 * FROM users;', 'transactsql'],
  ])('formats %s for %s', async (query, dialect) => expect((await formatSql(query, { indent: 2, dialect, keywordCase: 'upper' })).output.length).toBeGreaterThan(5))
})

describe('Markdown processing', () => {
  it.each(['# Heading', '| A | B |\n|---|---|\n|1|2|', '```js\nconst x=1\n```', '- [x] done'])('formats supported Markdown: %s', async (source) => expect((await formatMarkdown(source, options)).output).toBeTruthy())
  it('does not execute unsafe HTML while formatting', async () => expect((await formatMarkdown('<script>alert(1)</script>', options)).output).toContain('<script>'))
})

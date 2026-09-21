import xmlFormat from 'xml-formatter'
import type { FormatOptions, ProcessResult, ValidationResult } from '../../types/tools'

function parseXml(input: string): Document {
  const document = new DOMParser().parseFromString(input, 'application/xml')
  const error = document.querySelector('parsererror')
  if (error) throw new Error(error.textContent?.trim() || 'Malformed XML document.')
  return document
}

function hasMixedContent(document: Document): boolean {
  return [...document.querySelectorAll('*')].some((element) => {
    const hasElement = [...element.childNodes].some((node) => node.nodeType === Node.ELEMENT_NODE)
    const hasText = [...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && Boolean(node.textContent?.trim()))
    return hasElement && hasText
  })
}

export async function validateXml(input: string): Promise<ValidationResult> {
  try {
    return { valid: true, value: parseXml(input), notice: { kind: 'success', message: 'Well-formed XML.' } }
  } catch (error) {
    return { valid: false, notice: { kind: 'error', message: error instanceof Error ? error.message : 'Malformed XML.' } }
  }
}

export async function formatXml(input: string, options: FormatOptions): Promise<ProcessResult> {
  const document = parseXml(input)
  if (hasMixedContent(document)) throw new Error('Formatting was stopped because this document contains mixed text and elements where whitespace may be meaningful.')
  const indentation = options.indent === 'tab' ? '\t' : ' '.repeat(options.indent)
  return { output: xmlFormat(input, { indentation, collapseContent: true, lineSeparator: '\n' }), notice: { kind: 'success', message: 'XML formatted; namespaces, attributes, comments, and CDATA were preserved.' } }
}

export async function minifyXml(input: string): Promise<ProcessResult> {
  const document = parseXml(input)
  if (hasMixedContent(document)) throw new Error('Minification was stopped because mixed-content whitespace may be meaningful.')
  const output = input.replace(/>\s+</g, '><').trim()
  return { output, notice: { kind: 'success', message: 'XML minified after a mixed-content safety check.' } }
}

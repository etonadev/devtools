import { parseDocument } from 'yaml'
import type { FormatOptions, ProcessResult, ValidationResult } from '../../types/tools'
import { messageFromError } from '../errors'

export async function formatYaml(input: string, options: FormatOptions): Promise<ProcessResult> {
  const document = parseDocument(input, { keepSourceTokens: true, prettyErrors: true })
  if (document.errors.length) throw document.errors[0]
  const indent = options.indent === 'tab' ? 2 : options.indent
  return { output: document.toString({ indent, lineWidth: 0 }), notice: { kind: 'success', message: options.indent === 'tab' ? 'YAML formatted with 2 spaces (tabs are invalid YAML indentation).' : 'YAML formatted; comments and anchors were preserved.' } }
}

export async function validateYaml(input: string): Promise<ValidationResult> {
  try {
    const document = parseDocument(input, { keepSourceTokens: true, prettyErrors: true })
    if (document.errors.length) throw document.errors[0]
    return { valid: true, value: document, notice: { kind: 'success', message: 'Valid YAML.' } }
  } catch (error) {
    const typed = error as { linePos?: { line: number; col: number }[] }
    return { valid: false, notice: { kind: 'error', message: messageFromError(error), line: typed.linePos?.[0]?.line, column: typed.linePos?.[0]?.col } }
  }
}

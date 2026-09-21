import { isLosslessNumber, parse, stringify } from 'lossless-json'
import type { FormatOptions, ProcessResult, ValidationResult } from '../../types/tools'
import { messageFromError, positionFromMessage } from '../errors'

function indentValue(indent: FormatOptions['indent']): number | string {
  return indent === 'tab' ? '\t' : indent
}

export async function formatJson(input: string, options: FormatOptions): Promise<ProcessResult> {
  try {
    const value = parse(input)
    const output = stringify(value, undefined, indentValue(options.indent)) ?? ''
    return { output, notice: { kind: 'success', message: 'JSON formatted without changing numeric precision.' } }
  } catch (error) {
    const message = messageFromError(error)
    throw Object.assign(new Error(message), positionFromMessage(message))
  }
}

export async function minifyJson(input: string): Promise<ProcessResult> {
  try {
    return { output: stringify(parse(input)) ?? '', notice: { kind: 'success', message: 'JSON minified.' } }
  } catch (error) {
    const message = messageFromError(error)
    throw Object.assign(new Error(message), positionFromMessage(message))
  }
}

export async function validateJson(input: string): Promise<ValidationResult> {
  try {
    return { valid: true, value: parse(input), notice: { kind: 'success', message: 'Valid JSON.' } }
  } catch (error) {
    const message = messageFromError(error)
    return { valid: false, notice: { kind: 'error', message, ...positionFromMessage(message) } }
  }
}

export function treeScalar(value: unknown): string {
  if (isLosslessNumber(value)) return value.value
  if (typeof value === 'string') return JSON.stringify(value)
  return String(value)
}

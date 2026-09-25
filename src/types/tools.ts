import type { LucideIcon } from 'lucide-react'

export type Indent = 2 | 4 | 'tab'
export type ToolId = 'json' | 'yaml' | 'xml' | 'sql' | 'markdown'
export type Notice = { kind: 'success' | 'error' | 'info'; message: string; line?: number; column?: number }

export interface ToolDefinition {
  id: ToolId
  name: string
  shortName: string
  path: string
  description: string
  intro: string
  language: string
  extensions: string[]
  filename: string
  example: string
  icon: LucideIcon
  about: string
  features: string[]
  instructions: string[]
  faqs: { question: string; answer: string }[]
}

export interface FormatOptions {
  indent: Indent
  dialect?: string
  keywordCase?: 'upper' | 'lower' | 'preserve'
}

export interface ProcessResult {
  output: string
  notice: Notice
}

export interface ValidationResult {
  valid: boolean
  notice: Notice
  value?: unknown
}

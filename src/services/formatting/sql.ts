import { format, type SqlLanguage } from 'sql-formatter'
import type { FormatOptions, ProcessResult } from '../../types/tools'

export async function formatSql(input: string, options: FormatOptions): Promise<ProcessResult> {
  const tabWidth = options.indent === 'tab' ? 1 : options.indent
  const output = format(input, {
    language: (options.dialect || 'sql') as SqlLanguage,
    keywordCase: options.keywordCase === 'preserve' ? undefined : options.keywordCase,
    tabWidth,
    useTabs: options.indent === 'tab',
    linesBetweenQueries: 2,
  })
  return { output, notice: { kind: 'success', message: 'SQL formatted. Formatting is not a substitute for database validation.' } }
}

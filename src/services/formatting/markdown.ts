import type { FormatOptions, ProcessResult } from '../../types/tools'

export async function formatMarkdown(input: string, options: FormatOptions): Promise<ProcessResult> {
  const [prettier, markdownPlugin] = await Promise.all([import('prettier/standalone'), import('prettier/plugins/markdown')])
  const output = await prettier.format(input, {
    parser: 'markdown',
    plugins: [markdownPlugin],
    tabWidth: options.indent === 'tab' ? 2 : options.indent,
    useTabs: options.indent === 'tab',
    proseWrap: 'preserve',
  })
  return { output, notice: { kind: 'success', message: 'Markdown formatted; fenced code contents were preserved.' } }
}

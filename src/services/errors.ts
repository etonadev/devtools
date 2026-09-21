import type { Notice } from '../types/tools'

export function messageFromError(error: unknown): string {
  if (error instanceof Error) return error.message.replace(/^Error:\s*/i, '')
  return 'Something went wrong. Your original input has not been changed.'
}

export function positionFromMessage(message: string): Pick<Notice, 'line' | 'column'> {
  const lineColumn = message.match(/(?:line|at)\s+(\d+)(?:[^\d]+column\s+(\d+))?/i)
  if (lineColumn) return { line: Number(lineColumn[1]), column: Number(lineColumn[2] || 1) }
  const jsonPosition = message.match(/position\s+(\d+)/i)
  return jsonPosition ? { column: Number(jsonPosition[1]) + 1 } : {}
}

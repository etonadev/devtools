import { MAX_FILE_SIZE } from '../app/config'

export async function readLocalFile(file: File, extensions: string[]): Promise<string> {
  const extension = `.${file.name.split('.').pop()?.toLowerCase()}`
  if (!extensions.includes(extension)) throw new Error(`Unsupported file. Choose ${extensions.join(' or ')}.`)
  if (file.size > MAX_FILE_SIZE) throw new Error('This file is larger than the 5 MB browser-processing limit.')
  if (typeof file.text === 'function') return file.text()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('The browser could not read this file.'))
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.readAsText(file)
  })
}

export function downloadText(content: string, filename: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

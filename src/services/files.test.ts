import { describe, expect, it, vi } from 'vitest'
import { downloadText, readLocalFile } from './files'

describe('file handling', () => {
  it('reads a supported local file', async () => expect(await readLocalFile(new File(['{}'], 'sample.json'), ['.json'])).toBe('{}'))
  it('rejects unsupported files', async () => expect(readLocalFile(new File(['x'], 'sample.exe'), ['.json'])).rejects.toThrow(/unsupported/i))
  it('rejects oversized files', async () => expect(readLocalFile(new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'large.json'), ['.json'])).rejects.toThrow(/5 MB/i))
  it('starts a browser download', () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
    const create = vi.fn(() => 'blob:test')
    Object.defineProperty(URL, 'createObjectURL', { value: create, configurable: true })
    Object.defineProperty(URL, 'revokeObjectURL', { value: vi.fn(), configurable: true })
    downloadText('{}', 'out.json')
    expect(create).toHaveBeenCalled(); expect(click).toHaveBeenCalled()
  })
})

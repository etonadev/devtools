import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CodeEditor } from './CodeEditor'

const mocks = vi.hoisted(() => {
  const viewState = { cursorState: [], viewState: {} }
  const state = { value: '', props: [] as Array<{ options?: object; onChange?: (value?: string) => void }> }
  const editor = {
    getValue: vi.fn(() => state.value),
    setValue: vi.fn((value: string) => { state.value = value }),
    saveViewState: vi.fn(() => viewState),
    restoreViewState: vi.fn(),
    updateOptions: vi.fn(),
    getModel: vi.fn(() => ({})),
  }
  const monaco = { editor: { setModelMarkers: vi.fn() }, MarkerSeverity: { Error: 8 } }
  return { editor, monaco, state, viewState }
})

vi.mock('@monaco-editor/react', async () => {
  const { useEffect } = await import('react')
  return {
    default: (props: { defaultValue?: string; options?: object; onMount?: (editor: typeof mocks.editor, monaco: typeof mocks.monaco) => void; onChange?: (value?: string) => void }) => {
      mocks.state.props.push(props)
      useEffect(() => {
        mocks.state.value = props.defaultValue ?? ''
        props.onMount?.(mocks.editor, mocks.monaco)
      }, [])
      return <div data-testid="mock-editor" />
    },
  }
})

describe('CodeEditor view-state stability', () => {
  it('does not reconfigure Monaco for value-only renders and preserves view state for external changes', () => {
    const onChange = vi.fn()
    const { rerender } = render(<CodeEditor value="large document" onChange={onChange} language="json" label="Input" wordWrap indent={2} />)
    const initialProps = mocks.state.props.at(-1)
    mocks.editor.updateOptions.mockClear()
    mocks.editor.setValue.mockClear()
    mocks.editor.restoreViewState.mockClear()

    rerender(<CodeEditor value="large document" onChange={onChange} language="json" label="Input" wordWrap indent={2} />)
    const unchangedProps = mocks.state.props.at(-1)
    expect(unchangedProps?.options).toBe(initialProps?.options)
    expect(unchangedProps?.onChange).toBe(initialProps?.onChange)
    expect(mocks.editor.updateOptions).not.toHaveBeenCalled()
    expect(mocks.editor.setValue).not.toHaveBeenCalled()

    rerender(<CodeEditor value="replacement document" onChange={onChange} language="json" label="Input" wordWrap indent={2} />)
    expect(mocks.editor.setValue).toHaveBeenCalledWith('replacement document')
    expect(mocks.editor.restoreViewState).toHaveBeenCalledWith(mocks.viewState)
  })

  it('preserves the current view while applying an intentional word-wrap change', () => {
    const { rerender } = render(<CodeEditor value="large document" language="json" label="Input" wordWrap indent={2} />)
    mocks.editor.updateOptions.mockClear()
    mocks.editor.restoreViewState.mockClear()

    rerender(<CodeEditor value="large document" language="json" label="Input" wordWrap={false} indent={2} />)
    expect(mocks.editor.updateOptions).toHaveBeenCalledWith(expect.objectContaining({ wordWrap: 'off' }))
    expect(mocks.editor.restoreViewState).toHaveBeenCalledWith(mocks.viewState)
  })
})

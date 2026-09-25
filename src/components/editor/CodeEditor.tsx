import Editor, { type Monaco, type OnMount } from '@monaco-editor/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { editor } from 'monaco-editor'
import type { Indent, Notice } from '../../types/tools'

interface CodeEditorProps {
  value: string
  onChange?: (value: string) => void
  language: string
  label: string
  readOnly?: boolean
  wordWrap: boolean
  indent: Indent
  notice?: Notice | null
}

const baseEditorOptions = {
  minimap: { enabled: false },
  fontSize: 14,
  fontFamily: '"JetBrains Mono", "Cascadia Code", Consolas, monospace',
  lineHeight: 22,
  lineNumbersMinChars: 3,
  bracketPairColorization: { enabled: true },
  matchBrackets: 'always' as const,
  stickyScroll: { enabled: false },
  scrollBeyondLastLine: false,
  padding: { top: 12, bottom: 12 },
}

export function CodeEditor({ value, onChange, language, label, readOnly = false, wordWrap, indent, notice }: CodeEditorProps) {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme === 'light' ? 'light' : 'vs-dark')
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<Monaco | null>(null)
  const onChangeRef = useRef(onChange)
  const applyingExternalValueRef = useRef(false)
  const appliedDynamicOptionsRef = useRef<object | null>(null)
  onChangeRef.current = onChange

  const options = useMemo(() => ({ ...baseEditorOptions, ariaLabel: label }), [label])
  const dynamicOptions = useMemo(() => ({
    readOnly,
    tabSize: indent === 'tab' ? 4 : indent,
    insertSpaces: indent !== 'tab',
    wordWrap: wordWrap ? 'on' as const : 'off' as const,
  }), [indent, readOnly, wordWrap])
  const dynamicOptionsRef = useRef(dynamicOptions)
  dynamicOptionsRef.current = dynamicOptions

  useEffect(() => {
    const updateTheme = () => setTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'vs-dark')
    const observer = new MutationObserver(updateTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    updateTheme()
    return () => observer.disconnect()
  }, [])

  const onMount = useCallback<OnMount>((instance, monaco) => {
    editorRef.current = instance
    monacoRef.current = monaco
    instance.updateOptions(dynamicOptionsRef.current)
    appliedDynamicOptionsRef.current = dynamicOptionsRef.current
  }, [])

  const handleChange = useCallback((next: string | undefined) => {
    if (!applyingExternalValueRef.current) onChangeRef.current?.(next ?? '')
  }, [])

  useEffect(() => {
    const instance = editorRef.current
    if (!instance || instance.getValue() === value) return
    const viewState = instance.saveViewState()
    applyingExternalValueRef.current = true
    try {
      instance.setValue(value)
      if (viewState) instance.restoreViewState(viewState)
    } finally {
      applyingExternalValueRef.current = false
    }
  }, [value])

  useEffect(() => {
    const instance = editorRef.current
    if (!instance || appliedDynamicOptionsRef.current === dynamicOptions) return
    const viewState = instance.saveViewState()
    instance.updateOptions(dynamicOptions)
    if (viewState) instance.restoreViewState(viewState)
    appliedDynamicOptionsRef.current = dynamicOptions
  }, [dynamicOptions])

  useEffect(() => {
    const instance = editorRef.current
    const model = instance?.getModel()
    if (!instance || !model) return
    const monaco = monacoRef.current
    if (!monaco) return
    monaco.editor.setModelMarkers(model, 'devtools', notice?.kind === 'error' && notice.line ? [{
      startLineNumber: notice.line,
      startColumn: notice.column || 1,
      endLineNumber: notice.line,
      endColumn: (notice.column || 1) + 1,
      message: notice.message,
      severity: monaco.MarkerSeverity.Error,
    }] : [])
  }, [notice])

  return <section className="editor-panel" aria-label={label}>
    <div className="panel-label"><span>{label}</span><span>{value.length.toLocaleString()} chars</span></div>
    <Editor
      defaultValue={value}
      onChange={handleChange}
      language={language}
      theme={theme}
      onMount={onMount}
      loading={<div className="editor-loading">Loading editor…</div>}
      options={options}
    />
  </section>
}

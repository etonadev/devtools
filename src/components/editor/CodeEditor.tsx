import Editor, { type OnMount } from '@monaco-editor/react'
import { useEffect, useRef } from 'react'
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

export function CodeEditor({ value, onChange, language, label, readOnly = false, wordWrap, indent, notice }: CodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const onMount: OnMount = (instance) => { editorRef.current = instance }

  useEffect(() => {
    const instance = editorRef.current
    const model = instance?.getModel()
    if (!instance || !model) return
    const monaco = (window as unknown as { monaco?: typeof import('monaco-editor') }).monaco
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
      value={value}
      onChange={(next) => onChange?.(next ?? '')}
      language={language}
      theme={document.documentElement.dataset.theme === 'light' ? 'light' : 'vs-dark'}
      onMount={onMount}
      loading={<div className="editor-loading">Loading editor…</div>}
      options={{
        readOnly,
        minimap: { enabled: false },
        fontSize: 14,
        fontFamily: '"JetBrains Mono", "Cascadia Code", Consolas, monospace',
        lineHeight: 22,
        lineNumbersMinChars: 3,
        automaticLayout: true,
        bracketPairColorization: { enabled: true },
        matchBrackets: 'always',
        tabSize: indent === 'tab' ? 4 : indent,
        insertSpaces: indent !== 'tab',
        wordWrap: wordWrap ? 'on' : 'off',
        scrollBeyondLastLine: false,
        padding: { top: 12, bottom: 12 },
        ariaLabel: label,
      }}
    />
  </section>
}

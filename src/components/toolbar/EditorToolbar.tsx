import { CheckCircle2, Clipboard, Code2, Download, Eraser, Expand, FileDown, FileUp, Minimize2, Play, RotateCcw, WrapText } from 'lucide-react'
import { useRef } from 'react'
import type { Indent, ToolId } from '../../types/tools'

interface ToolbarProps {
  toolId: ToolId; extensions: string[]; busy: boolean; indent: Indent; wordWrap: boolean; fullscreen: boolean
  onFormat: () => void; onMinify?: () => void; onValidate?: () => void; onCopy: () => void; onUpload: (file: File) => void
  onDownload: () => void; onClear: () => void; onExample: () => void; onReset: () => void; onIndent: (indent: Indent) => void
  onWordWrap: () => void; onFullscreen: () => void
}

export function EditorToolbar(props: ToolbarProps) {
  const input = useRef<HTMLInputElement>(null)
  return <div className="toolbar" aria-label="Editor actions">
    <div className="toolbar-group primary-actions">
      <button className="primary-button" disabled={props.busy} onClick={props.onFormat}><Play size={15} fill="currentColor" />{props.busy ? 'Working…' : 'Format'}</button>
      {props.onMinify && <button onClick={props.onMinify}><Minimize2 size={16} />Minify</button>}
      {props.onValidate && <button onClick={props.onValidate}><CheckCircle2 size={16} />Validate</button>}
      <button onClick={props.onCopy}><Clipboard size={16} />Copy</button>
    </div>
    <div className="toolbar-group file-actions">
      <button onClick={() => input.current?.click()}><FileUp size={16} />Upload</button>
      <input ref={input} type="file" hidden accept={props.extensions.join(',')} onChange={(event) => { const file = event.target.files?.[0]; if (file) props.onUpload(file); event.currentTarget.value = '' }} />
      <button onClick={props.onDownload}><Download size={16} />Download</button>
      <button onClick={props.onClear}><Eraser size={16} />Clear</button>
    </div>
    <div className="toolbar-group settings-actions">
      <label>Indent<select value={props.indent} onChange={(event) => props.onIndent(event.target.value === 'tab' ? 'tab' : Number(event.target.value) as Indent)}><option value="2">2 spaces</option><option value="4">4 spaces</option><option value="tab">Tabs</option></select></label>
      <button className={props.wordWrap ? 'pressed' : ''} aria-pressed={props.wordWrap} onClick={props.onWordWrap} title="Toggle word wrapping"><WrapText size={16} /><span>Wrap</span></button>
      <button onClick={props.onExample}><Code2 size={16} /><span>Example</span></button>
      <button onClick={props.onReset}><RotateCcw size={16} /><span>Reset</span></button>
      <button onClick={props.onFullscreen}>{props.fullscreen ? <FileDown size={16} /> : <Expand size={16} />}<span>{props.fullscreen ? 'Exit' : 'Fullscreen'}</span></button>
    </div>
  </div>
}

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, Eye, FileText, Info, LockKeyhole, PanelLeft, SplitSquareHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toolById, tools } from '../../app/config'
import { CodeEditor } from '../../components/editor/CodeEditor'
import { JsonTree } from '../../components/editor/JsonTree'
import { MarkdownPreview } from '../../components/editor/MarkdownPreview'
import { SplitWorkspace } from '../../components/editor/SplitWorkspace'
import { Seo } from '../../components/common/Seo'
import { EditorToolbar } from '../../components/toolbar/EditorToolbar'
import { copyText } from '../../services/clipboard'
import { downloadText, readLocalFile } from '../../services/files'
import { analyticsService } from '../../services/analytics/AnalyticsService'
import seoMetadata from '../../app/seo.json'
import type { FormatOptions, Indent, Notice, ProcessResult, ToolId, ValidationResult } from '../../types/tools'

async function formatTool(id: ToolId, input: string, options: FormatOptions): Promise<ProcessResult> {
  switch (id) {
    case 'json': return (await import('../../services/formatting/json')).formatJson(input, options)
    case 'yaml': return (await import('../../services/formatting/yaml')).formatYaml(input, options)
    case 'xml': return (await import('../../services/formatting/xml')).formatXml(input, options)
    case 'sql': return (await import('../../services/formatting/sql')).formatSql(input, options)
    case 'markdown': return (await import('../../services/formatting/markdown')).formatMarkdown(input, options)
  }
}

async function minifyTool(id: ToolId, input: string): Promise<ProcessResult> {
  if (id === 'json') return (await import('../../services/formatting/json')).minifyJson(input)
  if (id === 'xml') return (await import('../../services/formatting/xml')).minifyXml(input)
  throw new Error('Minification is not available for this tool.')
}

async function validateTool(id: ToolId, input: string): Promise<ValidationResult> {
  if (id === 'json') return (await import('../../services/formatting/json')).validateJson(input)
  if (id === 'yaml') return (await import('../../services/formatting/yaml')).validateYaml(input)
  if (id === 'xml') return (await import('../../services/formatting/xml')).validateXml(input)
  throw new Error('Validation is not available for this tool.')
}

export function ToolPage({ id }: { id: ToolId }) {
  const tool = toolById[id]
  const [input, setInput] = useState(tool.example)
  const [output, setOutput] = useState('')
  const [notice, setNotice] = useState<Notice>({ kind: 'info', message: 'Ready. Your input stays in this browser.' })
  const [indent, setIndent] = useState<Indent>(2)
  const [wordWrap, setWordWrap] = useState(true)
  const [busy, setBusy] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [panelMode, setPanelMode] = useState<'split' | 'input' | 'output'>('split')
  const [resultMode, setResultMode] = useState<'code' | 'tree'>('code')
  const [dialect, setDialect] = useState('sql')
  const [keywordCase, setKeywordCase] = useState<'upper' | 'lower' | 'preserve'>('upper')
  const [treeValue, setTreeValue] = useState<unknown>()
  const options: FormatOptions = { indent, dialect, keywordCase }

  const run = useCallback(async (action: () => Promise<ProcessResult>) => {
    if (!input.trim()) {
      setNotice({ kind: 'error', message: 'Paste or type a document first.' })
      analyticsService.trackToolAction('format_executed', tool.shortName, 'error')
      analyticsService.trackToolAction('formatting_error', tool.shortName, 'error')
      return
    }
    setBusy(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 0))
      const result = await action()
      setOutput(result.output)
      setNotice(result.notice)
      analyticsService.trackToolAction('format_executed', tool.shortName, 'success')
      if (id === 'json') { const valid = await validateTool('json', result.output); setTreeValue(valid.value) }
    } catch (error) {
      const typed = error as Error & { line?: number; column?: number }
      setNotice({ kind: 'error', message: typed.message || 'Processing failed. Your input has not been changed.', line: typed.line, column: typed.column })
      analyticsService.trackToolAction('format_executed', tool.shortName, 'error')
      analyticsService.trackToolAction('formatting_error', tool.shortName, 'error')
    } finally { setBusy(false) }
  }, [id, input, tool.shortName])

  const validate = async () => {
    try {
      const result = await validateTool(id, input)
      setNotice(result.notice)
      analyticsService.trackToolAction('validation_executed', tool.shortName, result.valid ? 'success' : 'error')
      if (id === 'json' && result.valid) setTreeValue(result.value)
    } catch {
      setNotice({ kind: 'error', message: 'Validation failed. Your input has not been changed.' })
      analyticsService.trackToolAction('validation_executed', tool.shortName, 'error')
    }
  }

  useEffect(() => { analyticsService.trackToolAction('tool_opened', tool.shortName, 'success') }, [tool.shortName])

  const rightPanel = useMemo(() => {
    if (id === 'markdown') return <section className="editor-panel preview-panel" aria-label="Markdown preview"><div className="panel-label"><span>Safe preview</span><span>GFM</span></div><MarkdownPreview source={input} /></section>
    if (id === 'json' && resultMode === 'tree') return <section className="editor-panel"><div className="panel-label"><span>Tree view</span><span>{treeValue ? 'Parsed' : 'Format or validate first'}</span></div>{treeValue ? <JsonTree value={treeValue} /> : <div className="empty-panel"><FileText size={28} /><p>Format or validate the JSON to explore its structure.</p></div>}</section>
    return <CodeEditor value={output} language={tool.language} label="Output" readOnly wordWrap={wordWrap} indent={indent} />
  }, [id, input, output, resultMode, tool.language, treeValue, wordWrap, indent])

  const related = tools.filter((item) => item.id !== id).slice(0, 3)
  const statusIcon = notice.kind === 'success' ? <CheckCircle2 size={17} /> : notice.kind === 'error' ? <AlertCircle size={17} /> : <Info size={17} />

  return <main className={fullscreen ? 'tool-page fullscreen' : 'tool-page'}>
    <Seo title={seoMetadata.pages[id].title} description={seoMetadata.pages[id].description} path={seoMetadata.pages[id].path} />
    <section className="tool-heading">
      <div><p className="eyebrow"><tool.icon size={14} /> Developer workbench</p><h1>{tool.name}</h1><p>{tool.intro}</p></div>
      <div className="privacy-pill"><LockKeyhole size={16} /><span><strong>Local by default</strong>Your code and documents are processed locally in your browser.</span></div>
    </section>
    <section className="workbench" aria-label={`${tool.shortName} workbench`}>
      <EditorToolbar
        toolId={id} extensions={tool.extensions} busy={busy} indent={indent} wordWrap={wordWrap} fullscreen={fullscreen}
        onFormat={() => run(() => formatTool(id, input, options))}
        onMinify={id === 'json' || id === 'xml' ? () => run(() => minifyTool(id, input)) : undefined}
        onValidate={id === 'json' || id === 'yaml' || id === 'xml' ? validate : undefined}
        onCopy={async () => { try { await copyText(output || input); setNotice({ kind: 'success', message: 'Copied to clipboard.' }); analyticsService.trackToolAction('copy_to_clipboard', tool.shortName, 'success') } catch (error) { setNotice({ kind: 'error', message: (error as Error).message }); analyticsService.trackToolAction('copy_to_clipboard', tool.shortName, 'error') } }}
        onUpload={async (file) => { try { const content = await readLocalFile(file, tool.extensions); setInput(content); setOutput(''); setNotice({ kind: 'success', message: `${file.name} loaded locally.` }); analyticsService.trackToolAction('file_uploaded', tool.shortName, 'success') } catch (error) { setNotice({ kind: 'error', message: (error as Error).message }); analyticsService.trackToolAction('file_uploaded', tool.shortName, 'error') } }}
        onDownload={() => { const content = output || input; if (!content) { setNotice({ kind: 'error', message: 'There is nothing to download yet.' }); analyticsService.trackToolAction('file_downloaded', tool.shortName, 'error'); return }; try { downloadText(content, tool.filename); setNotice({ kind: 'success', message: `${tool.filename} downloaded.` }); analyticsService.trackToolAction('file_downloaded', tool.shortName, 'success') } catch { setNotice({ kind: 'error', message: 'The browser could not download this file.' }); analyticsService.trackToolAction('file_downloaded', tool.shortName, 'error') } }}
        onClear={() => { setInput(''); setOutput(''); setTreeValue(undefined); setNotice({ kind: 'info', message: 'Editors cleared.' }) }}
        onExample={() => { setInput(tool.example); setOutput(''); setNotice({ kind: 'info', message: 'Example loaded.' }) }}
        onReset={() => { setInput(tool.example); setOutput(''); setIndent(2); setDialect('sql'); setKeywordCase('upper'); setPanelMode('split'); setNotice({ kind: 'info', message: 'Tool reset to its default example.' }) }}
        onIndent={setIndent} onWordWrap={() => setWordWrap(!wordWrap)} onFullscreen={() => setFullscreen(!fullscreen)}
      />
      <div className="tool-options">
        {id === 'sql' && <><label>Dialect<select value={dialect} onChange={(event) => setDialect(event.target.value)}><option value="sql">Standard SQL</option><option value="mysql">MySQL</option><option value="mariadb">MariaDB</option><option value="postgresql">PostgreSQL</option><option value="transactsql">SQL Server / T-SQL</option><option value="sqlite">SQLite</option></select></label><label>Keywords<select value={keywordCase} onChange={(event) => setKeywordCase(event.target.value as typeof keywordCase)}><option value="upper">UPPERCASE</option><option value="lower">lowercase</option><option value="preserve">Preserve</option></select></label></>}
        {id === 'json' && <div className="segmented"><button className={resultMode === 'code' ? 'active' : ''} onClick={() => setResultMode('code')}><FileText size={15} />Code</button><button className={resultMode === 'tree' ? 'active' : ''} onClick={() => setResultMode('tree')}><PanelLeft size={15} />Tree</button></div>}
        {id === 'markdown' && <div className="segmented"><button className={panelMode === 'input' ? 'active' : ''} onClick={() => setPanelMode('input')}><PanelLeft size={15} />Editor</button><button className={panelMode === 'split' ? 'active' : ''} onClick={() => setPanelMode('split')}><SplitSquareHorizontal size={15} />Split</button><button className={panelMode === 'output' ? 'active' : ''} onClick={() => setPanelMode('output')}><Eye size={15} />Preview</button></div>}
      </div>
      <SplitWorkspace mode={panelMode} onModeChange={setPanelMode} input={<CodeEditor value={input} onChange={(value) => { setInput(value); if (notice.kind === 'error') setNotice({ kind: 'info', message: 'Input changed. Ready to try again.' }) }} language={tool.language} label="Input" wordWrap={wordWrap} indent={indent} notice={notice} />} output={rightPanel} />
      <div className={`status-bar ${notice.kind}`} role={notice.kind === 'error' ? 'alert' : 'status'}>{statusIcon}<span>{notice.message}{notice.line ? ` Line ${notice.line}${notice.column ? `, column ${notice.column}` : ''}.` : ''}</span></div>
    </section>
    {!fullscreen && <section className="tool-content">
      <div><p className="eyebrow">What it does</p><h2>About the {tool.name}</h2><p className="tool-about">{tool.about}</p><ul className="feature-list">{tool.features.map((feature) => <li key={feature}><CheckCircle2 size={17} />{feature}</li>)}</ul></div>
      <div><p className="eyebrow">How to use it</p><h2>How to use the {tool.shortName} tool</h2><ol className="steps">{tool.instructions.map((instruction, index) => <li key={instruction}><span>{index + 1}</span>{instruction}</li>)}</ol></div>
    </section>}
    {!fullscreen && <section className="faq-section"><p className="eyebrow">{tool.shortName} help</p><h2>Frequently Asked Questions</h2><div className="faq-grid">{tool.faqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</div><div className="related"><span>Related tools</span>{related.map((item) => <Link key={item.id} to={item.path}>{item.shortName}<span aria-hidden>↗</span></Link>)}</div></section>}
  </main>
}

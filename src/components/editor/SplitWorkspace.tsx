import { useRef, useState, type ReactNode } from 'react'

interface SplitWorkspaceProps { input: ReactNode; output: ReactNode; mode?: 'split' | 'input' | 'output'; onModeChange?: (mode: 'split' | 'input' | 'output') => void }

export function SplitWorkspace({ input, output, mode = 'split', onModeChange }: SplitWorkspaceProps) {
  const [ratio, setRatio] = useState(50)
  const ref = useRef<HTMLDivElement>(null)
  const drag = (event: React.PointerEvent) => {
    const startX = event.clientX
    const start = ratio
    const width = ref.current?.clientWidth || 1
    const move = (moveEvent: PointerEvent) => setRatio(Math.min(72, Math.max(28, start + ((moveEvent.clientX - startX) / width) * 100)))
    const stop = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', stop) }
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', stop)
  }
  return <>
    <div className="mobile-panel-tabs" role="tablist">
      <button role="tab" aria-selected={mode !== 'output'} onClick={() => onModeChange?.('input')}>Input</button>
      <button role="tab" aria-selected={mode === 'output'} onClick={() => onModeChange?.('output')}>Output / preview</button>
    </div>
    <div ref={ref} className={`split-workspace mode-${mode}`} style={{ '--split': `${ratio}%` } as React.CSSProperties}>
      <div className="split-input">{input}</div>
      {mode === 'split' && <button className="splitter" onPointerDown={drag} aria-label="Resize input and output panels" />}
      <div className="split-output">{output}</div>
    </div>
  </>
}

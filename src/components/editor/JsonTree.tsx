import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { treeScalar } from '../../services/formatting/json'

function TreeNode({ label, value, depth = 0 }: { label: string; value: unknown; depth?: number }) {
  const [open, setOpen] = useState(depth < 2)
  const entries = value && typeof value === 'object' ? Object.entries(value as Record<string, unknown>) : null
  if (!entries) return <div className="tree-row" style={{ paddingLeft: `${depth * 18 + 10}px` }}><span className="tree-key">{label}</span><span className={`tree-value type-${typeof value}`}>{treeScalar(value)}</span></div>
  const kind = Array.isArray(value) ? 'items' : 'keys'
  return <div><button className="tree-row tree-branch" style={{ paddingLeft: `${depth * 18 + 4}px` }} onClick={() => setOpen(!open)} aria-expanded={open}><ChevronRight size={15} className={open ? 'rotated' : ''} /><span className="tree-key">{label}</span><span className="tree-count">{entries.length} {kind}</span></button>{open && entries.map(([key, child]) => <TreeNode key={key} label={Array.isArray(value) ? `[${key}]` : key} value={child} depth={depth + 1} />)}</div>
}

export function JsonTree({ value }: { value: unknown }) { return <div className="json-tree"><TreeNode label="root" value={value} /></div> }

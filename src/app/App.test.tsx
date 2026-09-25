import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { App } from './App'

vi.mock('@monaco-editor/react', () => ({ default: ({ value, defaultValue, onChange, options }: { value?: string; defaultValue?: string; onChange?: (value: string) => void; options?: { ariaLabel?: string } }) => <textarea aria-label={options?.ariaLabel} value={value ?? defaultValue ?? ''} onChange={(event) => onChange?.(event.target.value)} /> }))

describe('application UI', () => {
  it('renders navigation and opens every tool link', async () => {
    render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>)
    expect(await screen.findByRole('heading', { name: /shape messy data/i })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /JSON/i }).length).toBeGreaterThan(0)
  })
  it('clears editor input without crashing', async () => {
    render(<MemoryRouter initialEntries={['/json-formatter']}><App /></MemoryRouter>)
    const input = await screen.findByRole('textbox', { name: 'Input' })
    expect(input).not.toHaveValue('')
    fireEvent.click(screen.getByRole('button', { name: /clear/i }))
    expect(input).toHaveValue('')
  })
  it('toggles and persists an explicit light or dark theme', async () => {
    render(<MemoryRouter><App /></MemoryRouter>)
    const button = await screen.findByRole('button', { name: /switch to/i })
    fireEvent.click(button)
    expect(localStorage.getItem('devtools-theme')).toMatch(/^(light|dark)$/)
  })
  it('offers the active support option without exposing pending GitHub Sponsors', async () => {
    render(<MemoryRouter initialEntries={['/support']}><App /></MemoryRouter>)
    expect(await screen.findByRole('heading', { name: 'Support DevMaster Tools' })).toBeInTheDocument()
    const coffee = screen.getByRole('link', { name: /Buy Me a Coffee \(opens in a new tab\)/i })
    expect(coffee).toHaveAttribute('href', 'https://buymeacoffee.com/etonadev')
    expect(coffee).toHaveAttribute('target', '_blank')
    expect(coffee).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.queryByRole('link', { name: /GitHub/i })).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Support options' })).toHaveClass('single')
  })
})

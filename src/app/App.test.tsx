import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { App } from './App'

vi.mock('@monaco-editor/react', () => ({ default: ({ value, onChange, options }: { value: string; onChange?: (value: string) => void; options?: { ariaLabel?: string } }) => <textarea aria-label={options?.ariaLabel} value={value} onChange={(event) => onChange?.(event.target.value)} /> }))

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
  it('cycles the theme preference', async () => {
    render(<MemoryRouter><App /></MemoryRouter>)
    const button = await screen.findByRole('button', { name: /change theme/i })
    fireEvent.click(button)
    expect(localStorage.getItem('devtools-theme')).toBeTruthy()
  })
})

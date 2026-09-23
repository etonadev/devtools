import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MarkdownPreview } from './MarkdownPreview'

describe('MarkdownPreview', () => {
  it('renders GFM tables and task lists', () => {
    const { container } = render(<MarkdownPreview source={'- [x] safe\n\n| A | B |\n|---|---|\n|1|2|'} />)
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(container.querySelector('input[type="checkbox"]')).toBeDisabled()
  })

  it('does not render unsafe raw HTML or scripts', () => {
    const { container } = render(<MarkdownPreview source={'<script>alert(1)</script><img src=x onerror=alert(2)>'} />)
    expect(container.querySelector('script')).not.toBeInTheDocument()
    expect(container.querySelector('img')).not.toBeInTheDocument()
  })

  it('does not request remote Markdown images', () => {
    const { container } = render(<MarkdownPreview source={'![Private diagram](https://example.com/private.png)'} />)
    expect(container.querySelector('img')).not.toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Private diagram' })).toHaveTextContent('Private diagram')
  })
})

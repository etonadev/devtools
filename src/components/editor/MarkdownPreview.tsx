import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'

export function MarkdownPreview({ source }: { source: string }) {
  return <article className="markdown-preview"><ReactMarkdown
    remarkPlugins={[remarkGfm]}
    rehypePlugins={[rehypeSanitize]}
    skipHtml
    components={{
      img: ({ src, alt }) => {
        const imageSource = typeof src === 'string' ? src : ''
        if (/^(https?:)?\/\//i.test(imageSource)) return <span className="blocked-image" role="img" aria-label={alt || 'Remote image blocked'}>{alt || 'Remote image blocked'}</span>
        return <img src={imageSource} alt={alt || ''} />
      },
    }}
  >{source}</ReactMarkdown></article>
}

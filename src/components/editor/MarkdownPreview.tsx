import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'

export function MarkdownPreview({ source }: { source: string }) {
  return <article className="markdown-preview"><ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]} skipHtml>{source}</ReactMarkdown></article>
}

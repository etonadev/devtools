import { useEffect } from 'react'
import { PRODUCT_NAME, SITE_URL } from '../../app/config'

interface SeoProps { title: string; description: string; path: string }

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) { element = document.createElement('meta'); document.head.appendChild(element) }
  Object.entries(attributes).forEach(([key, value]) => element!.setAttribute(key, value))
}

export function Seo({ title, description, path }: SeoProps) {
  useEffect(() => {
    document.title = title.includes(PRODUCT_NAME) ? title : `${title} | ${PRODUCT_NAME}`
    upsertMeta('meta[name="description"]', { name: 'description', content: description })
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: document.title })
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description })
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' })
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical) }
    canonical.href = SITE_URL ? `${SITE_URL}${path}` : window.location.href
  }, [title, description, path])
  return null
}

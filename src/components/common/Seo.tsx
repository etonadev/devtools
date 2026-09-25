import { useEffect } from 'react'
import { PRODUCT_NAME, SITE_URL } from '../../app/config'
import seoMetadata from '../../app/seo.json'

const freeOffer = { '@type': 'Offer', price: '0', priceCurrency: 'USD' }

interface SeoProps { title: string; description: string; path: string }

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) { element = document.createElement('meta'); document.head.appendChild(element) }
  Object.entries(attributes).forEach(([key, value]) => element!.setAttribute(key, value))
}

function absoluteUrl(path: string) {
  return `${SITE_URL}${path === '/' ? '/' : path}`
}

function structuredData(title: string, description: string, path: string) {
  const url = absoluteUrl(path)
  const websiteId = `${SITE_URL}/#website`
  if (path === '/') {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'WebSite', '@id': websiteId, name: PRODUCT_NAME, url, description, inLanguage: 'en' },
        { '@type': 'WebApplication', name: PRODUCT_NAME, url, description, applicationCategory: 'DeveloperApplication', operatingSystem: 'Any', browserRequirements: 'Requires a modern web browser', isAccessibleForFree: true, offers: freeOffer, isPartOf: { '@id': websiteId } },
      ],
    }
  }
  return path.endsWith('-formatter') || path === '/markdown-editor'
    ? { '@context': 'https://schema.org', '@type': 'WebApplication', name: title.split(' | ')[0], url, description, applicationCategory: 'DeveloperApplication', operatingSystem: 'Any', browserRequirements: 'Requires a modern web browser', isAccessibleForFree: true, offers: freeOffer, isPartOf: { '@id': websiteId } }
    : { '@context': 'https://schema.org', '@type': 'WebPage', name: title, url, description, inLanguage: 'en', isPartOf: { '@id': websiteId } }
}

export function Seo({ title, description, path }: SeoProps) {
  useEffect(() => {
    const pageUrl = absoluteUrl(path)
    const imageUrl = absoluteUrl(seoMetadata.site.imagePath)
    document.documentElement.lang = seoMetadata.site.language
    document.title = title
    upsertMeta('meta[name="description"]', { name: 'description', content: description })
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title })
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description })
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: imageUrl })
    upsertMeta('meta[property="og:image:width"]', { property: 'og:image:width', content: '1200' })
    upsertMeta('meta[property="og:image:height"]', { property: 'og:image:height', content: '630' })
    upsertMeta('meta[property="og:image:alt"]', { property: 'og:image:alt', content: seoMetadata.site.imageAlt })
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: pageUrl })
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' })
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: PRODUCT_NAME })
    upsertMeta('meta[property="og:locale"]', { property: 'og:locale', content: seoMetadata.site.locale })
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title })
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description })
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: imageUrl })
    upsertMeta('meta[name="twitter:image:alt"]', { name: 'twitter:image:alt', content: seoMetadata.site.imageAlt })
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical) }
    canonical.href = pageUrl
    let jsonLd = document.head.querySelector<HTMLScriptElement>('#devmastertools-structured-data')
    if (!jsonLd) { jsonLd = document.createElement('script'); jsonLd.id = 'devmastertools-structured-data'; jsonLd.type = 'application/ld+json'; document.head.appendChild(jsonLd) }
    jsonLd.textContent = JSON.stringify(structuredData(title, description, path))
  }, [title, description, path])
  return null
}

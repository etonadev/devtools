import { beforeEach, describe, expect, it } from 'vitest'
import { AnalyticsService, type AnalyticsConfig } from './AnalyticsService'

const enabledConfig: AnalyticsConfig = {
  enabled: true,
  production: true,
  ga4MeasurementId: 'G-DEVTOOLS1',
  cloudflareToken: 'public-cloudflare-token',
}

describe('AnalyticsService', () => {
  beforeEach(() => {
    localStorage.clear()
    document.getElementById('devtools-ga4')?.remove()
    document.getElementById('devtools-cloudflare-analytics')?.remove()
    delete window.gtag
    delete window.dataLayer
  })

  it('stays inactive before consent', () => {
    const service = new AnalyticsService(enabledConfig)
    service.trackToolAction('format_executed', 'JSON', 'success')
    expect(window.dataLayer).toBeUndefined()
    expect(document.getElementById('devtools-ga4')).toBeNull()
  })

  it('loads both configured providers only after consent', () => {
    const service = new AnalyticsService(enabledConfig)
    service.setConsent('granted')
    expect(document.getElementById('devtools-ga4')).toHaveAttribute('src', expect.stringContaining('G-DEVTOOLS1'))
    expect(document.getElementById('devtools-cloudflare-analytics')).toHaveAttribute('src', 'https://static.cloudflareinsights.com/beacon.min.js')
  })

  it('sends only controlled tool and result fields', () => {
    const service = new AnalyticsService(enabledConfig)
    service.setConsent('granted')
    service.trackToolAction('file_uploaded', 'YAML', 'success')
    const event = window.dataLayer?.find((entry) => entry[0] === 'event' && entry[1] === 'file_uploaded')
    expect(event).toEqual(['event', 'file_uploaded', { tool_name: 'YAML', action_result: 'success' }])
    expect(JSON.stringify(event)).not.toContain('filename')
    expect(JSON.stringify(event)).not.toContain('content')
  })

  it('deduplicates SPA page views and strips query data', () => {
    const service = new AnalyticsService(enabledConfig)
    service.setConsent('granted')
    service.trackPageView('/json-formatter?token=secret', 'JSON')
    service.trackPageView('/json-formatter?token=another', 'JSON')
    const pageViews = window.dataLayer?.filter((entry) => entry[0] === 'event' && entry[1] === 'page_view') || []
    expect(pageViews).toHaveLength(1)
    expect(JSON.stringify(pageViews[0])).not.toContain('secret')
    expect(pageViews[0]?.[2]).toMatchObject({ page_path: '/json-formatter' })
  })

  it('never throws when a provider fails', () => {
    const service = new AnalyticsService(enabledConfig)
    service.setConsent('granted')
    window.gtag = () => { throw new Error('blocked') }
    expect(() => service.trackToolAction('copy_to_clipboard', 'XML', 'success')).not.toThrow()
    expect(() => service.trackPageView('/xml-formatter', 'XML')).not.toThrow()
  })

  it('remains disabled outside production', () => {
    const service = new AnalyticsService({ ...enabledConfig, production: false })
    service.setConsent('granted')
    expect(service.isConfigured()).toBe(false)
    expect(document.getElementById('devtools-ga4')).toBeNull()
  })
})

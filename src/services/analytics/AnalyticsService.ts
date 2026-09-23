export type AnalyticsResult = 'success' | 'error'
export type ToolAnalyticsAction =
  | 'tool_opened'
  | 'format_executed'
  | 'validation_executed'
  | 'formatting_error'
  | 'file_uploaded'
  | 'file_downloaded'
  | 'copy_to_clipboard'

export interface AnalyticsConfig {
  production: boolean
  ga4MeasurementId?: string
  cloudflareToken?: string
}

declare global {
  interface Window {
    dataLayer?: unknown[][]
    gtag?: (...args: unknown[]) => void
  }
}

const GA_SCRIPT_ID = 'devtools-ga4'
const CF_SCRIPT_ID = 'devtools-cloudflare-analytics'

function defaultConfig(): AnalyticsConfig {
  return {
    production: import.meta.env.PROD,
    ga4MeasurementId: import.meta.env.VITE_GA4_MEASUREMENT_ID,
    cloudflareToken: import.meta.env.VITE_CLOUDFLARE_ANALYTICS_TOKEN,
  }
}

export class AnalyticsService {
  private initialized = false
  private lastPagePath = ''

  constructor(private readonly config: AnalyticsConfig = defaultConfig()) {}

  isConfigured(): boolean {
    return this.config.production && Boolean(this.validGaId() || this.config.cloudflareToken?.trim())
  }

  initialize(): void {
    if (this.initialized || !this.canCollect()) return
    this.initialized = true
    try {
      this.initializeGoogleAnalytics()
      this.initializeCloudflareAnalytics()
    } catch {
      // Analytics must never affect the application.
    }
  }

  trackPageView(pathname: string, title: string): void {
    if (!this.canCollect()) return
    const pagePath = this.sanitizePath(pathname)
    if (pagePath === this.lastPagePath) return
    this.lastPagePath = pagePath
    try {
      this.initialize()
      if (!this.validGaId() || !window.gtag) return
      window.gtag('event', 'page_view', {
        page_title: title,
        page_path: pagePath,
        page_location: `${window.location.origin}${pagePath}`,
      })
    } catch {
      // A blocked analytics request must remain invisible to the product flow.
    }
  }

  trackToolAction(action: ToolAnalyticsAction, tool: string, result: AnalyticsResult): void {
    if (!this.canCollect()) return
    try {
      this.initialize()
      if (!this.validGaId() || !window.gtag) return
      window.gtag('event', action, {
        tool_name: tool,
        action_result: result,
      })
    } catch {
      // Analytics failures are intentionally isolated.
    }
  }

  private canCollect(): boolean {
    return this.isConfigured()
  }

  private validGaId(): string | undefined {
    const id = this.config.ga4MeasurementId?.trim()
    return id && /^G-[A-Z0-9]+$/i.test(id) ? id : undefined
  }

  private sanitizePath(pathname: string): string {
    const pathOnly = pathname.split(/[?#]/, 1)[0]
    return pathOnly.startsWith('/') ? pathOnly : '/'
  }

  private ensureGtag(): void {
    window.dataLayer = window.dataLayer || []
    window.gtag = window.gtag || ((...args: unknown[]) => { window.dataLayer!.push(args) })
  }

  private initializeGoogleAnalytics(): void {
    const measurementId = this.validGaId()
    if (!measurementId || document.getElementById(GA_SCRIPT_ID)) return
    this.ensureGtag()
    window.gtag!('consent', 'default', {
      analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
    })
    window.gtag!('js', new Date())
    window.gtag!('config', measurementId, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    })
    const script = document.createElement('script')
    script.id = GA_SCRIPT_ID
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`
    script.onerror = () => { /* Provider blocking is non-fatal. */ }
    document.head.appendChild(script)
  }

  private initializeCloudflareAnalytics(): void {
    const token = this.config.cloudflareToken?.trim()
    const existingBeacon = document.querySelector('script[src*="static.cloudflareinsights.com/beacon.min.js"]')
    if (!token || document.getElementById(CF_SCRIPT_ID) || existingBeacon) return
    const script = document.createElement('script')
    script.id = CF_SCRIPT_ID
    script.type = 'module'
    script.src = 'https://static.cloudflareinsights.com/beacon.min.js'
    script.dataset.cfBeacon = JSON.stringify({ token, spa: true })
    script.onerror = () => { /* Provider blocking is non-fatal. */ }
    document.body.appendChild(script)
  }

}

export const analyticsService = new AnalyticsService()

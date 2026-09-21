export type AnalyticsConsent = 'unknown' | 'granted' | 'denied'
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
  enabled: boolean
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

const CONSENT_KEY = 'devtools-analytics-consent'
const GA_SCRIPT_ID = 'devtools-ga4'
const CF_SCRIPT_ID = 'devtools-cloudflare-analytics'

function defaultConfig(): AnalyticsConfig {
  return {
    enabled: import.meta.env.VITE_ANALYTICS_ENABLED === 'true',
    production: import.meta.env.PROD,
    ga4MeasurementId: import.meta.env.VITE_GA4_MEASUREMENT_ID,
    cloudflareToken: import.meta.env.VITE_CLOUDFLARE_ANALYTICS_TOKEN,
  }
}

function safeStoredConsent(): AnalyticsConsent {
  try {
    const stored = localStorage.getItem(CONSENT_KEY)
    return stored === 'granted' || stored === 'denied' ? stored : 'unknown'
  } catch {
    return 'unknown'
  }
}

export class AnalyticsService {
  private consent: AnalyticsConsent
  private initialized = false
  private lastPagePath = ''
  private listeners = new Set<(consent: AnalyticsConsent) => void>()

  constructor(private readonly config: AnalyticsConfig = defaultConfig()) {
    this.consent = safeStoredConsent()
  }

  getConsent(): AnalyticsConsent { return this.consent }

  isConfigured(): boolean {
    return this.config.production && this.config.enabled && Boolean(this.validGaId() || this.config.cloudflareToken)
  }

  subscribe(listener: (consent: AnalyticsConsent) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  setConsent(consent: Exclude<AnalyticsConsent, 'unknown'>): void {
    this.consent = consent
    try { localStorage.setItem(CONSENT_KEY, consent) } catch { /* Preference storage is optional. */ }
    if (consent === 'granted') this.initialize()
    else this.disableGoogleConsent()
    this.listeners.forEach((listener) => listener(consent))
  }

  resetConsent(): void {
    this.consent = 'unknown'
    try { localStorage.removeItem(CONSENT_KEY) } catch { /* Preference storage is optional. */ }
    this.disableGoogleConsent()
    this.listeners.forEach((listener) => listener('unknown'))
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
    return this.isConfigured() && this.consent === 'granted'
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
    window.gtag!('consent', 'update', {
      analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
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
    if (!token || document.getElementById(CF_SCRIPT_ID)) return
    const script = document.createElement('script')
    script.id = CF_SCRIPT_ID
    script.type = 'module'
    script.src = 'https://static.cloudflareinsights.com/beacon.min.js'
    script.dataset.cfBeacon = JSON.stringify({ token, spa: true })
    script.onerror = () => { /* Provider blocking is non-fatal. */ }
    document.body.appendChild(script)
  }

  private disableGoogleConsent(): void {
    try {
      if (!window.gtag) return
      window.gtag('consent', 'update', {
        analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
      })
    } catch {
      // Consent changes must never break the UI.
    }
  }
}

export const analyticsService = new AnalyticsService()

import { useEffect, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { analyticsService, type AnalyticsConsent } from '../../services/analytics/AnalyticsService'

export function AnalyticsManager({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [consent, setConsent] = useState<AnalyticsConsent>(() => analyticsService.getConsent())

  useEffect(() => analyticsService.subscribe(setConsent), [])
  useEffect(() => {
    if (consent !== 'granted') return
    const timer = window.setTimeout(() => analyticsService.trackPageView(location.pathname, document.title), 0)
    return () => window.clearTimeout(timer)
  }, [consent, location.pathname])

  return <>
    {children}
    {analyticsService.isConfigured() && consent === 'unknown' && <aside className="consent-banner" aria-labelledby="analytics-consent-title">
      <ShieldCheck size={22} aria-hidden />
      <div><strong id="analytics-consent-title">Optional analytics</strong><p>Allow anonymous traffic, performance, and tool-action measurement? Document contents and uploaded files are never collected.</p></div>
      <div className="consent-actions"><button onClick={() => analyticsService.setConsent('denied')}>Decline</button><button className="primary-button" onClick={() => analyticsService.setConsent('granted')}>Allow analytics</button></div>
    </aside>}
  </>
}

export function AnalyticsPreferencesButton() {
  if (!analyticsService.isConfigured()) return null
  return <button className="footer-button" onClick={() => { analyticsService.resetConsent(); window.location.reload() }}>Analytics preferences</button>
}

import { useEffect, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { analyticsService } from '../../services/analytics/AnalyticsService'

export function AnalyticsManager({ children }: { children: ReactNode }) {
  const location = useLocation()
  useEffect(() => {
    const timer = window.setTimeout(() => analyticsService.trackPageView(location.pathname, document.title), 0)
    return () => window.clearTimeout(timer)
  }, [location.pathname])

  return children
}

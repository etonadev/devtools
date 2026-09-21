import { ErrorBoundary } from '../components/feedback/ErrorBoundary'
import { AnalyticsManager } from '../components/analytics/AnalyticsManager'
import { AppRoutes } from './routes'
export function App() { return <ErrorBoundary><AnalyticsManager><AppRoutes /></AnalyticsManager></ErrorBoundary> }

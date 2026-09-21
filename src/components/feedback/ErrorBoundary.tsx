import { Component, type ErrorInfo, type ReactNode } from 'react'

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('DevTools UI error', error.name, info.componentStack) }
  render() {
    if (this.state.failed) return <main className="fatal-error"><p className="eyebrow">Something went wrong</p><h1>This view could not be loaded.</h1><p>Your document was not sent anywhere. Refresh the page to start a clean session.</p><button className="primary-button" onClick={() => window.location.reload()}>Reload DevTools</button></main>
    return this.props.children
  }
}

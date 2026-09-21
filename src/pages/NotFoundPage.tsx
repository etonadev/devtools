import { Link } from 'react-router-dom'
import { Seo } from '../components/common/Seo'
export function NotFoundPage() { return <main className="info-page"><Seo title="Page not found | DevTools" description="The requested DevTools page could not be found." path="/404" /><p className="eyebrow">404</p><h1>That tool is not on the bench.</h1><p>Check the address or return to the directory.</p><Link className="primary-button" to="/">View all tools</Link></main> }

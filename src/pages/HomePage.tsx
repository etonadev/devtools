import { ArrowRight, CheckCircle2, LockKeyhole, Sparkles, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PRODUCT_NAME, tools } from '../app/config'
import { Seo } from '../components/common/Seo'

export function HomePage() {
  return <main className="home-page">
    <Seo title={`${PRODUCT_NAME} — Private browser-based developer tools`} description="Professional JSON, YAML, XML, SQL, and Markdown tools that process your documents locally in the browser." path="/" />
    <section className="home-hero">
      <div className="hero-copy"><p className="eyebrow"><Sparkles size={14} /> A sharper developer workbench</p><h1>Shape messy data into <em>clean, trusted output.</em></h1><p>Format, validate, inspect, and export structured documents without sending a byte to a server.</p><div className="hero-actions"><Link className="primary-button large" to="/json-formatter">Open JSON formatter <ArrowRight size={17} /></Link><span><LockKeyhole size={16} />100% browser-based</span></div></div>
      <div className="hero-console" aria-label="DevTools example"><div className="console-top"><span></span><span></span><span></span><p>response.json</p><span className="console-valid"><CheckCircle2 size={14} /> Valid</span></div><pre><code><span className="muted">{'{'}</span>{'\n'}  <span className="key">"tool"</span>: <span className="string">"DevTools"</span>,{'\n'}  <span className="key">"processing"</span>: <span className="string">"local"</span>,{'\n'}  <span className="key">"formats"</span>: <span className="muted">[</span>{'\n'}    <span className="string">"JSON"</span>, <span className="string">"YAML"</span>, <span className="string">"XML"</span>{'\n'}  <span className="muted">]</span>{'\n'}<span className="muted">{'}'}</span></code></pre><div className="console-footer"><Zap size={14} /> Formatted in your browser</div></div>
    </section>
    <section className="tool-directory"><div className="section-heading"><div><p className="eyebrow">Five focused tools</p><h2>Choose your workspace</h2></div><p>Consistent controls. Format-specific intelligence. No account required.</p></div><div className="tool-card-grid">{tools.map((tool, index) => <Link to={tool.path} className="tool-card" key={tool.id}><div className={`tool-icon hue-${index}`}><tool.icon size={22} /></div><div><span className="card-number">0{index + 1}</span><h3>{tool.shortName}</h3><p>{tool.description}</p></div><ArrowRight className="card-arrow" size={19} /><span className="card-rule" /></Link>)}</div></section>
    <section className="trust-band"><div><LockKeyhole size={22} /><span><strong>Your work stays yours.</strong>Documents are processed locally. No uploads, content tracking, or hidden persistence.</span></div><Link to="/privacy">Read our privacy approach <ArrowRight size={16} /></Link></section>
  </main>
}

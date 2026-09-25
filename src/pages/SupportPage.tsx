import { Coffee, Github, Heart } from 'lucide-react'
import { PRODUCT_NAME, SUPPORT_OPTIONS } from '../app/config'
import seoMetadata from '../app/seo.json'
import { Seo } from '../components/common/Seo'

const supportMethods = [
  {
    ...SUPPORT_OPTIONS.buyMeACoffee,
    icon: Coffee,
    description: `Buy a coffee to support ongoing maintenance and new features for ${PRODUCT_NAME}.`,
    accessibleLabel: `Support ${PRODUCT_NAME} on Buy Me a Coffee (opens in a new tab)`,
  },
  {
    ...SUPPORT_OPTIONS.githubSponsors,
    icon: Github,
    description: `Sponsor ongoing development and help keep ${PRODUCT_NAME} free and actively maintained.`,
    accessibleLabel: `Sponsor ${PRODUCT_NAME} on GitHub (opens in a new tab)`,
  },
].filter((method) => method.enabled)

export function SupportPage() {
  const seo = seoMetadata.pages.support
  return <main className="support-page">
    <Seo title={seo.title} description={seo.description} path={seo.path} />
    <section className="support-heading">
      <div className="support-icon"><Heart aria-hidden /></div>
      <p className="eyebrow">Support independent development</p>
      <h1>Support {PRODUCT_NAME}</h1>
      <p>Enjoy using {PRODUCT_NAME}? Your support helps keep our developer tools free, maintain the project, and build new features for the developer community.</p>
      <p>Every contribution is appreciated, but never required. All tools remain free to use.</p>
    </section>
    <section className={`support-grid ${supportMethods.length === 1 ? 'single' : ''}`} aria-label="Support options">
      {supportMethods.map((method) => <article className="support-card" key={method.url}>
        <method.icon aria-hidden />
        <div><h2>{method.label}</h2><p>{method.description}</p></div>
        <a className="primary-button large" href={method.url} target="_blank" rel="noopener noreferrer" aria-label={method.accessibleLabel}>{method.label}</a>
      </article>)}
    </section>
    <p className="support-note">Payments are handled entirely by the external platform. {PRODUCT_NAME} does not collect payment or account details.</p>
  </main>
}

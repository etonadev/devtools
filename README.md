# DevTools

DevTools is a privacy-focused browser workbench for JSON, YAML, XML, SQL, and Markdown. It is built as a static React application: documents are parsed, formatted, validated, previewed, and downloaded without a backend or document-content telemetry.

## Technology

- React, TypeScript, Vite, React Router
- Monaco Editor and Tailwind CSS
- `lossless-json`, `yaml`, `xml-formatter`, `sql-formatter`, and Prettier
- `react-markdown` with GitHub Flavored Markdown and sanitization
- Vitest, jsdom, and React Testing Library

## Prerequisites

- Node.js 20.19+ or 22.12+
- npm 10+

## Local development

```bash
npm install
npm run dev
```

The Vite development server prints the local URL. No environment variables are required for local development.

## Quality checks

```bash
npm run typecheck
npm test
npm run build
```

The production output is written to `dist`. The build also emits route-specific HTML entry files with unique titles, descriptions, and canonical URLs.

## Configuration

Copy `.env.example` to `.env.production` only when deploying. Set `VITE_SITE_URL` to the final HTTPS origin so canonical URLs, `robots.txt`, and `sitemap.xml` are correct. `VITE_PRODUCT_NAME` is an optional brand override.

Analytics is opt-in and disabled in local development. Production collection requires `VITE_ANALYTICS_ENABLED=true`, at least one provider identifier, and visitor consent.

## Analytics and privacy

`src/services/analytics/AnalyticsService.ts` is the only application interface to analytics providers. It accepts controlled event fields rather than arbitrary payloads, preventing document contents, filenames, uploaded files, tokens, URLs with query strings, SQL queries, or other editor data from entering analytics events.

The following GA4 events are implemented:

- `tool_opened`
- `format_executed`
- `validation_executed`
- `formatting_error`
- `file_uploaded`
- `file_downloaded`
- `copy_to_clipboard`

Each event contains only `tool_name` and `action_result` (`success` or `error`). Cloudflare Web Analytics is used for aggregate traffic, SPA navigation, and real-user performance metrics; Cloudflare does not currently accept custom events.

Visitors see an accessible consent prompt before either provider is loaded. Their choice is stored locally under `devtools-analytics-consent` and can be changed using **Analytics preferences** in the footer. Revoking a choice reloads the application so previously attached provider code is removed cleanly. This implementation is a technical consent mechanism, not a substitute for jurisdiction-specific legal review.

### Configure Cloudflare Web Analytics

Use manual beacon configuration so the application can load Cloudflare only after consent. Do not also enable the Pages one-click automatic injection; doing both would bypass the application consent gate and duplicate measurement.

1. In the Cloudflare dashboard, open **Web Analytics** and select **Add a site**.
2. Enter the final Pages or custom-domain hostname.
3. Open **Manage site** and copy the token from the generated beacon snippet.
4. Add the token to the production environment:

```text
VITE_ANALYTICS_ENABLED=true
VITE_CLOUDFLARE_ANALYTICS_TOKEN=your-public-beacon-token
```

The service loads Cloudflare's official beacon with SPA measurement enabled. Cloudflare automatically observes History API navigation and reports page performance and Core Web Vitals. The token is a public site identifier, not a secret.

### Configure Google Analytics 4

1. In Google Analytics, create or select a GA4 property.
2. Go to **Admin → Data streams → Web**, create/select the production web stream, and copy its `G-...` Measurement ID.
3. In the stream's **Enhanced measurement → Page views → advanced settings**, disable **Page changes based on browser history events**. DevTools sends one manual page view for each React route, so leaving automatic history measurement enabled would duplicate views.
4. Add the production environment variables:

```text
VITE_ANALYTICS_ENABLED=true
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

The Google tag is configured with `send_page_view: false`; `AnalyticsManager` sends sanitized page views containing only origin and pathname. Advertising storage, signals, user data, and personalization remain denied. Verify navigation and custom events in GA4 Realtime or DebugView after deploying.

## Project structure

```text
src/
  app/                 Routes, product registry, application entry
  components/          Shared editor, layout, toolbar, and feedback UI
  features/shared/     Reusable tool workbench
  hooks/               Theme behavior
  pages/               Directory and informational routes
  services/            Formatting, validation, files, and clipboard
  styles/              Tailwind entry and product styling
  test/                Test environment setup
  types/               Shared TypeScript contracts
scripts/               Static route metadata generation
public/                Favicon, sitemap, robots, and Pages fallback
```

## Cloudflare Pages deployment

1. Push this directory to a GitHub repository.
2. In the Cloudflare dashboard, open **Workers & Pages**, choose **Create application**, then **Pages** and **Connect to Git**.
3. Select the repository and configure:
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node version: `22`
4. Under **Settings → Environment variables**, add:
   - `NODE_VERSION=22`
   - `VITE_SITE_URL=https://your-project.pages.dev` (or the confirmed custom domain)
   - `VITE_ANALYTICS_ENABLED=true` when analytics should be available
   - `VITE_GA4_MEASUREMENT_ID` and/or `VITE_CLOUDFLARE_ANALYTICS_TOKEN`
5. Select **Save and Deploy**. `public/_redirects` keeps direct visits to client-side routes working, while the build also creates concrete HTML entry files for known routes.
6. After Cloudflare assigns the final `*.pages.dev` hostname, correct `VITE_SITE_URL` if necessary and redeploy so canonical and sitemap URLs use the final origin.

Cloudflare publishes the project to a `pages.dev` address, not directly to `cloudflare.com`. To use your own hostname, open the Pages project, choose **Custom domains → Set up a custom domain**, and follow Cloudflare's DNS instructions. Every push to the selected production branch triggers a new production deployment; other branches receive preview deployments.

The application is fully static and does not require Workers, a database, paid services, or a running Node server.

## Adding a tool

1. Add its metadata and example to `src/app/config.ts`.
2. Put parser/formatter logic in `src/services/formatting` with typed results and independent tests.
3. Add the processor to `features/shared/ToolPage.tsx`. Reuse the shared toolbar, file safeguards, editor, status bar, and content patterns.
4. Add a lazy route in `src/app/routes.tsx`, a route metadata entry in `scripts/prerender.mjs`, and its URL in `public/sitemap.xml`.

## Known limitations

- SQL formatting is not full SQL validation and no query is executed.
- XML formatting and minification are refused for mixed-content documents when whitespace changes could alter meaning.
- YAML indentation always uses spaces because indentation tabs are invalid YAML; choosing tabs falls back to two spaces with an explicit notice.
- Browser parsing and formatting are limited to 5 MB per uploaded file to reduce UI stalls. Very complex documents can still take noticeable time on low-powered devices.
- Canonical URLs and sitemap URLs use the configured production origin; the example origin is used only if a production build omits `VITE_SITE_URL`.

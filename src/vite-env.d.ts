/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string
  readonly VITE_PRODUCT_NAME?: string
  readonly VITE_GA4_MEASUREMENT_ID?: string
  readonly VITE_CLOUDFLARE_ANALYTICS_TOKEN?: string
}

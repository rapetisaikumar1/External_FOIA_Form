/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the MapleRecord backend API (no trailing slash). */
  readonly VITE_API_BASE_URL?: string
  /** Origin sent to the backend as return_origin for Stripe redirects. */
  readonly VITE_RETURN_ORIGIN?: string
}

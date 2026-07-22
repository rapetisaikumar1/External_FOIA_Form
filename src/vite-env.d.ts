/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the MapleRecord backend API (no trailing slash). */
  readonly VITE_API_BASE_URL?: string
    readonly VITE_IDENTITY_API_BASE_URL?: string
}

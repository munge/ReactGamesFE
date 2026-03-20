/// <reference types="vite/client" />

/**
 * Extend Vite's ImportMetaEnv with your project-specific variables.
 * Any VITE_ prefixed variable added to an .env file must be declared here
 * so TypeScript can type-check access via import.meta.env.
 */
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_ASSET_URL: string
  readonly VITE_ENV_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

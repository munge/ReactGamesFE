export interface OgMeta {
  title?: string
  description?: string
  image?: string
}

export interface MetaConfig {
  title: string
  description: string
  keywords?: string[]
  og?: OgMeta
}

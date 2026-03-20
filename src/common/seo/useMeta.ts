import { useEffect } from 'react'
import type { MetaConfig } from './types'

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Find or create a <meta> tag identified by a data-seo key.
 * Returns a cleanup function that either removes the tag (if we created it)
 * or restores the previous attribute values (if we updated an existing one).
 */
function applyMetaTag(key: string, attrs: Record<string, string>): () => void {
  let el = document.querySelector<HTMLMetaElement>(`meta[data-seo="${key}"]`)
  let created = false
  const prevAttrs: Record<string, string | null> = {}

  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('data-seo', key)
    document.head.appendChild(el)
    created = true
  }

  // Snapshot current attrs before overwriting
  for (const attr of Object.keys(attrs)) {
    prevAttrs[attr] = el.getAttribute(attr)
  }
  for (const [attr, value] of Object.entries(attrs)) {
    el.setAttribute(attr, value)
  }

  const captured = el
  return () => {
    if (created) {
      captured.remove()
    } else {
      for (const [attr, prev] of Object.entries(prevAttrs)) {
        if (prev === null) {
          captured.removeAttribute(attr)
        } else {
          captured.setAttribute(attr, prev)
        }
      }
    }
  }
}

// ── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useMeta — imperatively updates <head> meta tags for the current route.
 *
 * - Sets document.title
 * - Injects/updates: description, keywords, og:title, og:description, og:image
 * - Tags are identified by `data-seo` attributes to prevent duplicates
 * - Cleans up (removes created tags / restores updated ones) on unmount
 *
 * Works correctly with React.lazy + Suspense because the hook runs after the
 * game component mounts, which is after the lazy chunk has loaded.
 */
export function useMeta(config: MetaConfig): void {
  const { title, description } = config
  const keywords  = config.keywords?.join(', ') ?? ''
  const ogTitle   = config.og?.title       ?? ''
  const ogDesc    = config.og?.description ?? ''
  const ogImage   = config.og?.image       ?? ''

  useEffect(() => {
    const prevTitle = document.title
    document.title = title

    const cleanups: Array<() => void> = []

    cleanups.push(applyMetaTag('description', { name: 'description', content: description }))

    if (keywords) {
      cleanups.push(applyMetaTag('keywords', { name: 'keywords', content: keywords }))
    }

    cleanups.push(applyMetaTag('og:title',       { property: 'og:title',       content: ogTitle || title }))
    cleanups.push(applyMetaTag('og:description', { property: 'og:description', content: ogDesc  || description }))

    if (ogImage) {
      cleanups.push(applyMetaTag('og:image', { property: 'og:image', content: ogImage }))
    }

    return () => {
      document.title = prevTitle
      cleanups.forEach((fn) => fn())
    }
  }, [title, description, keywords, ogTitle, ogDesc, ogImage])
}

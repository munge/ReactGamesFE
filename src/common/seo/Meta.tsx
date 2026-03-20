import { useMeta } from './useMeta'
import type { MetaConfig } from './types'

interface MetaProps {
  meta: MetaConfig
}

/**
 * Meta — drop-in SEO component.
 *
 * Renders nothing (returns null). Calls useMeta() to update <head>
 * imperatively whenever the config changes or the component mounts/unmounts.
 *
 * Usage:
 *   import { Meta } from '@common/seo/Meta'
 *   import { meta } from './meta'
 *
 *   // Inside your page component:
 *   <Meta meta={meta} />
 */
export function Meta({ meta }: MetaProps): null {
  useMeta(meta)
  return null
}

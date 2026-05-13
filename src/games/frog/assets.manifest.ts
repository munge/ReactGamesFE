/**
 * Frog game asset bundle.
 *
 * Spine assets are loaded via @esotericsoftware/spine-pixi-v8 which
 * auto-registers a PixiJS Assets loader extension. The atlas file is
 * co-located with the skeleton JSON so PixiJS detects it automatically.
 *
 * Sounds are loaded separately by Howler (see FrogSoundManager in index.tsx).
 */
import type { GameAssetBundle } from '@common/pixi/PixiAssetsLoader'

const BASE = '/assets/frog'

export const FROG_BUNDLE: GameAssetBundle = {
  name: 'frog',
  assets: [
    // Spine skeletons — atlas is auto-detected from the same directory
    { alias: 'frog',      src: `${BASE}/images/spines/frog/frog.json` },
    { alias: 'frog-atlas',     src: `${BASE}/images/spines/frog/frog.atlas` },
    { alias: 'bonusFrog', src: `${BASE}/images/spines/bonus_frog/bonus_frog.json` },
    { alias: 'bonusFrog-atlas', src: `${BASE}/images/spines/bonus_frog/bonus_frog.atlas` },
  ],
}

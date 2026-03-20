import type { GameAssetBundle } from '@common/pixi/PixiAssetsLoader'

/**
 * Game 1 asset bundle.
 * Swap placeholder paths for real asset URLs before deploying.
 *
 * Assets are loaded via PixiAssetsLoader.loadBundle(GAME1_BUNDLE)
 * and cached under the 'game-1' bundle name.
 */
export const GAME1_BUNDLE: GameAssetBundle = {
  name: 'game-1',
  assets: [
    // { alias: 'bg',    src: `${import.meta.env.VITE_ASSET_URL}/game-1/bg.png` },
    // { alias: 'cards', src: `${import.meta.env.VITE_ASSET_URL}/game-1/cards.json` },
  ],
}

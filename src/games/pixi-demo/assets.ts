import type { GameAssetBundle } from '@common/pixi/PixiAssetsLoader'

/**
 * Asset bundle for Pixi Demo.
 *
 * Add your game's assets below. Use the `alias` to retrieve textures:
 *   const texture = pixiAssetsLoader.get<Texture>('player')
 *
 * Run `npm run dev` and place files under:
 *   public/assets/pixi-demo/
 */
export const PIXIDEMO_BUNDLE: GameAssetBundle = {
  name: 'pixi-demo',
  assets: [
    // { alias: 'player', src: `${import.meta.env.VITE_ASSET_URL}/pixi-demo/player.png` },
    // { alias: 'bg',     src: `${import.meta.env.VITE_ASSET_URL}/pixi-demo/bg.png` },
  ],
}

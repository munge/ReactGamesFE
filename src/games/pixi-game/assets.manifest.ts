import type { GameAssetBundle } from '@common/pixi/PixiAssetsLoader'

/**
 * PixiGame asset bundle.
 *
 * In this demo we use procedural Graphics (no real files needed).
 * To add real assets, uncomment the entries below and place files under
 * public/assets/pixi-game/ (or serve from VITE_ASSET_URL).
 *
 * The loading system will still work — the progress bar will just jump to
 * 100% immediately when the bundle is empty.
 */
export const PIXI_GAME_BUNDLE: GameAssetBundle = {
  name: 'pixi-game',
  assets: [
    // { alias: 'bg',      src: `${import.meta.env.VITE_ASSET_URL}/pixi-game/bg.png` },
    // { alias: 'hero',    src: `${import.meta.env.VITE_ASSET_URL}/pixi-game/hero.png` },
    // { alias: 'sheet',   src: `${import.meta.env.VITE_ASSET_URL}/pixi-game/sheet.json` },
  ],
}

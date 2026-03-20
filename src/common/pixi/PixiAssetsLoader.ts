/**
 * PixiAssetsLoader — PixiJS v8 asset management system.
 *
 * Responsibilities:
 *  - Accept a named bundle of assets (images, spritesheets, atlases)
 *  - Use the PixiJS v8 `Assets` API (replaces the deprecated Loader)
 *  - Report loading progress (0–100)
 *  - Cache assets via Pixi's built-in cache system
 *  - Support per-game asset isolation (each game defines its own bundle)
 *  - Support unloading when a game unmounts (memory management)
 *
 * Bundle isolation strategy:
 *  - Each game calls loadBundle() with its own GameAssetBundle config
 *  - Assets are cached under unique aliases inside the bundle namespace
 *  - On route unmount, call unloadBundle() to free GPU textures
 *
 * ⚠ This module statically imports from 'pixi.js'. It must ONLY be imported
 *   inside lazy-loaded game routes (never from main.tsx or the router) so
 *   pixi.js stays out of the initial bundle. Vite's manualChunks ensures
 *   pixi.js lands in vendor-pixi, which loads on demand.
 *
 * Usage per game:
 *   import { pixiAssetsLoader } from '@common/pixi/PixiAssetsLoader'
 *   import { PIXI_GAME_BUNDLE } from './assets.manifest'
 *
 *   await pixiAssetsLoader.loadBundle(PIXI_GAME_BUNDLE, (p) => setProgress(p))
 *   const texture = pixiAssetsLoader.get<Texture>('hero')
 */

import { Assets } from 'pixi.js'

// ── Types ────────────────────────────────────────────────────────────────────

export type AssetAlias = string
export type AssetSrc = string

/** A single named asset entry */
export interface AssetEntry {
  alias: AssetAlias
  src: AssetSrc
}

/** A complete asset bundle for one game */
export interface GameAssetBundle {
  /** Unique bundle name — must be unique across all games */
  name: string
  assets: AssetEntry[]
}

/** 0–100 progress value */
export type ProgressHandler = (progress: number) => void

// ── Loader class ─────────────────────────────────────────────────────────────

class PixiAssetsLoaderClass {
  /**
   * Register and load a game bundle.
   *
   * Calls `Assets.addBundle` so assets stay isolated under the bundle name,
   * then `Assets.loadBundle` which returns a Promise and emits progress (0–1).
   *
   * Assets are NOT loaded globally — only when explicitly called per game.
   * They remain in the PixiJS asset cache until `unloadBundle` is called.
   */
  async loadBundle(bundle: GameAssetBundle, onProgress?: ProgressHandler): Promise<void> {
    if (bundle.assets.length === 0) return

    // Convert AssetEntry[] → Record<alias, src> (v8 format)
    const assetRecord: Record<string, string> = {}
    for (const { alias, src } of bundle.assets) {
      assetRecord[alias] = src
    }

    Assets.addBundle(bundle.name, assetRecord)

    await Assets.loadBundle(
      bundle.name,
      // Pixi reports 0–1; normalise to 0–100 for UI consumers
      onProgress ? (progress: number) => onProgress(Math.round(progress * 100)) : undefined,
    )
  }

  /**
   * Load arbitrary asset URLs without a bundle (useful for shared / small textures).
   * Progress is reported as 0–100.
   */
  async loadAssets(srcs: string | string[], onProgress?: ProgressHandler): Promise<void> {
    await Assets.load(
      srcs,
      onProgress ? (progress: number) => onProgress(Math.round(progress * 100)) : undefined,
    )
  }

  /**
   * Retrieve a loaded asset from the Pixi cache by alias.
   * Must be called AFTER the relevant bundle has finished loading.
   */
  get<T>(alias: string): T {
    return Assets.get<T>(alias)
  }

  /**
   * Unload an entire bundle — frees GPU textures and system memory.
   * Call this from the game route's cleanup / useEffect return.
   */
  async unloadBundle(bundleName: string): Promise<void> {
    await Assets.unloadBundle(bundleName)
  }

  /**
   * Unload specific assets by src / alias.
   */
  async unload(srcs: string | string[]): Promise<void> {
    await Assets.unload(srcs)
  }
}

/** Singleton — one loader instance per app session */
export const pixiAssetsLoader = new PixiAssetsLoaderClass()

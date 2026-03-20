import { useState, useEffect } from 'react'
import { pixiAssetsLoader } from '@common/pixi/PixiAssetsLoader'
import { PIXIDEMO_BUNDLE } from './assets'

interface LoaderState {
  progress: number
  ready:    boolean
  error:    string | null
}

/**
 * usePixiDemoLoader — manages the full asset-loading lifecycle for Pixi Demo.
 *
 * Flow:
 *  1. Mount  → calls pixiAssetsLoader.loadBundle() with the game's bundle
 *  2. Loading → reports 0-100% progress
 *  3. Loaded  → sets ready = true
 *  4. Unmount → calls unloadBundle() to free GPU memory
 */
export function usePixiDemoLoader(): LoaderState {
  const [progress, setProgress] = useState(0)
  const [ready,    setReady]    = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        if (PIXIDEMO_BUNDLE.assets.length === 0) {
          // No assets defined yet — skip straight to ready
          if (!cancelled) setProgress(100)
        } else {
          await pixiAssetsLoader.loadBundle(PIXIDEMO_BUNDLE, (p) => {
            if (!cancelled) setProgress(p)
          })
        }

        if (!cancelled) setReady(true)
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Failed to load assets')
      }
    }

    load()

    return () => {
      cancelled = true
      pixiAssetsLoader.unloadBundle(PIXIDEMO_BUNDLE.name).catch(() => {/* ignore */})
    }
  }, [])

  return { progress, ready, error }
}

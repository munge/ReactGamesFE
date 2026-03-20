import { useEffect, useRef } from 'react'
import type { Application } from 'pixi.js'

interface UsePixiAppOptions {
  width?: number
  height?: number
  backgroundColor?: number
  onReady?: (app: Application) => void | (() => void)
}

/**
 * Creates and manages a PixiJS v8 Application lifecycle tied to a canvas element.
 *
 * Returns a ref to attach to a <canvas> element.
 * The app is destroyed on unmount — any cleanup returned by onReady is also called.
 *
 * @example
 * const canvasRef = usePixiApp({ onReady: (app) => { ... } })
 * return <canvas ref={canvasRef} />
 */
export function usePixiApp({ width = 800, height = 600, backgroundColor = 0x1a1a2e, onReady }: UsePixiAppOptions = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    let app: Application
    let userCleanup: void | (() => void)
    let cancelled = false

    const init = async () => {
      // Dynamic import keeps pixi.js OUT of the initial bundle
      const { Application } = await import('pixi.js')
      if (cancelled) return

      app = new Application()
      await app.init({
        canvas: canvasRef.current!,
        width,
        height,
        backgroundColor,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        antialias: true,
      })

      if (cancelled) {
        app.destroy(false)
        return
      }

      userCleanup = onReady?.(app)
    }

    init()

    return () => {
      cancelled = true
      if (typeof userCleanup === 'function') userCleanup()
      app?.destroy(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return canvasRef
}

/**
 * PixiApp — thin factory / manager for a PixiJS v8 Application.
 *
 * Key v8 differences vs v7:
 *  - `new Application()` + `await app.init(options)` (async init)
 *  - `app.canvas` instead of `app.view`
 *  - `app.renderer.resolution` instead of `app.renderer.resolution` (same)
 *
 * This module is NOT imported at app startup. It is dynamically imported
 * only by components that need PixiJS, keeping it out of the initial bundle.
 */

import type { Application, ApplicationOptions } from 'pixi.js'

export type PixiAppOptions = Partial<ApplicationOptions> & {
  canvas: HTMLCanvasElement
}

/**
 * Create and initialise a PixiJS v8 Application attached to the given canvas.
 *
 * @example
 *   const { Application } = await import('pixi.js')
 *   const app = await createPixiApp({ canvas: canvasEl, width: 800, height: 600 })
 */
export async function createPixiApp(options: PixiAppOptions): Promise<Application> {
  const { Application } = await import('pixi.js')

  const app = new Application()

  const { canvas, width, height, backgroundColor, ...rest } = options

  await app.init({
    canvas,
    width: width ?? canvas.clientWidth,
    height: height ?? canvas.clientHeight,
    backgroundColor: backgroundColor ?? 0x1a1a2e,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    antialias: true,
    ...rest,
  })

  return app
}

import React, { forwardRef, useImperativeHandle } from 'react'
import type { Application } from 'pixi.js'

import { usePixiApp } from '@common/hooks/usePixiApp'

interface PixiStageProps {
  width?: number
  height?: number
  backgroundColor?: number
  /** Called once the Application is initialised — mount your scene here */
  onReady?: (app: Application) => void | (() => void)
  className?: string
  style?: React.CSSProperties
}

export interface PixiStageHandle {
  canvas: HTMLCanvasElement | null
}

/**
 * PixiStage — renders a <canvas> element and boots a PixiJS v8 Application.
 *
 * PixiJS is dynamically imported inside the hook, so it is never included
 * in the initial bundle unless this component is mounted.
 *
 * @example
 * <PixiStage
 *   width={800}
 *   height={600}
 *   onReady={(app) => {
 *     const bunny = Sprite.from('bunny')
 *     app.stage.addChild(bunny)
 *   }}
 * />
 */
const PixiStage = forwardRef<PixiStageHandle, PixiStageProps>(
  ({ width = 800, height = 600, backgroundColor = 0x1a1a2e, onReady, className, style }, ref) => {
    const canvasRef = usePixiApp({ width, height, backgroundColor, onReady })

    useImperativeHandle(ref, () => ({
      get canvas() {
        return canvasRef.current
      },
    }))

    return (
      <canvas
        ref={canvasRef}
        className={className}
        style={{ display: 'block', ...style }}
        width={width}
        height={height}
      />
    )
  },
)

PixiStage.displayName = 'PixiStage'

export default PixiStage

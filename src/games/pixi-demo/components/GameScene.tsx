/**
 * GameScene — PixiJS v8 rendering scene for Pixi Demo.
 *
 * This component mounts AFTER all assets have finished loading.
 * Build your scene inside handleReady().
 *
 * Key v8 APIs:
 *   app.stage        — root Container
 *   app.canvas       — the HTMLCanvasElement (replaces app.view)
 *   await app.init() — async initialisation (handled by PixiStage)
 *   Assets.get<Texture>('alias') — retrieve a pre-loaded asset
 */

import React from 'react'
import type { Application } from 'pixi.js'
import PixiStage from '@common/pixi/PixiStage'
import styles from '../PixiDemoPage.module.scss'

const STAGE_WIDTH  = 800
const STAGE_HEIGHT = 500

const GameScene: React.FC = () => {
  const handleReady = (app: Application) => {
    // Async work lives in a void IIFE so handleReady stays synchronous
    // (onReady must return void | (() => void), not Promise<void>)
    void (async () => {
      const { Container } = await import('pixi.js')
      // GSAP is available when needed:
      // const { gsap } = await import('gsap')

      // Root container — add all your display objects here
      const root = new Container()
      app.stage.addChild(root)

      // Implement your scene here
      // e.g. const texture = pixiAssetsLoader.get<Texture>('hero')
      //      const sprite  = new Sprite(texture)
      //      root.addChild(sprite)
    })()
  }

  return (
    <PixiStage
      width={STAGE_WIDTH}
      height={STAGE_HEIGHT}
      onReady={handleReady}
      className={styles.canvas}
    />
  )
}

export default GameScene

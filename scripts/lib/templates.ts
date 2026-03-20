/**
 * File content generators for the create:game scaffolder.
 *
 * Each function accepts game metadata and returns the raw string that will
 * be written to disk. Template literals that should appear LITERALLY in the
 * output file escape their ${ } sequences with a backslash.
 *
 * Example — to output  `${import.meta.env.VITE_ASSET_URL}`  we write:
 *   `\${import.meta.env.VITE_ASSET_URL}`
 */

export interface TemplateContext {
  gameName:   string  // my-new-game
  pascalName: string  // MyNewGame
  title:      string  // My New Game
  badge:      string  // MYNE
  color:      string  // #7c3aed
  withPixi:   boolean
  withGsap:   boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// index.ts
// ─────────────────────────────────────────────────────────────────────────────

export function genIndex(ctx: TemplateContext): string {
  return `export { default } from './${ctx.pascalName}Page'\n`
}

// ─────────────────────────────────────────────────────────────────────────────
// assets.ts
// ─────────────────────────────────────────────────────────────────────────────

export function genAssets(ctx: TemplateContext): string {
  return (
`import type { GameAssetBundle } from '@common/pixi/PixiAssetsLoader'

/**
 * Asset bundle for ${ctx.title}.
 *
 * Add your game's assets below. Use the \`alias\` to retrieve textures:
 *   const texture = pixiAssetsLoader.get<Texture>('player')
 *
 * Run \`npm run dev\` and place files under:
 *   public/assets/${ctx.gameName}/
 */
export const ${ctx.pascalName.toUpperCase()}_BUNDLE: GameAssetBundle = {
  name: '${ctx.gameName}',
  assets: [
    // { alias: 'player', src: \`\${import.meta.env.VITE_ASSET_URL}/${ctx.gameName}/player.png\` },
    // { alias: 'bg',     src: \`\${import.meta.env.VITE_ASSET_URL}/${ctx.gameName}/bg.png\` },
  ],
}
`
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// loader.ts  (asset-loading hook — used by the Page component)
// ─────────────────────────────────────────────────────────────────────────────

export function genLoader(ctx: TemplateContext): string {
  return (
`import { useState, useEffect } from 'react'
import { pixiAssetsLoader } from '@common/pixi/PixiAssetsLoader'
import { ${ctx.pascalName.toUpperCase()}_BUNDLE } from './assets'

interface LoaderState {
  progress: number
  ready:    boolean
  error:    string | null
}

/**
 * use${ctx.pascalName}Loader — manages the full asset-loading lifecycle for ${ctx.title}.
 *
 * Flow:
 *  1. Mount  → calls pixiAssetsLoader.loadBundle() with the game's bundle
 *  2. Loading → reports 0-100% progress
 *  3. Loaded  → sets ready = true
 *  4. Unmount → calls unloadBundle() to free GPU memory
 */
export function use${ctx.pascalName}Loader(): LoaderState {
  const [progress, setProgress] = useState(0)
  const [ready,    setReady]    = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        if (${ctx.pascalName.toUpperCase()}_BUNDLE.assets.length === 0) {
          // No assets defined yet — skip straight to ready
          if (!cancelled) setProgress(100)
        } else {
          await pixiAssetsLoader.loadBundle(${ctx.pascalName.toUpperCase()}_BUNDLE, (p) => {
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
      pixiAssetsLoader.unloadBundle(${ctx.pascalName.toUpperCase()}_BUNDLE.name).catch(() => {/* ignore */})
    }
  }, [])

  return { progress, ready, error }
}
`
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// types/index.ts
// ─────────────────────────────────────────────────────────────────────────────

export function genTypes(ctx: TemplateContext): string {
  return (
`// Types for ${ctx.title}
// Add your game-specific interfaces and types here.

export interface ${ctx.pascalName}Config {
  // e.g. width: number
  // e.g. initialScore: number
}

export interface ${ctx.pascalName}State {
  score:  number
  lives:  number
  status: 'idle' | 'playing' | 'paused' | 'gameover'
}
`
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// components/GameScene.tsx  (PixiJS scene placeholder)
// ─────────────────────────────────────────────────────────────────────────────

export function genGameScene(ctx: TemplateContext): string {
  const gsapComment = ctx.withGsap
    ? `\n      // GSAP is available when needed:\n      // const { gsap } = await import('gsap')`
    : ''

  return (
`/**
 * GameScene — PixiJS v8 rendering scene for ${ctx.title}.
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
import styles from '../${ctx.pascalName}Page.module.scss'

const STAGE_WIDTH  = 800
const STAGE_HEIGHT = 500

const GameScene: React.FC = () => {
  const handleReady = (app: Application) => {
    // Async work lives in a void IIFE so handleReady stays synchronous
    // (onReady must return void | (() => void), not Promise<void>)
    void (async () => {
      const { Container } = await import('pixi.js')${gsapComment}

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
`
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// [PascalName]Page.tsx  — main page component (with Pixi)
// ─────────────────────────────────────────────────────────────────────────────

export function genPageWithPixi(ctx: TemplateContext): string {
  return (
`import React, { lazy, Suspense } from 'react'
import { Link } from 'react-router'
import LoadingScreen from '@common/components/ui/LoadingScreen/LoadingScreen'
import { use${ctx.pascalName}Loader } from './loader'
import styles from './${ctx.pascalName}Page.module.scss'

// GameScene is lazy-loaded — mounts only after assets are ready
const GameScene = lazy(() => import('./components/GameScene'))

/**
 * ${ctx.title} — route entry component.
 *
 * Loading flow:
 *  1. use${ctx.pascalName}Loader() starts the PixiJS asset pipeline
 *  2. LoadingScreen shows live progress
 *  3. Once ready → GameScene mounts and renders the canvas
 */
const ${ctx.pascalName}Page: React.FC = () => {
  const { progress, ready, error } = use${ctx.pascalName}Loader()

  if (error) {
    return (
      <div className={styles.error}>
        <p>Failed to load assets: {error}</p>
        <Link to="/">← Back to Lobby</Link>
      </div>
    )
  }

  if (!ready) {
    return <LoadingScreen progress={progress} message="Loading ${ctx.title}…" />
  }

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.backLink}>← Lobby</Link>
        <span className={styles.navTitle}>${ctx.title}</span>
      </nav>

      <main className={styles.main}>
        <Suspense fallback={<LoadingScreen message="Mounting scene…" />}>
          <GameScene />
        </Suspense>
      </main>
    </div>
  )
}

export default ${ctx.pascalName}Page
`
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// [PascalName]Page.tsx  — main page component (without Pixi)
// ─────────────────────────────────────────────────────────────────────────────

export function genPageWithoutPixi(ctx: TemplateContext): string {
  return (
`import React from 'react'
import { Link } from 'react-router'
import styles from './${ctx.pascalName}Page.module.scss'

const ${ctx.pascalName}Page: React.FC = () => {
  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.backLink}>← Lobby</Link>
        <span className={styles.navTitle}>${ctx.title}</span>
      </nav>

      <main className={styles.main}>
        {/* Implement ${ctx.title} here */}
      </main>
    </div>
  )
}

export default ${ctx.pascalName}Page
`
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// [PascalName]Page.module.scss  (shared between Pixi and non-Pixi)
// ─────────────────────────────────────────────────────────────────────────────

export function genScss(ctx: TemplateContext): string {
  // NOTE: In JS template literals, bare `$` is a literal character — no escaping needed.
  // Only `${` triggers interpolation. So `vars.$color-text` is written as-is.

  const pixiExtras = ctx.withPixi
    ? [
        '',
        '.canvas {',
        '  display: block;',
        '  max-width: 100%;',
        '}',
        '',
        '.error {',
        '  @include mix.flex-center;',
        '  @include mix.flex-column;',
        '  gap: vars.$space-4;',
        '  min-height: 100dvh;',
        '  background: vars.$color-bg-deep;',
        '  color: vars.$color-error;',
        '  text-align: center;',
        '  padding: vars.$space-8;',
        '',
        '  a {',
        '    color: vars.$color-text-muted;',
        '    font-size: vars.$font-size-sm;',
        '    &:hover { color: vars.$color-text; }',
        '  }',
        '}',
        '',
      ].join('\n')
    : '\n'

  const mainBlock = [
    `.main {`,
    `  flex: 1;`,
    `  @include mix.flex-column;`,
    ...(ctx.withPixi ? [`  align-items: center;`, `  justify-content: center;`] : []),
    `  padding: vars.$space-8 vars.$space-6;`,
    `}`,
  ].join('\n')

  return [
    `// ${ctx.title} — scoped styles`,
    `// vars.$* and mix.*() are globally available via vite.config.ts additionalData`,
    ``,
    `.page {`,
    `  min-height: 100dvh;`,
    `  @include mix.flex-column;`,
    `  background: vars.$color-bg-deep;`,
    `  color: vars.$color-text;`,
    `}`,
    ``,
    `.nav {`,
    `  @include mix.flex-between;`,
    `  padding: vars.$space-4 vars.$space-6;`,
    `  border-bottom: 1px solid vars.$color-border;`,
    `}`,
    ``,
    `.backLink {`,
    `  font-size: vars.$font-size-sm;`,
    `  color: vars.$color-text-muted;`,
    `  transition: color vars.$transition-fast;`,
    `  &:hover { color: vars.$color-text; }`,
    `}`,
    ``,
    `.navTitle {`,
    `  font-family: vars.$font-display;`,
    `  font-weight: vars.$font-weight-bold;`,
    `  color: vars.$color-text;`,
    `}`,
    ``,
    mainBlock,
    pixiExtras,
  ].join('\n') + '\n'
}

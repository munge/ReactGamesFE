import React, { lazy, Suspense } from 'react'
import { Link } from 'react-router'
import LoadingScreen from '@common/components/ui/LoadingScreen/LoadingScreen'
import { useMeta } from '@common/seo/useMeta'
import { usePixiDemoLoader } from './loader'
import { meta } from './meta'
import styles from './PixiDemoPage.module.scss'

// GameScene is lazy-loaded — mounts only after assets are ready
const GameScene = lazy(() => import('./components/GameScene'))

/**
 * Pixi Demo — route entry component.
 *
 * Loading flow:
 *  1. usePixiDemoLoader() starts the PixiJS asset pipeline
 *  2. LoadingScreen shows live progress
 *  3. Once ready → GameScene mounts and renders the canvas
 */
const PixiDemoPage: React.FC = () => {
  useMeta(meta)
  const { progress, ready, error } = usePixiDemoLoader()

  if (error) {
    return (
      <div className={styles.error}>
        <p>Failed to load assets: {error}</p>
        <Link to="/">← Back to Lobby</Link>
      </div>
    )
  }

  if (!ready) {
    return <LoadingScreen progress={progress} message="Loading Pixi Demo…" />
  }

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.backLink}>← Lobby</Link>
        <span className={styles.navTitle}>Pixi Demo</span>
      </nav>

      <main className={styles.main}>
        <Suspense fallback={<LoadingScreen message="Mounting scene…" />}>
          <GameScene />
        </Suspense>
      </main>
    </div>
  )
}

export default PixiDemoPage

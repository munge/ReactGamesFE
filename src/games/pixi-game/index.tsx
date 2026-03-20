import React, { useEffect, useState, lazy, Suspense } from 'react'
import { Link } from 'react-router'
import { pixiAssetsLoader } from '@common/pixi/PixiAssetsLoader'
import LoadingScreen from '@common/components/ui/LoadingScreen/LoadingScreen'
import { PIXI_GAME_BUNDLE } from './assets.manifest'
import styles from './PixiGame.module.scss'

// GameScene is lazy-loaded — mounts only after assets are ready
const PixiGameScene = lazy(() => import('./PixiGameScene'))

type LoadState = 'loading' | 'ready' | 'error'

const PixiGame: React.FC = () => {
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [progress,  setProgress]  = useState(0)
  const [errorMsg,  setErrorMsg]  = useState('')

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        if (PIXI_GAME_BUNDLE.assets.length === 0) {
          // No assets defined yet — skip straight to ready
          if (!cancelled) setProgress(100)
        } else {
          await pixiAssetsLoader.loadBundle(PIXI_GAME_BUNDLE, (p) => {
            if (!cancelled) setProgress(p)
          })
        }
        if (!cancelled) setLoadState('ready')
      } catch (err) {
        if (!cancelled) {
          setErrorMsg(err instanceof Error ? err.message : 'Failed to load assets')
          setLoadState('error')
        }
      }
    }

    load()

    return () => {
      cancelled = true
      // Unload bundle on route exit — frees GPU textures
      pixiAssetsLoader.unloadBundle(PIXI_GAME_BUNDLE.name).catch(() => {/* ignore */})
    }
  }, [])

  if (loadState === 'error') {
    return (
      <div className={styles.error}>
        <p>Failed to load assets: {errorMsg}</p>
        <Link to="/">← Back to Lobby</Link>
      </div>
    )
  }

  if (loadState !== 'ready') {
    return <LoadingScreen progress={progress} message="Loading…" />
  }

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.backLink}>← Lobby</Link>
        <span className={styles.navTitle}>Pixi Game</span>
      </nav>

      <main className={styles.main}>
        <Suspense fallback={<LoadingScreen message="Mounting scene…" />}>
          <PixiGameScene />
        </Suspense>
      </main>
    </div>
  )
}

export default PixiGame

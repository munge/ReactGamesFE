import React from 'react'
import styles from './LoadingScreen.module.scss'

interface LoadingScreenProps {
  /** 0–100 */
  progress?: number
  message?: string
}

/**
 * Full-screen loading overlay shown while assets or lazy chunks are loading.
 * Used both by React Suspense (no progress) and the PixiJS asset loader (with progress).
 */
const LoadingScreen: React.FC<LoadingScreenProps> = ({ progress, message = 'Loading…' }) => {
  const hasProgress = progress !== undefined

  return (
    <div className={styles.wrapper} role="status" aria-label={message}>
      <div className={styles.content}>
        {/* Animated logo mark */}
        <div className={styles.logoMark} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <p className={styles.message}>{message}</p>

        {hasProgress && (
          <div className={styles.progressWrapper}>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressBar}
                style={{ width: `${progress}%` }}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <span className={styles.progressLabel}>{progress}%</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default LoadingScreen

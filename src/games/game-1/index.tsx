import React from 'react'
import { Link } from 'react-router'
// import { useLoaderData } from 'react-router'
// import type { Game1LoaderData } from './api'
import { useMeta } from '@common/seo/useMeta'
import { meta } from './meta'
import styles from './Game1.module.scss'

const Game1: React.FC = () => {
  useMeta(meta)
  // Uncomment to access loader data:
  // const data = useLoaderData() as Game1LoaderData

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.backLink}>← Lobby</Link>
        <span className={styles.navTitle}>Game 1</span>
      </nav>

      <main className={styles.main}>
        {/* Implement Game 1 here */}
      </main>
    </div>
  )
}

export default Game1

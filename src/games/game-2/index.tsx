import React from 'react'
import { Link } from 'react-router'
// import { useLoaderData } from 'react-router'
// import type { Game2LoaderData } from './api'
import { useMeta } from '@common/seo/useMeta'
import { meta } from './meta'
import styles from './Game2.module.scss'

const Game2: React.FC = () => {
  useMeta(meta)
  // Uncomment to access loader data:
  // const data = useLoaderData() as Game2LoaderData

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.backLink}>← Lobby</Link>
        <span className={styles.navTitle}>Game 2</span>
      </nav>

      <main className={styles.main}>
        {/* Implement Game 2 here */}
      </main>
    </div>
  )
}

export default Game2

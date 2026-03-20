import React from 'react'
import { Link } from 'react-router'
import { GAME_REGISTRY } from '@games/registry'
import { useMeta } from '@common/seo/useMeta'
import { meta } from './meta'
import styles from './Lobby.module.scss'

const Lobby: React.FC = () => {
  useMeta(meta)
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Game Platform</h1>
      </header>

      <main className={styles.main}>
        <div className={styles.grid}>
          {GAME_REGISTRY.map((game) => (
            <Link
              key={game.id}
              to={game.path}
              className={styles.card}
              style={{ '--card-color': game.color } as React.CSSProperties}
            >
              <span className={styles.badge}>{game.badge}</span>
              <h2 className={styles.cardTitle}>{game.title}</h2>
              <p className={styles.cardDesc}>{game.description}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}

export default Lobby

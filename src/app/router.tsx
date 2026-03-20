import { lazy, Suspense } from 'react'
import type { ComponentType, LazyExoticComponent } from 'react'
import { createBrowserRouter } from 'react-router'

import LoadingScreen from '@common/components/ui/LoadingScreen/LoadingScreen'
import { GAME_REGISTRY } from '@games/registry'

// ── Lobby (always the entry point — not in the registry) ─────────────────────
const Lobby = lazy(() => import('@games/lobby'))

// ── Suspense wrapper factory ──────────────────────────────────────────────────
//
// Wraps any lazy component with a route-level Suspense boundary so the fallback
// only covers that individual game's chunk download, not the whole app.
//
function withSuspense(Component: LazyExoticComponent<ComponentType> | ComponentType) {
  return function SuspendedRoute() {
    return (
      <Suspense fallback={<LoadingScreen message="Loading game…" />}>
        <Component />
      </Suspense>
    )
  }
}

const SuspenseLobby = withSuspense(Lobby)

// ── Router ────────────────────────────────────────────────────────────────────
//
// Game routes are derived from GAME_REGISTRY — adding a new game to the
// registry (via `npm run create:game`) automatically registers its route.
//
export const router = createBrowserRouter([
  {
    path: '/',
    element: <SuspenseLobby />,
  },

  // Dynamically expand every registered game into a route
  ...GAME_REGISTRY.map((game) => {
    const SuspendedGame = withSuspense(game.component)
    return {
      path: game.path,
      element: <SuspendedGame />,
      // Attach the data loader only if the game defines one
      ...(game.loader ? { loader: game.loader } : {}),
    }
  }),

  {
    path: '*',
    element: (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh', flexDirection: 'column', gap: '1rem', color: '#eaeaea' }}>
        <h1 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '4rem' }}>404</h1>
        <p>Page not found.</p>
        <a href="/" style={{ color: '#e94560' }}>← Back to Lobby</a>
      </div>
    ),
  },
])

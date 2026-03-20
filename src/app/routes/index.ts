/**
 * Route constants — single source of truth for all route paths.
 * Import from here when building <Link to={...}> or navigate() calls.
 */
export const ROUTES = {
  LOBBY:     '/',
  GAME_1:    '/game-1',
  GAME_2:    '/game-2',
  PIXI_GAME: '/pixi-game',
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]

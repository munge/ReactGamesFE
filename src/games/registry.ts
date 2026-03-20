/**
 * Game Registry — single source of truth for all games on the platform.
 *
 * Both the Router and the Lobby read from this array.
 * The `create:game` CLI script appends new entries automatically.
 *
 * Field guide:
 *  id          — kebab-case, matches the folder name under src/games/
 *  path        — full route path, e.g. '/game-1'
 *  title       — display name in the Lobby
 *  description — one-line blurb on the Lobby card
 *  badge       — short label on the card corner (≤ 6 chars)
 *  color       — card accent color (CSS hex)
 *  component   — lazy-loaded default export of src/games/<id>/index.ts(x)
 *  loader      — optional React Router data loader (runs before route renders)
 */

import { lazy } from "react";
import type { ComponentType, LazyExoticComponent } from "react";

export interface GameRegistryEntry {
  id: string;
  path: string;
  title: string;
  description: string;
  badge: string;
  color: string;
  component: LazyExoticComponent<ComponentType>;
  loader?: () => Promise<unknown>;
}

export const GAME_REGISTRY: GameRegistryEntry[] = [
    {
    id: 'pixi-demo',
    path: '/pixi-demo',
    title: 'Pixi Demo',
    description: 'Add your Pixi Demo description here.',
    badge: 'PIXIDE',
    color: '#dc2626',
    component: lazy(() => import('./pixi-demo')),
  },
  // @@REGISTRY_INJECT_ABOVE@@  ← CLI inserts new entries above this line — do not remove
  {
    id: "game-1",
    path: "/game-1",
    title: "Game 1",
    description: "Game 1 — add your description.",
    badge: "GAME1",
    color: "#7c3aed",
    component: lazy(() => import("./game-1")),
    loader: async () => {
      const { game1Loader } = await import("./game-1/api");
      return game1Loader();
    },
  },
  {
    id: "game-2",
    path: "/game-2",
    title: "Game 2",
    description: "Game 2 — add your description.",
    badge: "GAME2",
    color: "#0891b2",
    component: lazy(() => import("./game-2")),
    loader: async () => {
      const { game2Loader } = await import("./game-2/api");
      return game2Loader();
    },
  },
  {
    id: "pixi-game",
    path: "/pixi-game",
    title: "Pixi Game",
    description: "Pixi Game — add your description.",
    badge: "WEBGL",
    color: "#e94560",
    component: lazy(() => import("./pixi-game")),
  },
];

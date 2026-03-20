# Scripts — Developer Reference

This folder contains Node.js CLI tools for the **React Mini Games** platform.
All scripts are written in TypeScript and executed directly via [`tsx`](https://github.com/privatenumber/tsx) — no build step required.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [create:game — Game Scaffolder](#creategame--game-scaffolder)
   - [Quick Start](#quick-start)
   - [All Invocation Modes](#all-invocation-modes)
   - [CLI Flags Reference](#cli-flags-reference)
   - [Flag Combination Matrix](#flag-combination-matrix)
   - [Name Rules](#name-rules)
   - [Name Transformation Examples](#name-transformation-examples)
3. [What Gets Generated](#what-gets-generated)
   - [With PixiJS](#with-pixijs-default)
   - [Without PixiJS](#without-pixijs---no-pixi)
   - [File Descriptions](#file-descriptions)
4. [Auto-Registration — How It Works](#auto-registration--how-it-works)
   - [The Injection Marker](#the-injection-marker)
   - [What the Registry Entry Looks Like](#what-the-registry-entry-looks-like)
   - [Effect on Router and Lobby](#effect-on-router-and-lobby)
5. [Safety Checks](#safety-checks)
6. [Customising After Generation](#customising-after-generation)
   - [Adding Real Assets](#adding-real-assets)
   - [Changing Title, Badge, or Color](#changing-title-badge-or-color)
   - [Adding a React Router Loader](#adding-a-react-router-loader)
7. [Extending the Templates](#extending-the-templates)
   - [Adding a New File Template](#adding-a-new-file-template)
   - [Modifying an Existing Template](#modifying-an-existing-template)
   - [TemplateContext Fields](#templatecontext-fields)
8. [Script Internals — File Map](#script-internals--file-map)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

```bash
# tsx must be installed (it is a devDependency — run this once after cloning)
npm install
```

`tsx` is the TypeScript runner that executes `.ts` scripts directly without
pre-compilation. It is listed in `devDependencies` in `package.json`.

> **Never run the scripts with plain `node`.**
> Plain Node cannot read TypeScript. Always use `npm run <script>` or
> `npx tsx scripts/<file>.ts`.

---

## create:game — Game Scaffolder

Scaffolds a complete, ready-to-run game module under `src/games/<name>/`
and registers it in the platform's central game registry.

### Quick Start

```bash
# Fully interactive — the CLI asks for everything
npm run create:game

# Provide the name upfront — CLI only asks about Pixi & GSAP
npm run create:game -- slot-machine

# Completely non-interactive — all options decided by flags
npm run create:game -- slot-machine --pixi --gsap
```

> **Note the `--` separator.**
> npm uses `--` to pass arguments through to the underlying script.
> Everything after `--` is received by the script as `process.argv`.

---

### All Invocation Modes

| Command | What happens |
|---|---|
| `npm run create:game` | Prompts for name, PixiJS, GSAP |
| `npm run create:game -- my-game` | Prompts for PixiJS, GSAP only |
| `npm run create:game -- my-game --pixi` | Prompts for GSAP only |
| `npm run create:game -- my-game --pixi --gsap` | No prompts at all |
| `npm run create:game -- my-game --no-pixi` | Plain React game, prompts for GSAP |
| `npm run create:game -- my-game --no-pixi --no-gsap` | Plain React game, no prompts |
| `npm run create:game -- my-game --yes` | All defaults (pixi=yes, gsap=yes) |
| `npm run create:game -- my-game -y` | Same as `--yes` |

---

### CLI Flags Reference

| Flag | Type | Default | Description |
|---|---|---|---|
| `<name>` | positional | _(prompted)_ | Game name in **kebab-case**. Must be the first non-flag argument. |
| `--pixi` | boolean | _(prompted)_ | Include PixiJS scene files (`assets.ts`, `loader.ts`, `components/GameScene.tsx`). |
| `--no-pixi` | boolean | _(prompted)_ | Skip all PixiJS files — generate a plain React page instead. |
| `--gsap` | boolean | _(prompted)_ | Add a GSAP entrance animation to the page component. |
| `--no-gsap` | boolean | _(prompted)_ | Skip the GSAP animation block. |
| `--yes` / `-y` | boolean | `false` | Skip all prompts and use defaults: `--pixi --gsap`. |

---

### Flag Combination Matrix

```
                    --pixi   --no-pixi   (neither — prompted)
--gsap              P+G      R+G         ask Pixi → ask GSAP
--no-gsap           P        R           ask Pixi → no GSAP
(neither)           ask GSAP ask GSAP    ask Pixi → ask GSAP
--yes / -y          P+G      —           P+G (default)
```

**Legend:** `P` = PixiJS scene, `G` = GSAP animation, `R` = plain React page
`P+G` = PixiJS scene with GSAP, `R+G` = plain React page with GSAP

---

### Name Rules

The game name becomes the folder name, route path, and component prefix.
It must satisfy **all** of the following:

| Rule | Valid | Invalid |
|---|---|---|
| Lowercase letters, numbers, hyphens only | `slot-machine` | `SlotMachine` |
| Must start with a lowercase letter | `quiz-2` | `2-quiz` |
| Must not start or end with a hyphen | `my-game` | `-my-game`, `my-game-` |
| No consecutive hyphens | `top-gun` | `top--gun` |
| Minimum 2 characters | `go` | `g` |
| Maximum 40 characters | `short-name` | _(40+ chars)_ |
| No spaces or special characters | `word-blitz` | `word blitz`, `word_blitz` |

```bash
# Valid names
npm run create:game -- slot-machine
npm run create:game -- quiz2
npm run create:game -- racing-game-3d
npm run create:game -- pong

# Invalid — will error immediately
npm run create:game -- SlotMachine        # uppercase letters
npm run create:game -- "slot machine"     # space
npm run create:game -- slot_machine       # underscore
npm run create:game -- -slot              # leading hyphen
npm run create:game -- 3d-racing          # starts with number
```

---

### Name Transformation Examples

The CLI derives all filenames and identifiers automatically from the kebab-case name:

| Input (`gameName`) | `pascalName` | `title` | `badge` | Accent color |
|---|---|---|---|---|
| `slot-machine` | `SlotMachine` | `Slot Machine` | `SLOTMA` | `#0891b2` (cyan) |
| `quiz-arena` | `QuizArena` | `Quiz Arena` | `QUIZAR` | `#7c3aed` (violet) |
| `racing-3d` | `Racing3d` | `Racing 3d` | `RACING` | `#059669` (emerald) |
| `pong` | `Pong` | `Pong` | `PONG` | `#d97706` (amber) |
| `tower-defense` | `TowerDefense` | `Tower Defense` | `TOWERD` | `#dc2626` (red) |

The accent color is picked deterministically from a palette based on the
character codes in the name — the same name always produces the same color.
You can override it manually in `src/games/registry.ts` after generation.

---

## What Gets Generated

### With PixiJS (default)

Running `npm run create:game -- slot-machine --pixi --gsap` produces:

```
src/games/slot-machine/
│
├── index.ts                      ← Route entry — re-exports SlotMachinePage
├── SlotMachinePage.tsx           ← Page component with asset loader + GSAP
├── SlotMachinePage.module.scss   ← Scoped SCSS (vars.$* + mix.*() available)
├── assets.ts                     ← SLOT_MACHINE_BUNDLE (GameAssetBundle)
├── loader.ts                     ← useSlotMachineLoader() hook (progress 0–100%)
│
├── components/
│   └── GameScene.tsx             ← PixiJS v8 scene skeleton
│
├── hooks/
│   └── .gitkeep                  ← Empty dir preserved in git
│
└── types/
    └── index.ts                  ← SlotMachineConfig / SlotMachineState interfaces
```

### Without PixiJS (`--no-pixi`)

Running `npm run create:game -- slot-machine --no-pixi` produces:

```
src/games/slot-machine/
│
├── index.ts                      ← Route entry
├── SlotMachinePage.tsx           ← Plain React page
├── SlotMachinePage.module.scss   ← Scoped SCSS
│
├── components/                   ← Empty (no GameScene.tsx)
├── hooks/
│   └── .gitkeep
│
└── types/
    └── index.ts
```

> `assets.ts` and `loader.ts` are **not generated** without `--pixi` because
> they depend on `PixiAssetsLoader`. You can always create them manually later.

---

### File Descriptions

#### `index.ts`
The lazy-load entry point consumed by the router.
```ts
export { default } from './SlotMachinePage'
```
The router imports this file via `lazy(() => import('./slot-machine'))`.
Do not rename or restructure this file — the registry entry points to it.

---

#### `SlotMachinePage.tsx` (with Pixi)
Orchestrates the loading lifecycle:
1. Calls `useSlotMachineLoader()` which runs `PixiAssetsLoader.loadBundle()`
2. Renders `<LoadingScreen progress={...} />` while assets are loading
3. Once `ready === true`, mounts `<GameScene>` inside a `<Suspense>` boundary
4. Includes a shared `<Modal>` for game info (connected to `useModal()`)
5. If `--gsap` was chosen: runs a GSAP entrance animation via dynamic import

---

#### `SlotMachinePage.tsx` (without Pixi)
A minimal React page with:
- Nav bar with back link and info modal
- A placeholder `<main>` area for your game logic
- Optional GSAP entrance animation block (if `--gsap` was chosen)

---

#### `SlotMachinePage.module.scss`
Scoped SCSS module. `vars.$*` design tokens and `mix.*()` mixins are injected
automatically by Vite (configured in `vite.config.ts` → `css.preprocessorOptions.scss.additionalData`).

You never need to write `@use` at the top of a `.module.scss` file.

```scss
/* Just use vars and mixins directly: */
.page {
  background: vars.$color-bg-deep;
  @include mix.flex-column;
}
```

---

#### `assets.ts`
Defines the PixiJS asset bundle for this game.
```ts
export const SLOT_MACHINE_BUNDLE: GameAssetBundle = {
  name: 'slot-machine',       // must be unique across all games
  assets: [
    { alias: 'player', src: `${import.meta.env.VITE_ASSET_URL}/slot-machine/player.png` },
  ],
}
```
Assets are **only loaded when the route is visited** — never globally.
The bundle name is used to unload assets when the route unmounts.

---

#### `loader.ts`
Exports `useSlotMachineLoader()` — a React hook that:
- Calls `pixiAssetsLoader.loadBundle()` on mount
- Reports progress from `0` to `100`
- Sets `ready = true` when loading completes
- Calls `pixiAssetsLoader.unloadBundle()` on unmount (frees GPU memory)
- Returns `{ progress, ready, error }`

When `assets.ts` has no real entries yet, the hook simulates a brief fake
progress animation so the loading screen is still visible during development.

---

#### `components/GameScene.tsx`
The PixiJS v8 rendering scene. Rendered only after `ready === true`.
Uses `<PixiStage>` from `@common/pixi/PixiStage` which handles:
- Async `app.init()` (v8 API)
- Canvas mounting and unmounting
- Dynamic import of `pixi.js` (keeps it out of the initial bundle)

The generated skeleton draws a rotating coloured box as a placeholder.
Replace the `handleReady` function body with your real scene.

---

#### `types/index.ts`
Game-specific TypeScript interfaces. Pre-populated with:
- `SlotMachineConfig` — game configuration shape
- `SlotMachineState` — runtime state shape (`score`, `lives`, `status`)

---

## Auto-Registration — How It Works

### The Injection Marker

`src/games/registry.ts` contains a special comment line:

```ts
export const GAME_REGISTRY: GameRegistryEntry[] = [
  // @@REGISTRY_INJECT_ABOVE@@  ← CLI inserts new entries above this line — do not remove
  { id: 'game-1', ... },
  { id: 'game-2', ... },
  { id: 'pixi-game', ... },
]
```

**Do not remove or rename this comment.**
The script locates the insertion point by searching for the exact string
`// @@REGISTRY_INJECT_ABOVE@@`. If it is missing, the command errors out
with a clear recovery message.

---

### What the Registry Entry Looks Like

After running `npm run create:game -- slot-machine --pixi`, the following
block is inserted above the marker:

```ts
{
  id: 'slot-machine',
  path: '/slot-machine',
  title: 'Slot Machine',
  description: 'Add your Slot Machine description here.',
  badge: 'SLOTMA',
  color: '#0891b2',
  component: lazy(() => import('./slot-machine')),
},
// @@REGISTRY_INJECT_ABOVE@@  ← marker shifts down, stays before existing games
```

New games are inserted at the **top** of the array so they appear first in
the Lobby. Reorder entries in `registry.ts` manually to change the display order.

---

### Effect on Router and Lobby

Both `src/app/router.tsx` and `src/games/lobby/index.tsx` read
`GAME_REGISTRY` at runtime. After the CLI runs:

- **Router** — a new route `{ path: '/slot-machine', element: <...> }` exists immediately
- **Lobby** — a new game card appears in the grid automatically

No manual edits to the router or lobby are ever needed.

---

## Safety Checks

The script performs all checks **before** writing any files.
Either everything succeeds or nothing is written.

| Check | Error message |
|---|---|
| Game name is invalid | `"Use only lowercase letters, numbers, and hyphens"` |
| `src/games/registry.ts` does not exist | `"Registry file not found at …"` |
| Injection marker missing from registry | `"Injection marker … not found"` |
| Folder `src/games/<name>/` already exists | `"Folder already exists: … Delete it first"` |
| Name already registered in registry | `"'<name>' is already registered"` |

---

## Customising After Generation

### Adding Real Assets

1. Place files under `public/assets/<game-name>/` (or a CDN path set in `.env`)
2. Open `src/games/<name>/assets.ts` and uncomment / add entries:

```ts
export const SLOT_MACHINE_BUNDLE: GameAssetBundle = {
  name: 'slot-machine',
  assets: [
    { alias: 'reel-bg',  src: `${import.meta.env.VITE_ASSET_URL}/slot-machine/reel-bg.png` },
    { alias: 'symbols',  src: `${import.meta.env.VITE_ASSET_URL}/slot-machine/symbols.json` },
  ],
}
```

3. Retrieve loaded assets in `GameScene.tsx`:

```ts
import { Sprite, Texture } from 'pixi.js'
import { pixiAssetsLoader } from '@common/pixi/PixiAssetsLoader'

const texture = pixiAssetsLoader.get<Texture>('reel-bg')
const bg = new Sprite(texture)
app.stage.addChild(bg)
```

---

### Changing Title, Badge, or Color

Open `src/games/registry.ts` and edit the entry directly:

```ts
{
  id: 'slot-machine',
  path: '/slot-machine',
  title: 'Lucky Slots',         // ← displayed in the Lobby card header
  description: 'Spin to win!',  // ← displayed in the Lobby card body
  badge: 'LUCKY',               // ← small tag on the card corner (≤ 6 chars)
  color: '#f4c53d',             // ← card accent color (any CSS hex)
  component: lazy(() => import('./slot-machine')),
},
```

---

### Adding a React Router Loader

If your game needs data fetched before the page renders (like `game-1` does),
add a `loader` function to the registry entry and a `loader()` export to
the game's module:

**`src/games/slot-machine/registry.ts`** (your registry entry):
```ts
{
  id: 'slot-machine',
  ...
  loader: async () => {
    const { loader } = await import('./slot-machine/api')
    return loader()
  },
},
```

**`src/games/slot-machine/api.ts`** (new file you create):
```ts
export interface SlotMachineLoaderData {
  config: { reels: number; symbols: string[] }
}

export async function loader(): Promise<SlotMachineLoaderData> {
  // fetch from import.meta.env.VITE_API_URL ...
  return { config: { reels: 3, symbols: ['🍒', '🍋', '7️⃣'] } }
}
```

**Inside your page component**:
```ts
import { useLoaderData } from 'react-router'
import type { SlotMachineLoaderData } from './api'

const { config } = useLoaderData() as SlotMachineLoaderData
```

---

## Extending the Templates

All generated file contents live in [`scripts/lib/templates.ts`](./lib/templates.ts).
Each file is a pure function `(ctx: TemplateContext) => string`.

### Adding a New File Template

1. Add a new exported function to `templates.ts`:

```ts
// templates.ts
export function genStoreTemplate(ctx: TemplateContext): string {
  return (
`import { create } from 'zustand'

interface ${ctx.pascalName}Store {
  score: number
  addScore: (n: number) => void
}

export const use${ctx.pascalName}Store = create<${ctx.pascalName}Store>((set) => ({
  score: 0,
  addScore: (n) => set((s) => ({ score: s.score + n })),
}))
`
  )
}
```

2. Import and call it in `createGame.ts` inside the `main()` function,
   after the other `writeFile()` calls:

```ts
import { ..., genStoreTemplate } from './lib/templates.js'

// Inside main(), after the other writeFile() calls:
writeFile(join(gameDir, 'store.ts'), genStoreTemplate(ctx), createdFiles)
step('store.ts')
```

That's it — every future `npm run create:game` will include `store.ts`.

---

### Modifying an Existing Template

Open `scripts/lib/templates.ts` and edit the relevant `gen*` function.
Changes apply to all **future** games; already-generated games are unaffected.

**Important escaping rule inside template strings:**

| You want to output | Write in the template function |
|---|---|
| `${import.meta.env.FOO}` | `` `\${import.meta.env.FOO}` `` |
| `` `backtick` `` | `` `\`backtick\`` `` |
| `vars.$color-text` (Sass) | `vars.$color-text` ← no escaping needed, `$` alone is safe |
| `${someVar}` (your interpolation) | `${someVar}` ← normal interpolation |

---

### TemplateContext Fields

All template functions receive a `TemplateContext` object:

```ts
interface TemplateContext {
  gameName:   string   // 'slot-machine'      — kebab-case folder/route name
  pascalName: string   // 'SlotMachine'       — used for component/class names
  title:      string   // 'Slot Machine'      — human-readable display name
  badge:      string   // 'SLOTMA'            — short lobby card tag (≤ 6 chars)
  color:      string   // '#0891b2'           — hex accent color
  withPixi:   boolean  // true / false        — whether PixiJS files are included
  withGsap:   boolean  // true / false        — whether GSAP code is included
}
```

---

## Script Internals — File Map

```
scripts/
│
├── createGame.ts          Main entry point
│                          • Parses CLI flags (parseFlags)
│                          • Runs interactive prompts (ask / confirm)
│                          • Orchestrates validation → file creation → registration
│
└── lib/
    ├── utils.ts           Pure naming helpers (no I/O)
    │                      • toPascalCase   my-game → MyGame
    │                      • toTitleCase    my-game → My Game
    │                      • toBadge        my-game → MYGAME (≤6 chars)
    │                      • validateGameName → true | errorString
    │                      • pickColor      deterministic palette pick
    │
    ├── printer.ts         Terminal output (ANSI codes, no chalk dependency)
    │                      • step()    ✔ success line
    │                      • warn()    ⚠ warning line
    │                      • fatal()   ✖ error + process.exit(1)
    │                      • banner()  ASCII header
    │                      • successSummary()  final output with next steps
    │
    ├── registry.ts        Reads/writes src/games/registry.ts
    │                      • assertRegistryReady()   pre-flight check
    │                      • isAlreadyRegistered()   duplicate check
    │                      • buildRegistryEntry()    builds the text block
    │                      • insertRegistryEntry()   writes to disk
    │
    └── templates.ts       File content generators — one function per file
                           • genIndex()            index.ts
                           • genAssets()           assets.ts
                           • genLoader()           loader.ts
                           • genTypes()            types/index.ts
                           • genGameScene()        components/GameScene.tsx
                           • genPageWithPixi()     [Name]Page.tsx (Pixi variant)
                           • genPageWithoutPixi()  [Name]Page.tsx (plain variant)
                           • genScss()             [Name]Page.module.scss
```

---

## Troubleshooting

### `'tsx' is not recognized` / `tsx: command not found`

This is the most common first-run error. It means `node_modules` does not
exist yet — `npm install` has never been run in this project.

```bash
npm install
npm run create:game -- my-game --pixi --gsap
```

`tsx` is a devDependency. npm only makes it available as a script runner
**after** `node_modules/.bin/tsx` exists, which requires `npm install` first.

> **Rule of thumb:** any time you clone this repo or pull a branch that adds
> new dependencies, run `npm install` before running any `npm run` script.

---

### `Cannot find module '…/scripts/lib/utils.js'`
You ran the script with plain `node` instead of `tsx`.
```bash
# Wrong
node scripts/createGame.ts

# Correct
npm run create:game
# or
npx tsx scripts/createGame.ts
```

---

### `Folder already exists: src/games/my-game/`
A previous run was interrupted, or you created the folder manually.
```bash
# Remove the partial folder and try again
rm -rf src/games/my-game
npm run create:game -- my-game
```

---

### `'my-game' is already registered in src/games/registry.ts`
The folder was deleted but the registry entry was not removed.
Open `src/games/registry.ts`, delete the `{ id: 'my-game', ... }` block,
then run the command again.

---

### `Injection marker "// @@REGISTRY_INJECT_ABOVE@@" not found`
Someone accidentally deleted or renamed the marker comment.
Open `src/games/registry.ts` and add the comment back anywhere inside
the `GAME_REGISTRY` array (typically as the first line of the array):

```ts
export const GAME_REGISTRY: GameRegistryEntry[] = [
  // @@REGISTRY_INJECT_ABOVE@@  ← CLI inserts new entries above this line — do not remove
  { id: 'game-1', ... },
  ...
]
```

---

### Script runs but the new game card doesn't appear in the Lobby
Check that `src/games/lobby/index.tsx` imports from `@games/registry`:
```ts
import { GAME_REGISTRY } from '@games/registry'
```
And that the JSX iterates over it:
```tsx
{GAME_REGISTRY.map((game) => (
  <Link to={game.path} key={game.id}>...</Link>
))}
```

---

### The new route returns 404
Check that `src/app/router.tsx` spreads `GAME_REGISTRY`:
```ts
...GAME_REGISTRY.map((game) => ({
  path: game.path,
  element: <SuspendedGame />,
})),
```

---

*Last updated: 2026-03-20*

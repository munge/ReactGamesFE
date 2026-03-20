#!/usr/bin/env node
/**
 * create:game — interactive game module scaffolder
 *
 * Usage:
 *   npm run create:game                    → fully interactive
 *   npm run create:game -- slot-machine    → name pre-filled, options prompted
 *   npm run create:game -- slot-machine --pixi --gsap   → fully non-interactive
 *
 * What it does:
 *  1. Validates the game name
 *  2. Creates src/games/<name>/ with all boilerplate files
 *  3. Appends a new entry to src/games/registry.ts
 *     → the route and Lobby card appear automatically on next `npm run dev`
 */

import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { resolve, join }                         from 'path'
import { createInterface }                       from 'readline'

import { toPascalCase, toTitleCase, toBadge, validateGameName, pickColor } from './lib/utils.js'
import { banner, step, warn, fatal, successSummary }                       from './lib/printer.js'
import { assertRegistryReady, isAlreadyRegistered, insertRegistryEntry }   from './lib/registry.js'
import {
  genIndex,
  genAssets,
  genLoader,
  genMeta,
  genTypes,
  genGameScene,
  genPageWithPixi,
  genPageWithoutPixi,
  genScss,
  type TemplateContext,
} from './lib/templates.js'

// ─────────────────────────────────────────────────────────────────────────────
// Simple readline-based prompt (no external dep needed)
// ─────────────────────────────────────────────────────────────────────────────

function ask(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

async function confirm(question: string, defaultYes = true): Promise<boolean> {
  const hint   = defaultYes ? '[Y/n]' : '[y/N]'
  const answer = await ask(`  ${question} ${hint}: `)
  if (!answer) return defaultYes
  return /^y(es)?$/i.test(answer)
}

// ─────────────────────────────────────────────────────────────────────────────
// CLI flag parser
// ─────────────────────────────────────────────────────────────────────────────

interface CliFlags {
  nameArg:     string | undefined
  forcePixi:   boolean
  forceGsap:   boolean
  noPixi:      boolean
  noGsap:      boolean
  skipPrompts: boolean
}

function parseFlags(argv: string[]): CliFlags {
  const args = argv.slice(2) // strip 'node' and script path
  return {
    nameArg:     args.find((a) => !a.startsWith('--')),
    forcePixi:   args.includes('--pixi'),
    forceGsap:   args.includes('--gsap'),
    noPixi:      args.includes('--no-pixi'),
    noGsap:      args.includes('--no-gsap'),
    skipPrompts: args.includes('--yes') || args.includes('-y'),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// File writer helpers
// ─────────────────────────────────────────────────────────────────────────────

const ROOT    = resolve(process.cwd())
const GAMES   = join(ROOT, 'src', 'games')

function writeFile(filePath: string, content: string, relList: string[]): void {
  writeFileSync(filePath, content, 'utf-8')
  relList.push(filePath.replace(ROOT + '\\', '').replace(ROOT + '/', ''))
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  banner()

  const flags = parseFlags(process.argv)

  // ── 1. Game name ────────────────────────────────────────────
  let gameName = flags.nameArg ?? ''

  if (!gameName) {
    gameName = await ask('  Game name (kebab-case, e.g. slot-machine): ')
  }

  const nameValid = validateGameName(gameName)
  if (nameValid !== true) fatal(nameValid)

  // ── 2. Safety checks ────────────────────────────────────────
  assertRegistryReady()  // throws if registry.ts is missing or lacks the marker

  const gameDir = join(GAMES, gameName)
  if (existsSync(gameDir)) {
    fatal(`Folder already exists: src/games/${gameName}/\nDelete it first or choose a different name.`)
  }

  if (isAlreadyRegistered(gameName)) {
    fatal(`'${gameName}' is already registered in src/games/registry.ts.`)
  }

  // ── 3. Options ───────────────────────────────────────────────
  let withPixi: boolean
  let withGsap: boolean

  if (flags.skipPrompts) {
    withPixi = !flags.noPixi
    withGsap = !flags.noGsap
  } else if (flags.forcePixi || flags.noPixi) {
    withPixi = flags.forcePixi
    withGsap = flags.forceGsap || (!flags.noGsap && await confirm('Include GSAP animation?'))
  } else {
    withPixi = await confirm('Include PixiJS scene?')
    withGsap = await confirm('Include GSAP animation?')
  }

  // ── 4. Derived names ─────────────────────────────────────────
  const pascalName = toPascalCase(gameName)
  const title      = toTitleCase(gameName)
  const badge      = toBadge(gameName)
  const color      = pickColor(gameName)

  const ctx: TemplateContext = { gameName, pascalName, title, badge, color, withPixi, withGsap }

  console.log()
  console.log(`  Scaffolding ${`\x1b[1m\x1b[36m${gameName}\x1b[0m`} …`)
  console.log()

  const createdFiles: string[] = []

  // ── 5. Create directory structure ───────────────────────────
  mkdirSync(join(gameDir, 'components'), { recursive: true })
  mkdirSync(join(gameDir, 'hooks'),      { recursive: true })
  mkdirSync(join(gameDir, 'types'),      { recursive: true })

  // ── 6. Write files ──────────────────────────────────────────

  // index.ts — route entry (re-exports the page)
  writeFile(join(gameDir, 'index.ts'), genIndex(ctx), createdFiles)
  step(`index.ts`)

  // meta.ts — SEO config (title, description, keywords, og tags)
  writeFile(join(gameDir, 'meta.ts'), genMeta(ctx), createdFiles)
  step(`meta.ts`)

  // Page component
  const pageContent = withPixi ? genPageWithPixi(ctx) : genPageWithoutPixi(ctx)
  writeFile(join(gameDir, `${pascalName}Page.tsx`), pageContent, createdFiles)
  step(`${pascalName}Page.tsx`)

  // SCSS module
  writeFile(join(gameDir, `${pascalName}Page.module.scss`), genScss(ctx), createdFiles)
  step(`${pascalName}Page.module.scss`)

  if (withPixi) {
    // assets.ts — Pixi bundle manifest
    writeFile(join(gameDir, 'assets.ts'), genAssets(ctx), createdFiles)
    step('assets.ts')

    // loader.ts — asset-loading hook
    writeFile(join(gameDir, 'loader.ts'), genLoader(ctx), createdFiles)
    step('loader.ts')

    // components/GameScene.tsx — Pixi scene skeleton
    writeFile(join(gameDir, 'components', 'GameScene.tsx'), genGameScene(ctx), createdFiles)
    step('components/GameScene.tsx')
  }

  // types/index.ts
  writeFile(join(gameDir, 'types', 'index.ts'), genTypes(ctx), createdFiles)
  step('types/index.ts')

  // hooks/.gitkeep (preserves the empty directory in git)
  writeFile(join(gameDir, 'hooks', '.gitkeep'), '', createdFiles)
  step('hooks/  (directory)')

  // ── 7. Register in registry.ts ──────────────────────────────
  insertRegistryEntry({ gameName, pascalName, title, badge, color, hasLoader: false })
  step('src/games/registry.ts  ← entry appended')

  // ── 8. Done ─────────────────────────────────────────────────
  successSummary(gameName, createdFiles)
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err)
  console.error(`\n  \x1b[31m✖\x1b[0m  \x1b[1m${msg}\x1b[0m\n`)
  process.exit(1)
})

/**
 * Registry updater
 * Reads src/games/registry.ts, finds the injection marker, and inserts
 * a new GameRegistryEntry above it. Pure string manipulation — no AST needed
 * because the marker makes the insertion point unambiguous.
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const REGISTRY_PATH = resolve(process.cwd(), 'src/games/registry.ts')
const INJECT_MARKER = '// @@REGISTRY_INJECT_ABOVE@@'

export interface RegistryOptions {
  gameName:   string   // kebab-case, e.g. 'slot-machine'
  pascalName: string   // PascalCase, e.g. 'SlotMachine'
  title:      string   // Display title, e.g. 'Slot Machine'
  badge:      string   // Short badge text, e.g. 'SLOTS'
  color:      string   // Hex color, e.g. '#7c3aed'
  hasLoader:  boolean  // Whether to include a loader: async () => {...} stub
}

/**
 * Returns the block of text that will be inserted before the marker.
 * Keeping it in a separate function makes it easy to unit-test.
 */
export function buildRegistryEntry(opts: RegistryOptions): string {
  const loaderBlock = opts.hasLoader
    ? `\n    loader: async () => {\n      const { loader } = await import('./${opts.gameName}/loader')\n      return loader()\n    },`
    : ''

  return (
    `  {\n` +
    `    id: '${opts.gameName}',\n` +
    `    path: '/${opts.gameName}',\n` +
    `    title: '${opts.title}',\n` +
    `    description: 'Add your ${opts.title} description here.',\n` +
    `    badge: '${opts.badge}',\n` +
    `    color: '${opts.color}',\n` +
    `    component: lazy(() => import('./${opts.gameName}')),` +
    loaderBlock +
    `\n  },\n`
  )
}

/** Throws if the registry file or the injection marker is missing. */
export function assertRegistryReady(): void {
  let content: string
  try {
    content = readFileSync(REGISTRY_PATH, 'utf-8')
  } catch {
    throw new Error(`Registry file not found at ${REGISTRY_PATH}`)
  }
  if (!content.includes(INJECT_MARKER)) {
    throw new Error(
      `Injection marker "${INJECT_MARKER}" not found in src/games/registry.ts.\n` +
      `Add it above the closing "]" of the GAME_REGISTRY array.`,
    )
  }
}

/** Returns true if a game with this id is already registered. */
export function isAlreadyRegistered(gameName: string): boolean {
  const content = readFileSync(REGISTRY_PATH, 'utf-8')
  // Match "id: 'game-name'" anywhere in the file
  return new RegExp(`id:\\s*'${gameName}'`).test(content)
}

/** Insert a new entry into the registry file and write it back to disk. */
export function insertRegistryEntry(opts: RegistryOptions): void {
  const content = readFileSync(REGISTRY_PATH, 'utf-8')
  const entry   = buildRegistryEntry(opts)

  // Insert the new entry immediately before the marker line
  const updated = content.replace(
    INJECT_MARKER,
    `${entry}  ${INJECT_MARKER}`,
  )

  writeFileSync(REGISTRY_PATH, updated, 'utf-8')
}

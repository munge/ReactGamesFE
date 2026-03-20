// ─────────────────────────────────────────────────────────────
// Terminal output helpers — ANSI colours, no external dependency
// ─────────────────────────────────────────────────────────────

const R = '\x1b[0m'  // reset

export const c = {
  bold:    (s: string) => `\x1b[1m${s}${R}`,
  dim:     (s: string) => `\x1b[2m${s}${R}`,
  green:   (s: string) => `\x1b[32m${s}${R}`,
  yellow:  (s: string) => `\x1b[33m${s}${R}`,
  blue:    (s: string) => `\x1b[34m${s}${R}`,
  magenta: (s: string) => `\x1b[35m${s}${R}`,
  cyan:    (s: string) => `\x1b[36m${s}${R}`,
  red:     (s: string) => `\x1b[31m${s}${R}`,
  gray:    (s: string) => `\x1b[90m${s}${R}`,
  white:   (s: string) => `\x1b[97m${s}${R}`,
}

/** Print a step line: ✔  message */
export function step(msg: string) {
  console.log(`  ${c.green('✔')}  ${msg}`)
}

/** Print a warning: ⚠  message */
export function warn(msg: string) {
  console.log(`  ${c.yellow('⚠')}  ${msg}`)
}

/** Print an error and exit */
export function fatal(msg: string): never {
  console.error(`\n  ${c.red('✖')}  ${c.bold(msg)}\n`)
  process.exit(1)
}

/** Section divider */
export function divider() {
  console.log(c.gray('  ' + '─'.repeat(52)))
}

/** Banner printed at the start */
export function banner() {
  console.log()
  console.log(c.bold(c.cyan('  ┌─────────────────────────────────────────┐')))
  console.log(c.bold(c.cyan('  │  🎮  React Mini Games — create:game CLI  │')))
  console.log(c.bold(c.cyan('  └─────────────────────────────────────────┘')))
  console.log()
}

/** Success summary printed after all files are created */
export function successSummary(gameName: string, files: string[]) {
  console.log()
  divider()
  console.log()
  console.log(`  ${c.bold(c.green('✔  Game created:'))} ${c.white(c.bold(gameName))}`)
  console.log()
  console.log(c.gray('  Generated files:'))
  for (const f of files) {
    console.log(`    ${c.gray('·')} ${c.dim(f)}`)
  }
  console.log()
  divider()
  console.log()
  console.log(c.bold('  Next steps:'))
  console.log()
  console.log(`    1. ${c.cyan(`src/games/${gameName}/index.ts`)}`)
  console.log(`       ${c.gray('→ Re-export or customise the page component')}`)
  console.log()
  console.log(`    2. ${c.cyan(`src/games/${gameName}/assets.ts`)}`)
  console.log(`       ${c.gray('→ Add real asset paths (images, spritesheets)')}`)
  console.log()
  console.log(`    3. ${c.cyan(`src/games/${gameName}/components/GameScene.tsx`)}`)
  console.log(`       ${c.gray('→ Build your PixiJS scene here')}`)
  console.log()
  console.log(`    4. ${c.cyan('src/games/registry.ts')}`)
  console.log(`       ${c.gray('→ Entry already added — customise title/badge/color')}`)
  console.log()
  console.log(`  Run ${c.bold(c.cyan('npm run dev'))} and navigate to ${c.bold(c.cyan(`/${gameName}`))}`)
  console.log()
}

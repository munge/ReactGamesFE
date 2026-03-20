// ─────────────────────────────────────────────────────────────
// Naming helpers used by both the CLI and the template generators
// ─────────────────────────────────────────────────────────────

/** my-new-game → MyNewGame */
export function toPascalCase(kebab: string): string {
  return kebab
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}

/** my-new-game → My New Game */
export function toTitleCase(kebab: string): string {
  return kebab
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/** my-new-game → MY_NEW_GAME */
export function toScreamingSnake(kebab: string): string {
  return kebab.toUpperCase().replace(/-/g, '_')
}

/** my-new-game → MYNE (up to 6 chars, for badge labels) */
export function toBadge(kebab: string): string {
  return toPascalCase(kebab).toUpperCase().slice(0, 6)
}

/**
 * Validate a game name before creating it.
 * Returns true on success, or an error string on failure.
 */
export function validateGameName(name: string): true | string {
  if (!name || name.trim().length === 0)
    return 'Game name cannot be empty.'
  if (name.trim() !== name)
    return 'Game name must not have leading or trailing spaces.'
  if (!/^[a-z]/.test(name))
    return 'Game name must start with a lowercase letter.'
  if (!/^[a-z][a-z0-9-]*$/.test(name))
    return 'Use only lowercase letters, numbers, and hyphens (e.g. slot-machine).'
  if (name.endsWith('-'))
    return 'Game name must not end with a hyphen.'
  if (/--/.test(name))
    return 'Game name must not contain consecutive hyphens.'
  if (name.length < 2)
    return 'Game name must be at least 2 characters long.'
  if (name.length > 40)
    return 'Game name must be 40 characters or fewer.'
  return true
}

/** Pick a deterministic accent color from a palette based on the game name */
export function pickColor(gameName: string): string {
  const palette = [
    '#7c3aed', // violet
    '#0891b2', // cyan
    '#059669', // emerald
    '#d97706', // amber
    '#dc2626', // red
    '#7c3aed', // violet (repeat)
    '#db2777', // pink
    '#65a30d', // lime
  ]
  const index = gameName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return palette[index % palette.length]
}

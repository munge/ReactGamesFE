/**
 * Tiny className utility — merges conditional class strings.
 * Avoids pulling in an extra dependency for a one-liner need.
 *
 * Usage:
 *   cn(styles.root, isActive && styles.active, className)
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

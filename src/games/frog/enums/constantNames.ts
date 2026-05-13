export const AnimationNames = {
  NORMAL: 'normal',
  SUCCESS: 'success',
  BONUSE_WIN_SHAKE: 'shake',
  BONUSE_WIN_JUMP: 'jump2',
  FAILED: 'failed',
} as const

export const StateNames = {
  DEFAULT: 'default',
  WIN: 'win',
  BONUS: 'bonus',
  LOOSE: 'loose',
  ZERO: 'zero',
} as const

export const FontFamilyNames = {
  BROADWAY_FLAT: 'BroadwayFlat',
  ALBAM: 'albam',
  ERASDEMI: 'erasdemi',
} as const

export const SpineNames = {
  FROG: 'frog',
  FROG_BONUS: 'bonusFrog',
} as const

export const RiskType = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
} as const

export type RiskTypeValue = (typeof RiskType)[keyof typeof RiskType]
export type StateNameValue = (typeof StateNames)[keyof typeof StateNames]

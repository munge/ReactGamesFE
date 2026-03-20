// Types for Pixi Demo
// Add your game-specific interfaces and types here.

export interface PixiDemoConfig {
  // e.g. width: number
  // e.g. initialScore: number
}

export interface PixiDemoState {
  score:  number
  lives:  number
  status: 'idle' | 'playing' | 'paused' | 'gameover'
}

/**
 * GameView — Frog game Pixi scene.
 *
 * Ported from MiniGamesFE (PixiJS v6 + pixi-spine v3) to PixiJS v8.
 *
 * Key v8 changes vs original:
 *  - Application is initialised externally (async app.init) — we receive it here
 *  - Assets.get() instead of Loader resources
 *  - new Text({ text, style }) instead of new Text(str, styleObj)
 *  - Spine via @esotericsoftware/spine-pixi-v8
 *  - DropShadowFilter via pixi-filters
 *  - GSAP v3 new-style syntax: gsap.to(target, { duration, ... })
 *  - Callbacks replace global CANVAS_EMITTER events
 */
import type { Application } from 'pixi.js'
import { Container, Text, TextStyle } from 'pixi.js'
import { Spine } from '@esotericsoftware/spine-pixi-v8'
import { DropShadowFilter } from 'pixi-filters'
import gsap from 'gsap'
import { AnimationNames, FontFamilyNames, SpineNames, StateNames } from '../enums/constantNames'
import type { StateNameValue } from '../enums/constantNames'

export interface GameViewCallbacks {
  onResourcesLoaded: () => void
  onAnimationFinished: () => void
}

export class GameView {
  private app: Application
  readonly GAME_WIDTH: number
  readonly GAME_HEIGHT: number
  private frogContainer!: Container
  frog!: Spine
  private bonusFrog!: Spine

  constructor(app: Application, width: number, height: number) {
    this.app = app
    this.GAME_WIDTH = width
    this.GAME_HEIGHT = height

    this.frogContainer = new Container()
    this.app.stage.addChild(this.frogContainer)
  }

  /** Call after Assets have been loaded by PixiAssetsLoader */
  initGame() {
    this.addFrog()
    this.addBonusFrog()
    this.showNormalFrog()
  }

  SpeedUp() {
    this.frog.state.timeScale = 2
  }

  SpeedDown() {
    this.frog.state.timeScale = 1
  }

  private addFrog() {
    // @esotericsoftware/spine-pixi-v8: Spine.from(alias) uses the alias
    // registered when loading via Assets.load({ alias: 'frog', ... })
    this.frog = Spine.from({ skeleton: SpineNames.FROG, atlas: `${SpineNames.FROG}-atlas` })
    this.frogContainer.addChild(this.frog)
    this.frog.skeleton.setToSetupPose()
    this.frog.update(0)
    this.frog.state.setAnimation(0, AnimationNames.NORMAL, true)
    this.frog.position.set(this.GAME_WIDTH * 0.5, 900)
  }

  private addBonusFrog() {
    this.bonusFrog = Spine.from({ skeleton: SpineNames.FROG_BONUS, atlas: `${SpineNames.FROG_BONUS}-atlas` })
    this.frogContainer.addChild(this.bonusFrog)
    this.bonusFrog.skeleton.setToSetupPose()
    this.bonusFrog.update(0)
    this.bonusFrog.position.set(this.GAME_WIDTH * 0.5, 900)
    this.bonusFrog.alpha = 0
  }

  addCoefTextAnimation(coef: number, isSuccess = false, isBonus = false, onComplete?: () => void) {
    const animDelay = 0.3
    const animDuration = 0.5
    const scale = 1.1

    const color = isSuccess ? 0xd8d503 : 0xe12500
    const coefText = new Text({
      text: `${coef}x`,
      style: new TextStyle({
        fontSize: 58,
        fill: color,
        fontFamily: FontFamilyNames.ERASDEMI,
      }),
    })
    this.frogContainer.addChild(coefText)
    coefText.filters = [new DropShadowFilter({ color, offset: { x: 0, y: 0 }, blur: 8, alpha: 0.75 })]
    coefText.alpha = 0

    if (isBonus) {
      coefText.anchor.set(0.5)
      coefText.position.set(this.GAME_WIDTH * 0.5, this.frog.y - 650)
      coefText.scale.set(0)

      gsap.fromTo(
        coefText.scale,
        { x: 0, y: 0 },
        {
          duration: 0.4,
          ease: 'linear',
          delay: animDelay,
          x: scale,
          y: scale,
          onComplete: () => {
            gsap.fromTo(
              coefText.scale,
              { x: scale, y: scale },
              {
                duration: 0.25,
                delay: animDelay,
                ease: 'linear',
                x: 0,
                y: 0,
                onComplete: () => {
                  onComplete?.()
                },
              },
            )
          },
        },
      )
      gsap.fromTo(coefText, { alpha: 0 }, { duration: animDuration, delay: animDelay, repeatDelay: 0.2, alpha: 1, repeat: 1, yoyo: true })
    } else {
      coefText.position.set((this.GAME_WIDTH - coefText.width) * 0.5 - 10, this.frog.y - 300)

      gsap.to(coefText, {
        duration: animDuration,
        alpha: 1,
        delay: animDelay,
        y: coefText.y - 300,
        ease: 'linear',
        onComplete: () => {
          gsap.to(coefText, {
            duration: animDuration,
            alpha: 0,
            y: coefText.y - 100,
            onComplete: () => {
              coefText.destroy()
            },
          })
        },
      })
    }
  }

  showNormalFrog() {
    gsap.to(this.frog, { duration: 0.01, alpha: 1 })
    gsap.to(this.bonusFrog, { duration: 0.01, alpha: 0 })
    this.frog.state.setAnimation(0, AnimationNames.NORMAL, true)
  }

  private animateBonusFrog(coef: number, onFinished?: () => void) {
    gsap.to(this.frog, { duration: 0.01, alpha: 0 })
    gsap.to(this.bonusFrog, { duration: 0.01, alpha: 1 })

    let animCount = 8

    this.bonusFrog.state.setAnimation(0, AnimationNames.BONUSE_WIN_SHAKE, true)
    this.bonusFrog.state.addListener({
      complete: () => {
        if (animCount > 0) {
          this.bonusFrog.state.setAnimation(0, AnimationNames.BONUSE_WIN_SHAKE, false)
        } else if (animCount === 0) {
          this.bonusFrog.state.setAnimation(0, AnimationNames.BONUSE_WIN_JUMP, false)
          this.addCoefTextAnimation(coef, true, true, () => {
            onFinished?.()
          })
        } else {
          this.showNormalFrog()
          this.bonusFrog.state.clearListeners()
        }
        animCount--
      },
    })
  }

  changeFrogAnimation(name: StateNameValue, coef: number | null = null, onFinished?: () => void) {
    if (name === StateNames.DEFAULT) {
      this.frog.state.setAnimation(0, AnimationNames.NORMAL, true)
      onFinished?.()
    } else if (name === StateNames.BONUS) {
      this.animateBonusFrog(coef!, onFinished)
    } else if (name === StateNames.WIN) {
      this.frog.state.setAnimation(0, AnimationNames.SUCCESS, false)
      this.addCoefTextAnimation(coef!, true)
      this.listenToAnimationEnding(onFinished)
    } else if (name === StateNames.LOOSE) {
      this.frog.state.setAnimation(0, AnimationNames.SUCCESS, false)
      this.addCoefTextAnimation(coef!, false)
      this.listenToAnimationEnding(onFinished)
    } else if (name === StateNames.ZERO) {
      this.frog.state.setAnimation(0, AnimationNames.FAILED, false)
      this.listenToAnimationEnding(onFinished)
    }
  }

  private listenToAnimationEnding(onFinished?: () => void) {
    this.frog.state.addListener({
      complete: () => {
        if (this.frog.alpha !== 0) {
          this.frog.state.setAnimation(0, AnimationNames.NORMAL, true)
          onFinished?.()
        }
        this.frog.state.clearListeners()
      },
    })
  }
}

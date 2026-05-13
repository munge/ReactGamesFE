/**
 * Frog Game page
 *
 * Ported from MiniGamesFE (jQuery + PixiJS v6) to React + PixiJS v8.
 *
 * Architecture:
 *  - Spine assets loaded via @esotericsoftware/spine-pixi-v8 (registered as
 *    a PixiJS Assets extension before the bundle is loaded)
 *  - GameView manages all Pixi/Spine rendering; communicates back via callbacks
 *  - React state drives UI controls (bet, risk, autoplay, history)
 *  - Howler handles sounds
 *  - placeBet() is a placeholder — replace with your real API call
 */
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import type { Application } from 'pixi.js'
import { Howl } from 'howler'
import LoadingScreen from '@common/components/ui/LoadingScreen/LoadingScreen'
import PixiStage from '@common/pixi/PixiStage'
import { pixiAssetsLoader } from '@common/pixi/PixiAssetsLoader'
import { useMeta } from '@common/seo/useMeta'
import { FROG_BUNDLE } from './assets.manifest'
import { meta } from './meta'
import { GameView } from './view/game.view'
import { RiskType, StateNames } from './enums/constantNames'
import type { RiskTypeValue } from './enums/constantNames'
import styles from './FrogGame.module.scss'

// ─── Spine plugin registration ────────────────────────────────────────────────
// Must be imported once so PixiJS Assets can parse .json/.atlas spine files
import '@esotericsoftware/spine-pixi-v8'

// ─── Types ────────────────────────────────────────────────────────────────────
type LoadState = 'loading' | 'ready' | 'error'

interface HistoryItem {
  coef: number
  id: number
}

// ─── Sound manager ────────────────────────────────────────────────────────────
const BASE_SOUND = '/assets/frog/sounds'
const sounds: Record<string, Howl> = {
  bg:          new Howl({ src: [`${BASE_SOUND}/bg.mp3`],           loop: true,  volume: 0.4 }),
  bet:         new Howl({ src: [`${BASE_SOUND}/bet.mp3`],          volume: 0.8 }),
  betMinus:    new Howl({ src: [`${BASE_SOUND}/bet-minus.mp3`],    volume: 0.8 }),
  betPlus:     new Howl({ src: [`${BASE_SOUND}/bet-plus.mp3`],     volume: 0.8 }),
  autoplay:    new Howl({ src: [`${BASE_SOUND}/autoplay.mp3`],     volume: 0.8 }),
  autoplayOff: new Howl({ src: [`${BASE_SOUND}/autoplay-off.mp3`], volume: 0.8 }),
  riskChange0: new Howl({ src: [`${BASE_SOUND}/risk-change-0.mp3`],volume: 0.8 }),
  riskChange1: new Howl({ src: [`${BASE_SOUND}/risk-change-1.mp3`],volume: 0.8 }),
  riskChange2: new Howl({ src: [`${BASE_SOUND}/risk-change-2.mp3`],volume: 0.8 }),
  zero:        new Howl({ src: [`${BASE_SOUND}/zero.mp3`],         volume: 0.8 }),
  loose:       new Howl({ src: [`${BASE_SOUND}/loose.mp3`],        volume: 0.8 }),
  partialwin:  new Howl({ src: [`${BASE_SOUND}/partial-win.mp3`],  volume: 0.8 }),
  win:         new Howl({ src: [`${BASE_SOUND}/win.mp3`],          volume: 0.8 }),
  bigwin:      new Howl({ src: [`${BASE_SOUND}/bigwin.mp3`],       volume: 0.8 }),
}
const playSound = (key: string) => sounds[key]?.play()

// ─── Bet API placeholder ──────────────────────────────────────────────────────
// Replace this function with your real server API call.
const BIG_WIN_MULTIPLIER = 10

async function placeBet(_amount: number, _riskType: RiskTypeValue): Promise<{ coefficient: number }> {
  await new Promise(r => setTimeout(r, 600))
  const rand = Math.random()
  let coef: number
  if (rand < 0.35)      coef = 0
  else if (rand < 0.55) coef = parseFloat((Math.random() * 0.49 + 0.01).toFixed(2))
  else if (rand < 0.80) coef = parseFloat((Math.random() * 0.49 + 0.5).toFixed(2))
  else if (rand < 0.95) coef = parseFloat((Math.random() * 8 + 1).toFixed(2))
  else                  coef = parseFloat((Math.random() * 40 + 10).toFixed(2))
  return { coefficient: coef }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getStateForCoef(coef: number) {
  if (coef >= BIG_WIN_MULTIPLIER) return StateNames.BONUS
  if (coef >= 1)                  return StateNames.WIN
  if (coef > 0)                   return StateNames.LOOSE
  return StateNames.ZERO
}


// ─── Component ────────────────────────────────────────────────────────────────
const FrogGame: React.FC = () => {
  useMeta(meta)

  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [progress,  setProgress]  = useState(0)
  const [errorMsg,  setErrorMsg]  = useState('')

  const [betAmount, setBetAmount] = useState(5.00)
  const [riskType,  setRiskType]  = useState<RiskTypeValue>(RiskType.MEDIUM)
  const [autoplay,  setAutoplay]  = useState(false)
  const [waiting,   setWaiting]   = useState(false)
  const [history,   setHistory]   = useState<HistoryItem[]>([])

  const gameViewRef     = useRef<GameView | null>(null)
  const autoplayRef     = useRef(false)
  const waitingRef      = useRef(false)
  const autoplayTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const betAmountRef    = useRef(betAmount)
  const riskTypeRef     = useRef(riskType)

  useEffect(() => { autoplayRef.current = autoplay },   [autoplay])
  useEffect(() => { waitingRef.current  = waiting },    [waiting])
  useEffect(() => { betAmountRef.current = betAmount },  [betAmount])
  useEffect(() => { riskTypeRef.current  = riskType },   [riskType])

  // ── Asset loading ──────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        await pixiAssetsLoader.loadBundle(FROG_BUNDLE, p => { if (!cancelled) setProgress(p) })
        if (!cancelled) setLoadState('ready')
      } catch (err) {
        if (!cancelled) {
          setErrorMsg(err instanceof Error ? err.message : 'Failed to load assets')
          setLoadState('error')
        }
      }
    }
    load()
    return () => {
      cancelled = true
      pixiAssetsLoader.unloadBundle(FROG_BUNDLE.name).catch(() => {})
    }
  }, [])

  // ── Pixi scene init ────────────────────────────────────────────────────────
  const handlePixiReady = useCallback((app: Application) => {
    const view = new GameView(app, 1000, 1000)
    view.initGame()
    gameViewRef.current = view
    setTimeout(() => playSound('bg'), 1000)
  }, [])

  // ── Bet execution ──────────────────────────────────────────────────────────
  const executeBet = useCallback((amount: number, risk: RiskTypeValue) => {
    if (!gameViewRef.current) return

    waitingRef.current = true
    setWaiting(true)
    gameViewRef.current.SpeedUp()

    placeBet(amount, risk)
      .then(({ coefficient: coef }) => {
        if (!gameViewRef.current) return
        gameViewRef.current.SpeedDown()

        if (coef >= BIG_WIN_MULTIPLIER)   playSound('bigwin')
        else if (coef >= 1)               playSound('win')
        else if (coef >= 0.5)             playSound('partialwin')
        else if (coef === 0)              playSound('zero')
        else                              playSound('loose')

        gameViewRef.current.changeFrogAnimation(getStateForCoef(coef), coef, () => {
          if (coef < BIG_WIN_MULTIPLIER) {
            waitingRef.current = false
            setWaiting(false)
          }
        })

        setHistory(prev => [{ coef, id: Date.now() }, ...prev.slice(0, 19)])

        if (autoplayTimeout.current) clearTimeout(autoplayTimeout.current)
        autoplayTimeout.current = setTimeout(
          () => {
            autoplayTimeout.current = null
            waitingRef.current = false
            setWaiting(false)
            if (autoplayRef.current) executeBet(betAmountRef.current, riskTypeRef.current)
          },
          coef >= BIG_WIN_MULTIPLIER ? 4000 : 1600,
        )
      })
      .catch(() => {
        waitingRef.current = false
        setWaiting(false)
        setAutoplay(false)
        autoplayRef.current = false
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleBet = () => {
    if (waiting) return
    playSound('bet')
    executeBet(betAmount, riskType)
  }

  const handleAutoplay = () => {
    if (waiting && !autoplay) return
    if (autoplay) {
      setAutoplay(false)
      autoplayRef.current = false
      if (autoplayTimeout.current) { clearTimeout(autoplayTimeout.current); autoplayTimeout.current = null }
      playSound('autoplayOff')
    } else {
      setAutoplay(true)
      autoplayRef.current = true
      playSound('autoplay')
      executeBet(betAmount, riskType)
    }
  }

  const handleRiskMinus = () => {
    if (waiting) return
    const next = Math.max(0, riskType - 1) as RiskTypeValue
    setRiskType(next)
    playSound(`riskChange${next}`)
  }

  const handleRiskPlus = () => {
    if (waiting) return
    const next = Math.min(2, riskType + 1) as RiskTypeValue
    setRiskType(next)
    playSound(`riskChange${next}`)
  }

  const handleBetMinus = () => {
    if (waiting) return
    playSound('betMinus')
    setBetAmount(prev => Math.max(0.1, parseFloat((prev - 1).toFixed(2))))
  }

  const handleBetPlus = () => {
    if (waiting) return
    playSound('betPlus')
    setBetAmount(prev => parseFloat((prev + 1).toFixed(2)))
  }

  useEffect(() => {
    return () => {
      if (autoplayTimeout.current) clearTimeout(autoplayTimeout.current)
      sounds.bg.stop()
    }
  }, [])

  // ── Error ──────────────────────────────────────────────────────────────────
  if (loadState === 'error') {
    return (
      <div className={styles.error}>
        <p>Failed to load assets: {errorMsg}</p>
        <Link to="/">← Back to Lobby</Link>
      </div>
    )
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loadState !== 'ready') {
    return <LoadingScreen progress={progress} message="Loading Frog…" />
  }

  const controlsDisabled = waiting && !autoplay

  // ── Game ───────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.backLink}>← Lobby</Link>
        <span className={styles.navTitle}>Frog</span>
      </nav>

      <main className={styles.main}>
        {/* ── Canvas + History ── */}
        <div className={styles.gameContainer}>
          <div className={styles.canvasWrap}>
            <PixiStage
              width={1000}
              height={1000}
              backgroundColor={0x0c121e}
              onReady={handlePixiReady}
              className={styles.canvas}
            />
          </div>

          <div className={`${styles.gameHistory}${history.length > 0 ? ` ${styles.visible}` : ''}`}>
            {history.map(item => (
              <div
                key={item.id}
                className={`${styles.historyItem}${item.coef >= 1 ? ` ${styles.win}` : ''}`}
              >
                {item.coef}x
              </div>
            ))}
          </div>
        </div>

        {/* ── Betslip ── */}
        <div className={styles.betslip}>
          <div className={styles.betSetting}>

            {/* Bet amount changer */}
            <div className={styles.leftWrapper}>
              <div className={styles.betChangerWrapper}>
                <button
                  className={`${styles.inputBtn} ${styles.minus}`}
                  onClick={handleBetMinus}
                  disabled={controlsDisabled}
                />
                <input
                  className={styles.betInput}
                  type="number"
                  min={0.1}
                  step={1}
                  value={betAmount}
                  onChange={e => setBetAmount(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                  disabled={controlsDisabled}
                />
                <button
                  className={`${styles.inputBtn} ${styles.plus}`}
                  onClick={handleBetPlus}
                  disabled={controlsDisabled}
                />
              </div>

              {/* Risk selector */}
              <div className={styles.gameControlsWrapper}>
                <div className={`${styles.borderedBox} ${styles.gameRiskWrapper}`}>
                  <div className={styles.inputWrapper}>
                    <div className={styles.inputAmount}>
                      <button
                        className={`${styles.inputBtn} ${styles.minus}${riskType === RiskType.LOW ? ` ${styles.edge}` : ''}`}
                        onClick={handleRiskMinus}
                        disabled={controlsDisabled || riskType === RiskType.LOW}
                      />
                      <ul>
                        <li className={riskType === RiskType.LOW    ? styles.active : undefined}>Low</li>
                        <li className={riskType === RiskType.MEDIUM ? styles.active : undefined}>Medium</li>
                        <li className={riskType === RiskType.HIGH   ? styles.active : undefined}>High</li>
                      </ul>
                      <button
                        className={`${styles.inputBtn} ${styles.plus}${riskType === RiskType.HIGH ? ` ${styles.edge}` : ''}`}
                        onClick={handleRiskPlus}
                        disabled={controlsDisabled || riskType === RiskType.HIGH}
                      />
                    </div>
                    <span className={styles.title}>Game Risk</span>
                  </div>
                </div>

                {/* Autoplay */}
                <button
                  className={`${styles.autoplayStepBox}${autoplay ? ` ${styles.active}` : ''}`}
                  onClick={handleAutoplay}
                  disabled={waiting && !autoplay}
                >
                  Autoplay
                </button>
              </div>
            </div>

            {/* Bet button */}
            <div className={styles.wrapperButtons}>
              <button
                className={`${styles.betButton}${waiting ? ` ${styles.loading}` : ''}`}
                onClick={handleBet}
                disabled={waiting || autoplay}
              >
                {waiting ? 'Betting…' : 'Bet'}
              </button>
            </div>

          </div>

          {/* Limits */}
          <div className={styles.limits}>
            <span>Min: 0.10</span>
            <span>Max: 10,000</span>
          </div>
        </div>
      </main>
    </div>
  )
}

export default FrogGame

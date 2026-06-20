import { useEffect, useMemo, useCallback, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, ChevronDown } from 'lucide-react'
import type { MixerConfig, MixerOutcomeType, MixerIngredient } from '../types/mixer.types'
import { useSlotAnimation } from '../hooks/useSlotAnimation'
import { useChargeMechanic } from '../hooks/useChargeMechanic'
import { useMixerLogic } from '../hooks/useMixerLogic'
import SlotMachine from '../components/SlotMachine'
import AnnaPanel from '../components/AnnaPanel'
import NutrientsBlock from '../components/NutrientsBlock'
import DishResult from '../components/DishResult'
import { isGodModeEnabled } from '../../achievements/config/achievementsGodMode'
import { getBgUrl } from '../../achievements/utils/imageMap'
import { mixerSounds } from '../services/mixerSounds'

interface MixerScreenProps {
  config: MixerConfig
  onClose: () => void
}

function GodModeChip({
  selectedIngredients,
  chargeLevel,
  onForceOutcome,
  onSkipSpin,
  onSkipAll,
}: {
  selectedIngredients: MixerIngredient[]
  chargeLevel: number
  onForceOutcome: (outcome: MixerOutcomeType) => void
  onSkipSpin: () => void
  onSkipAll: () => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="absolute top-2 left-2 z-40">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-zinc-900/60 backdrop-blur-sm text-[9px] text-amber-400 font-bold hover:bg-zinc-800/80 transition cursor-pointer border border-zinc-700/40"
      >
        GM <ChevronDown className={`w-2.5 h-2.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 p-2 rounded-lg bg-zinc-900/85 backdrop-blur-sm border border-zinc-700/40 min-w-[180px]"
        >
          <p className="text-[8px] text-zinc-400 mb-1 leading-tight">
            {selectedIngredients.map((i) => i.name).join(', ')}
            <br />Заряд: {chargeLevel.toFixed(1)}с
          </p>
          <div className="flex flex-wrap gap-1">
            <button onClick={() => onForceOutcome('A')} className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-700 text-white font-semibold hover:bg-emerald-600 transition cursor-pointer">A</button>
            <button onClick={() => onForceOutcome('B')} className="text-[8px] px-1.5 py-0.5 rounded bg-red-700 text-white font-semibold hover:bg-red-600 transition cursor-pointer">B</button>
            <button onClick={() => onForceOutcome('C')} className="text-[8px] px-1.5 py-0.5 rounded bg-violet-700 text-white font-semibold hover:bg-violet-600 transition cursor-pointer">C</button>
            <button onClick={onSkipSpin} className="text-[8px] px-1.5 py-0.5 rounded bg-amber-700 text-white font-semibold hover:bg-amber-600 transition cursor-pointer">Skip spin</button>
            <button onClick={onSkipAll} className="text-[8px] px-1.5 py-0.5 rounded bg-sky-700 text-white font-semibold hover:bg-sky-600 transition cursor-pointer">Skip all</button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

const SCENARIO_BAR_GRADIENT: Record<string, string> = {
  positive: 'linear-gradient(90deg, #059669, #FCD34D, #059669)',
  negative: 'linear-gradient(90deg, #DC2626, #FB923C, #FCD34D)',
}

export default function MixerScreen({ config, onClose }: MixerScreenProps) {
  const charge = useChargeMechanic()
  const slotAnim = useSlotAnimation()
  const mixer = useMixerLogic(config)

  const [bgError, setBgError] = useState(false)
  const [showPostContent, setShowPostContent] = useState(false)
  const [showClose, setShowClose] = useState(false)
  const [barWidth, setBarWidth] = useState(0)
  const [barTransition, setBarTransition] = useState('none')
  const spinStartRef = useRef(0)
  const hasTriggeredSpin = useRef(false)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const bgUrl = useMemo(
    () => (config.achievementBackground && !bgError ? getBgUrl(config.achievementBackground) : undefined),
    [config.achievementBackground, bgError],
  )

  const [entrancePhase, setEntrancePhase] = useState<'entering' | 'landed'>('entering')

  const phaseOrder = ['ready', 'spinning', 'stopping_0', 'stopping_1', 'stopping_2', 'stopping_3', 'bomb', 'reveal']
  const phaseIdx = phaseOrder.indexOf(slotAnim.phase)
  const reelStopped = [phaseIdx >= 2, phaseIdx >= 3, phaseIdx >= 4, phaseIdx >= 5]
  const isSpinning = slotAnim.phase === 'spinning'
  const isPostSpin = (slotAnim.phase === 'bomb' || slotAnim.phase === 'reveal')
  const isRevealed = slotAnim.phase === 'reveal' && mixer.geminiResult !== null
  const chargeDisabled = slotAnim.phase !== 'ready' || hasTriggeredSpin.current || mixer.isGeminiLoading

  const handleLeverRelease = useCallback(
    (seconds: number) => {
      if (seconds <= 0.15 || hasTriggeredSpin.current || slotAnim.phase !== 'ready') return
      hasTriggeredSpin.current = true
      setShowPostContent(false)
      setShowClose(false)
      setBarWidth(0)
      setBarTransition('none')
      spinStartRef.current = Date.now()
      slotAnim.startSpin(seconds)
      mixer.triggerSpin(seconds)
    },
    [slotAnim, mixer],
  )

  useEffect(() => {
    charge.onPull(handleLeverRelease)
  }, [charge, handleLeverRelease])

  // Progress bar — follow charge while held, drain on release
  useEffect(() => {
    if (charge.isHeld) {
      setBarTransition('width 0.08s linear')
      setBarWidth(charge.chargeProgress)
    }
  }, [charge.isHeld, charge.chargeProgress])

  useEffect(() => {
    if (!charge.isHeld) {
      setBarTransition('width 0.45s cubic-bezier(0.22, 1, 0.36, 1)')
      setBarWidth(0)
    }
  }, [charge.isHeld])

  // Background music on mount
  useEffect(() => {
    mixerSounds.startBgMusic()
    return () => {
      mixerSounds.stopBgMusic()
      mixerSounds.dispose()
    }
  }, [])

  // Line-complete sound when all reels stop
  useEffect(() => {
    if (slotAnim.phase === 'bomb') {
      mixerSounds.playLineComplete()
    }
  }, [slotAnim.phase])

  // Anna appear sound
  useEffect(() => {
    if (showPostContent) {
      mixerSounds.playAnnaAppear()
    }
  }, [showPostContent])

  // Auto-skip slot when Gemini data arrives (minimum 2s spin)
  useEffect(() => {
    if (!mixer.geminiResult || slotAnim.phase === 'reveal' || slotAnim.phase === 'ready') return
    const elapsed = Date.now() - spinStartRef.current
    const minSpin = 2000
    if (elapsed >= minSpin) {
      slotAnim.skipToReveal()
    } else {
      const t = setTimeout(() => slotAnim.skipToReveal(), minSpin - elapsed)
      timersRef.current.push(t)
      return () => {
        clearTimeout(t)
        timersRef.current = timersRef.current.filter((x) => x !== t)
      }
    }
  }, [mixer.geminiResult, slotAnim])

  // Show DishResult + post-spin content when both slot and AI are ready
  useEffect(() => {
    if (isRevealed && !showPostContent) {
      const t = setTimeout(() => setShowPostContent(true), 800)
      timersRef.current.push(t)
      return () => {
        clearTimeout(t)
        timersRef.current = timersRef.current.filter((x) => x !== t)
      }
    }
    if (!isRevealed) {
      setShowPostContent(false)
    }
  }, [isRevealed])

  const handleReelStop = useCallback((_index: number) => {}, [])

  // Anna typing complete → show close button after delay
  const annaDoneRef = useRef(false)
  const handleAnnaTypingComplete = useCallback(() => {
    if (annaDoneRef.current) return
    annaDoneRef.current = true
    const t = setTimeout(() => {
      setShowClose(true)
    }, 1000)
    timersRef.current.push(t)
  }, [])

  const handleForceOutcome = useCallback(
    (outcome: MixerOutcomeType) => {
      mixerSounds.playLineComplete()
      slotAnim.skipToReveal()
      mixer.forceResult(outcome, 5)
      hasTriggeredSpin.current = true
      annaDoneRef.current = false
      setShowPostContent(false)
      setShowClose(false)
      setBarWidth(0)
      setBarTransition('none')
      spinStartRef.current = Date.now()
    },
    [slotAnim, mixer],
  )

  const showGodMode = isGodModeEnabled()

  // Cleanup timers
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      {/* 9:16 phone frame */}
      <div
        className="relative w-full max-w-[420px] rounded-[40px] overflow-hidden bg-zinc-900 shadow-[0_24px_54px_-10px_rgba(0,0,0,0.5)] flex flex-col"
        style={{ aspectRatio: '9 / 16', maxHeight: 'calc(100dvh - 1.5rem)' }}
      >
        {/* Background — fills the 9:16 frame */}
        <div className="absolute inset-0 overflow-hidden">
          {bgUrl ? (
            <div className="w-full h-full flex items-center justify-center bg-zinc-900">
              <img
                src={bgUrl}
                alt=""
                className="h-full w-auto object-contain"
                onError={() => setBgError(true)}
              />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black" />
          )}
          {/* Light vignette for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />
        </div>

      {/* God Mode — compact top-left */}
      {showGodMode && (
        <GodModeChip
          selectedIngredients={mixer.ingredients}
          chargeLevel={charge.chargeLevel}
          onForceOutcome={handleForceOutcome}
          onSkipSpin={() => slotAnim.skipToReveal()}
          onSkipAll={() => {
            mixerSounds.playLineComplete()
            slotAnim.skipToReveal()
            mixer.triggerSpin(8)
            hasTriggeredSpin.current = true
            annaDoneRef.current = false
            setShowPostContent(false)
            setShowClose(false)
          }}
        />
      )}

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition cursor-pointer active:scale-90 z-30"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Scrollable content area */}
      <div className="relative z-10 flex-1 flex flex-col min-h-0 overflow-y-auto">
        {/* Title — culinary casino style */}
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="text-center pt-5 pb-1"
        >
          <span className="text-lg font-black tracking-wider"
            style={{
              color: '#FFD700',
              textShadow: '0 0 12px rgba(255,215,0,0.5), 0 2px 8px rgba(0,0,0,0.6), 0 0 30px rgba(255,215,0,0.2)',
            }}
          >
            ✦ УДАЧНАЯ КУХНЯ ✦
          </span>
        </motion.h1>

        {/* Dish name — WOW moment */}
        <AnimatePresence>
          {isRevealed && mixer.geminiResult && (
            <motion.div
              key="dish-wow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DishResult
                dishName={mixer.geminiResult.dishName}
                outcomeType={mixer.outcomeType}
                isVisible={true}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Slot machine body */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          onAnimationComplete={() => setEntrancePhase('landed')}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 20,
            mass: 1,
          }}
          className="flex-shrink-0"
        >
          <SlotMachine
            ingredients={mixer.ingredients}
            isSpinning={isSpinning}
            reelStopped={reelStopped}
            showConfetti={slotAnim.showConfetti}
            bombFlash={slotAnim.bombFlash}
            scenarioType={config.scenarioType}
            spinSpeed={charge.spinSpeed}
            onReelStop={handleReelStop}
            disabled={slotAnim.phase !== 'ready'}
            showCenterLine={slotAnim.phase === 'bomb' || slotAnim.phase === 'reveal'}
          />
        </motion.div>

        {/* Charge control — below machine */}
        {!isPostSpin && entrancePhase === 'landed' && !hasTriggeredSpin.current && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="mx-4 mb-2"
          >
            <div
              className={`relative h-12 rounded-xl overflow-hidden select-none ${
                chargeDisabled ? 'opacity-40' : 'cursor-pointer'
              }`}
              style={{
                background: 'rgba(24, 24, 27, 0.85)',
                border: '1px solid rgba(113, 113, 122, 0.4)',
                touchAction: 'none',
              }}
              onPointerDown={(e) => {
                e.preventDefault()
                if (!chargeDisabled) charge.startHold()
              }}
              onPointerUp={() => {
                if (charge.isHeld) {
                  const secs = charge.endHold()
                  if (secs > 0) handleLeverRelease(secs)
                }
              }}
              onPointerLeave={() => {
                if (charge.isHeld) {
                  const secs = charge.endHold()
                  if (secs > 0) handleLeverRelease(secs)
                }
              }}
            >
              {/* Progress bar fill */}
              <div
                className="absolute inset-y-0 left-0 rounded-xl"
                style={{
                  width: `${barWidth * 100}%`,
                  transition: barTransition,
                  background: SCENARIO_BAR_GRADIENT[config.scenarioType] || SCENARIO_BAR_GRADIENT.positive,
                }}
              />
              {/* Center text */}
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white/90">
                {charge.isHeld ? `${Math.round(charge.chargeProgress * 100)}%` : 'Нажми и держи'}
              </span>
            </div>
          </motion.div>
        )}

        {/* Post-spin content */}
        {isPostSpin && (
          <div className="flex flex-col pb-4">
            {showPostContent && mixer.geminiResult && (
              <>
                {/* Nutrients block */}
                <NutrientsBlock
                  nutrients={mixer.nutrients!}
                  micronutrients={mixer.micronutrients}
                />

                {/* Anna — single final comment */}
                <AnnaPanel
                  text={mixer.geminiResult.phase2.text}
                  intensity={mixer.geminiResult.phase2.intensity}
                  outcomeType={mixer.outcomeType}
                  ingredientCount={mixer.ingredients.length}
                  onTypingComplete={handleAnnaTypingComplete}
                />

                {/* Close button */}
                {showClose && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-1.5 px-4 pt-2"
                  >
                    {mixer.savedDish && (
                      <p className="text-[10px] text-emerald-400 font-semibold" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
                        Сохранено в «Миксер» ✓
                      </p>
                    )}
                    <button
                      onClick={onClose}
                      className="px-6 py-2 rounded-xl bg-white/10 backdrop-blur-sm text-white font-bold text-sm hover:bg-white/20 transition-all cursor-pointer active:scale-98 border border-white/20"
                    >
                      Закрыть
                    </button>
                  </motion.div>
                )}
              </>
            )}
        </div>
      )}
      </div>
    </div>
  </div>
  )
}

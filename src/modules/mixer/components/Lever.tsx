import { useRef } from 'react'
import { motion } from 'motion/react'
import type { MixerScenarioType } from '../types/mixer.types'

interface LeverProps {
  onPull: (seconds: number) => void
  isHeld: boolean
  chargeLevel: number
  chargeProgress: number
  isAtMax: boolean
  onPointerDown: () => void
  onPointerUp: () => void
  onPointerLeave: () => void
  scenarioType: MixerScenarioType
  disabled: boolean
}

const SCENARIO_COLORS: Record<MixerScenarioType, { rod: string; ball: string; glow: string; ballGlow: string }> = {
  positive: {
    rod: '#B8860B',
    ball: '#FFD700',
    glow: 'rgba(255,215,0,0.4)',
    ballGlow: 'rgba(255,215,0,0.6)',
  },
  negative: {
    rod: '#8B0000',
    ball: '#DC2626',
    glow: 'rgba(220,38,38,0.4)',
    ballGlow: 'rgba(220,38,38,0.6)',
  },
}

export default function Lever({
  onPull,
  isHeld,
  chargeLevel,
  chargeProgress,
  isAtMax,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  scenarioType,
  disabled,
}: LeverProps) {
  const colors = SCENARIO_COLORS[scenarioType]

  // Ball position: UP = at top (y: 0), DOWN = pulled down (y: 70)
  const ballY = isHeld ? 70 : 0
  const rodRotate = isHeld ? 12 : 0
  const ballVibrate = isHeld ? (isAtMax ? 2 : 1) : 0

  return (
    <div
      className={`relative w-10 flex flex-col items-center justify-end select-none ${
        disabled ? 'opacity-40 pointer-events-none' : 'cursor-pointer'
      }`}
      onPointerDown={(e) => {
        e.preventDefault()
        if (!disabled) onPointerDown()
      }}
      onPointerUp={() => {
        if (!disabled) onPointerUp()
      }}
      onPointerLeave={() => {
        if (!disabled) onPointerLeave()
      }}
      style={{ touchAction: 'none' }}
    >
      {/* Charge bar */}
      {isHeld && (
        <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-24 rounded-full bg-zinc-300 overflow-hidden">
          <motion.div
            className="w-full rounded-full"
            style={{
              height: `${chargeProgress * 100}%`,
              backgroundColor: isAtMax ? '#F59E0B' : colors.ball,
              position: 'absolute',
              bottom: 0,
            }}
          />
        </div>
      )}

      <svg
        width="40"
        height="160"
        viewBox="0 0 40 160"
        className="overflow-visible"
      >
        {/* Rod base/ mount */}
        <rect x="14" y="145" width="12" height="10" rx="3" fill="#4B5563" />

        {/* Rod */}
        <motion.line
          x1="20"
          y1="20"
          x2="20"
          y2="145"
          stroke={colors.rod}
          strokeWidth="6"
          strokeLinecap="round"
          animate={{
            rotate: rodRotate,
            transformOrigin: '20px 145px',
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        />

        {/* Ball handle */}
        <motion.circle
          cx="20"
          cy="20"
          r="10"
          fill={colors.ball}
          stroke={isHeld ? colors.glow : 'transparent'}
          strokeWidth="3"
          animate={{
            cy: ballY + 20,
            x: 20 + (isHeld ? (Math.sin(Date.now() * 0.01) * ballVibrate) : 0),
            scale: isAtMax ? [1, 1.08, 1] : 1,
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 15,
            scale: { repeat: isAtMax ? Infinity : 0, duration: 0.6 },
          }}
        />

        {/* Ball glow ring */}
        {isHeld && (
          <motion.circle
            cx="20"
            cy={ballY + 20}
            r="14"
            fill="none"
            stroke={colors.ballGlow}
            strokeWidth="2"
            animate={{
              r: [14, 18, 14],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{ repeat: Infinity, duration: 1.2 }}
          />
        )}

        {/* Max charge burst glow */}
        {isAtMax && (
          <motion.circle
            cx="20"
            cy={ballY + 20}
            r="20"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="1.5"
            animate={{
              r: [20, 28, 20],
              opacity: [0.6, 0.2, 0.6],
            }}
            transition={{ repeat: Infinity, duration: 0.8 }}
          />
        )}
      </svg>
    </div>
  )
}

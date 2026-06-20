import { motion } from 'motion/react'

interface DishResultProps {
  dishName: string
  outcomeType: 'A' | 'B' | 'C'
  isVisible: boolean
}

const OUTCOME_EMBLEM: Record<string, string> = {
  A: '🌟',
  B: '⚡',
  C: '🍀',
}

export default function DishResult({ dishName, outcomeType, isVisible }: DishResultProps) {
  if (!isVisible || !dishName) return null

  return (
    <div className="relative px-6 py-1 flex flex-col items-center overflow-visible min-h-[48px]">
      {/* Screen darkening overlay — appears just before text */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none rounded-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 0.15 }}
        style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
      />

      {/* Title that slams down */}
      <div className="relative z-10 text-center overflow-visible">
        <motion.h3
          initial={{ y: -120, opacity: 0, scale: 0.6 }}
          animate={{
            y: 0,
            opacity: 1,
            scale: 1,
            filter: [
              'brightness(1)',
              'brightness(1.4)',
              'brightness(1)',
              'brightness(1.2)',
              'brightness(1)',
            ],
          }}
          transition={{
            y: { type: 'spring', stiffness: 400, damping: 16, mass: 0.8 },
            opacity: { duration: 0.2 },
            scale: { type: 'spring', stiffness: 400, damping: 16 },
            filter: { duration: 2, ease: 'easeInOut' },
          }}
          onAnimationComplete={() => {
            const el = document.querySelector('[data-mixer-root]') as HTMLElement
            if (el) {
              el.animate(
                [
                  { transform: 'translateX(0)' },
                  { transform: 'translateX(3px)' },
                  { transform: 'translateX(-3px)' },
                  { transform: 'translateX(1px)' },
                  { transform: 'translateX(0)' },
                ],
                { duration: 120, easing: 'ease-out' },
              )
            }
          }}
          className="text-xl font-black leading-tight text-white max-w-[280px] mx-auto"
          style={{
            textShadow:
              '0 0 20px rgba(255,215,0,0.6), 0 0 40px rgba(255,215,0,0.3), 0 2px 8px rgba(0,0,0,0.5)',
          }}
        >
          <span className="mr-1">{OUTCOME_EMBLEM[outcomeType]}</span>
          {dishName}
        </motion.h3>

        {/* Gold particle burst */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {Array.from({ length: 10 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: '#FFD700',
                left: `${42 + Math.random() * 16}%`,
                top: '50%',
                boxShadow: '0 0 6px rgba(255,215,0,0.8)',
              }}
              initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 2.5, 0],
                x: (Math.random() - 0.5) * 70,
                y: -Math.random() * 50 - 10,
              }}
              transition={{ duration: 0.45, delay: Math.random() * 0.15 }}
            />
          ))}
        </motion.div>
      </div>

      {/* Darkening fade-out */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none rounded-xl"
        initial={{ opacity: 0.3 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.25, delay: 0.35 }}
        style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      />
    </div>
  )
}

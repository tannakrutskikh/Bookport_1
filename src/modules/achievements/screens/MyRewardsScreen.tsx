import { useState, useMemo } from 'react'
import { ACHIEVEMENTS } from '../config/achievementContent'
import { CATEGORY_FILTER_LABELS, RARITY_FILTER_LABELS, ALL_CATEGORY_FILTER, ALL_RARITY_FILTER } from '../config/filterConfig'
import type { Achievement } from '../types'
import StatsRow from '../components/StatsRow'
import FilterChips from '../components/FilterChips'
import RarityFilter from '../components/RarityFilter'
import ShowUnearnedToggle from '../components/ShowUnearnedToggle'
import RewardCard from '../components/RewardCard'
import AchievementModal from '../components/AchievementModal'

import type { MixerConfig } from '../../mixer/types/mixer.types'

interface MyRewardsScreenProps {
  onBack: () => void
  userGender: 'male' | 'female'
  isGodMode: boolean
  onMixerLaunch?: (config: MixerConfig) => void
}

export default function MyRewardsScreen({ onBack, userGender, isGodMode, onMixerLaunch }: MyRewardsScreenProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>(ALL_CATEGORY_FILTER)
  const [rarityFilter, setRarityFilter] = useState<string>(ALL_RARITY_FILTER)
  const [showUnearned, setShowUnearned] = useState<boolean>(true)
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)

  const achievements = useMemo(() => {
    return ACHIEVEMENTS.map((a) => ({
      ...a,
      isUnlocked: true,
      isFreshUnlock: a.supportsMixer && !a.isMixerConsumed,
    }))
  }, [])

  const filtered = useMemo(() => {
    return achievements.filter((a) => {
      if (categoryFilter !== ALL_CATEGORY_FILTER && a.category !== categoryFilter) return false
      if (rarityFilter !== ALL_RARITY_FILTER && a.rarity !== rarityFilter) return false
      if (!showUnearned && !a.isUnlocked) return false
      return true
    })
  }, [achievements, categoryFilter, rarityFilter, showUnearned])

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length
  const legendaryCount = achievements.filter((a) => a.rarity === 'Легендарная' && a.isUnlocked).length
  const epicCount = achievements.filter((a) => a.rarity === 'Эпическая' && a.isUnlocked).length
  const totalXp = achievements.filter((a) => a.isUnlocked).reduce((sum, a) => sum + a.xp, 0)

  function handleMixer(achievement: Achievement) {
    onMixerLaunch?.({
      achievementId: achievement.id,
      achievementCategory: achievement.category || '',
      achievementBackground: achievement.background || '',
      scenarioType: (achievement.type === 'positive' ? 'positive' : 'negative'),
      userGender,
    })
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-3">
      <div
        className="relative w-full max-w-[420px] rounded-[40px] overflow-hidden bg-zinc-50 shadow-[0_24px_54px_-10px_rgba(0,0,0,0.5)] flex flex-col"
        style={{ aspectRatio: '9 / 16', maxHeight: 'calc(100dvh - 1.5rem)' }}
      >
        <div className="shrink-0 flex items-center justify-between px-4 pt-2 pb-1">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm font-bold text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer active:scale-95"
          >
            ← Назад
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 min-h-0 scrollbar-thin">
          <div className="mb-4">
            <h1 className="text-[22px] font-black text-zinc-800">Мои награды</h1>
            <p className="text-sm font-medium text-zinc-500 mt-0.5">
              Твой личный зал достижений за 28 дней курса.
            </p>
          </div>

          <div className="mb-4">
            <StatsRow
              total={achievements.length}
              unlocked={unlockedCount}
              xp={totalXp}
              legendary={legendaryCount}
              epic={epicCount}
            />
          </div>

          <div className="mb-2">
            <FilterChips labels={CATEGORY_FILTER_LABELS} selected={categoryFilter} onSelect={setCategoryFilter} />
          </div>

          <div className="flex items-center justify-between mb-3 gap-3">
            <div className="flex-1">
              <RarityFilter labels={RARITY_FILTER_LABELS} selected={rarityFilter} onSelect={setRarityFilter} />
            </div>
            <div className="shrink-0">
              <ShowUnearnedToggle value={showUnearned} onChange={setShowUnearned} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {filtered.map((achievement) => (
              <RewardCard
                key={achievement.id}
                achievement={achievement}
                onSelect={setSelectedAchievement}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-sm text-zinc-400 font-semibold mt-12">
              Нет ачивок по выбранным фильтрам
            </p>
          )}
        </div>

        {selectedAchievement && (
          <AchievementModal
            achievement={selectedAchievement}
            userGender={userGender}
            isGodMode={isGodMode}
            onClose={() => setSelectedAchievement(null)}
            onMixer={handleMixer}
          />
        )}
      </div>
    </div>
  )
}

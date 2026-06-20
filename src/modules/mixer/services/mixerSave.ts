import type { MixerIngredient, MixerScenarioType, MixerOutcomeType } from '../types/mixer.types'

export interface SavedMixerDish {
  id: string
  name: string
  time: string
  tag: string
  category: string
  image: string | null
  ingredients: { name: string; status: 'green' | 'red' | 'yellow' }[]
  calories: number
  protein: number
  fat: number
  carbs: number
  fiber: number
  annaTip: string
  annaComment: string
  nutrientsDetail: string
  mixerIngredients: MixerIngredient[]
  scenarioType: MixerScenarioType
  outcomeType: MixerOutcomeType
  chargeLevel: number
  sourceAchievementId: string
}

const STORAGE_KEY = 'wfpb_saved_dishes'

export function saveMixerDish(dish: SavedMixerDish): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const existing: SavedMixerDish[] = raw ? JSON.parse(raw) : []
    existing.unshift(dish)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.slice(0, 100)))
  } catch (e) {
    console.error('Failed to save mixer dish:', e)
  }
}

export function getSavedDishes(): SavedMixerDish[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

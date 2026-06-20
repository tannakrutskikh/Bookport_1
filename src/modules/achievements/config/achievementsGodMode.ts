const STORAGE_KEY = 'achievements_god_mode'

export function isGodModeEnabled(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(STORAGE_KEY) === 'true'
}

export function setGodMode(enabled: boolean): void {
  if (typeof window === 'undefined') return
  if (enabled) {
    localStorage.setItem(STORAGE_KEY, 'true')
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

const COURSE_START_KEY = 'achievements_course_start_timestamp'

export function getCourseStartTimestamp(): number | null {
  if (typeof window === 'undefined') return null
  const val = localStorage.getItem(COURSE_START_KEY)
  return val ? parseInt(val, 10) : null
}

export function setCourseStartTimestamp(): void {
  if (typeof window === 'undefined') return
  const existing = localStorage.getItem(COURSE_START_KEY)
  if (!existing) {
    localStorage.setItem(COURSE_START_KEY, String(Date.now()))
  }
}

export function getDaysSinceCourseStart(): number {
  const ts = getCourseStartTimestamp()
  if (!ts) return 0
  return Math.floor((Date.now() - ts) / (1000 * 60 * 60 * 24))
}

export function canMix(
  isFreshUnlock: boolean,
  isMixerConsumed: boolean,
): boolean {
  if (!isFreshUnlock) return false
  if (isMixerConsumed) return false
  if (getDaysSinceCourseStart() < 3) return false
  return true
}

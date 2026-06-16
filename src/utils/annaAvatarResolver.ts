import { avatarManifest, type AvatarSeries } from '../assets/images/anna/anna-manifest'

export type ToneGroup =
  | 'positive'
  | 'neutral_thoughtful'
  | 'reminder_caution'
  | 'negative_displeasure'
  | 'mockery_sarcasm'
  | 'surprise_fear'

export type StateNowTabId = 'balance' | 'scales' | 'kbju' | 'micro' | 'composition' | 'dynamics'

export interface AvatarResult {
  key: string
  src: string
  level: number
  toneGroup: ToneGroup
  description: string
}

export interface AvatarParams {
  toneGroup: ToneGroup
  intent?: string
  intensity?: number
}

const intentMap: Record<string, string> = {
  affirmation: 'affirmation',
  important_affirmation: 'important_affirmation',
  support: 'joy_and_support',
  user_success: 'joy_user_success',
  success: 'success',
  joy: 'joy',
  joy_and_admiration: 'joy_and_admiration',
  approval: 'cheerful_approval',
  satisfaction: 'satisfaction',
  satisfaction_user_action: 'satisfaction_user_action',
  laughter_1: 'laughter_1',
  laughter_2: 'laughter_2',
  laughter_and_joy: 'laughter_and_joy_v1',
  thoughtful: 'thoughtful',
  explanation: 'explanation',
  clear_explanation: 'clear_explanation',
  nuance: 'understanding_nuances',
  subtlety: 'subtleties',
  question: 'questioning',
  curiosity: 'curiosity',
  curious_surprise: 'curious_surprise',
  wondering_thought: 'wondering_thought',
  thought_and_surprise: 'thought_and_surprise',
  admiration: 'admiration',
  scrutinizing: 'scrutinizing',
  dreams: 'dreams_and_fantasies',
  fantasizing: 'fantasizing',
  reminder: 'useful_reminder',
  important_reminder: 'important_reminder',
  cheerful_reminder: 'cheerful_reminder',
  caution: 'caution',
  warning: 'warning',
  important_warning: 'important_warning',
  serious_reminder_warning: 'serious_reminder_warning',
  warning_and_prohibition: 'warning_and_prohibition',
  clarification: 'important_clarification',
  annoyed: 'annoyed',
  disappointment: 'disappointment',
  disappointment_and_dissatisfaction: 'disappointment_and_dissatisfaction',
  denial: 'denial',
  denial_and_prohibitions: 'denial_and_prohibitions',
  rejection_denial_fatigue: 'rejection_denial_fatigue',
  offense: 'offense',
  offense_and_anger: 'offense_and_anger',
  irritation_and_anger: 'irritation_and_anger',
  anger: 'anger',
  screaming: 'screaming',
  anna_screaming: 'anna_screaming',
  mockery: 'mockery',
  mockery_interlocutor: 'mockery_interlocutor',
  condescension: 'condescension',
  flirting: 'flirting',
  flirting_and_teasing: 'flirting_and_teasing',
  sweet_sour: 'sweet_sour',
  sweet_to_sour: 'sweet_to_sour',
  surprise: 'surprise',
  frightened_surprise: 'frightened_surprise',
  curiosity_and_surprise: 'curiosity_and_surprise',
  sick: 'sick',
  anna_secrets: 'anna_secrets',
  misunderstanding: 'misunderstanding',
  questioning_surprise_user_action: 'questioning_surprise_user_action',
}

const toneFallback: Record<ToneGroup, string> = {
  positive: 'affirmation',
  neutral_thoughtful: 'thoughtful',
  reminder_caution: 'useful_reminder',
  negative_displeasure: 'disappointment',
  mockery_sarcasm: 'mockery',
  surprise_fear: 'surprise',
}

const GLOBAL_FALLBACK: AvatarResult = {
  key: 'thoughtful',
  src: '/src/assets/images/anna/thoughtful/3.png',
  level: 3,
  toneGroup: 'neutral_thoughtful',
  description: 'Задумчивость (глобальный fallback)',
}

const tabAvatarMap: Record<StateNowTabId, { intent: string; level: number }> = {
  balance: { intent: 'explanation', level: 3 },
  scales: { intent: 'clear_explanation', level: 3 },
  kbju: { intent: 'explanation', level: 3 },
  micro: { intent: 'nuance', level: 3 },
  composition: { intent: 'subtlety', level: 3 },
  dynamics: { intent: 'thoughtful', level: 3 },
}

const generalAvatar: AvatarParams = {
  toneGroup: 'neutral_thoughtful',
  intent: 'reminder',
  intensity: 3,
}

function clampIntensity(raw: number | undefined): number {
  if (raw === undefined || raw === null) return 3
  const clamped = Math.round(raw)
  if (clamped < 1) return 1
  if (clamped > 6) return 6
  return clamped
}

export function resolveAvatar(params: AvatarParams): AvatarResult {
  const { toneGroup, intent, intensity } = params
  const level = clampIntensity(intensity)

  const seriesKey = intent ? intentMap[intent] ?? toneFallback[toneGroup] : toneFallback[toneGroup]

  const matched = avatarManifest.series[seriesKey]
  if (!matched) {
    const fallbackKey = toneFallback[toneGroup]
    const fallbackSeries = avatarManifest.series[fallbackKey]
    if (!fallbackSeries) return GLOBAL_FALLBACK
    return {
      key: fallbackKey,
      src: `/src/assets/images/anna/${fallbackKey}/${level}.png`,
      level,
      toneGroup,
      description: fallbackSeries.description,
    }
  }

  return {
    key: matched.key,
    src: `/src/assets/images/anna/${matched.key}/${level}.png`,
    level,
    toneGroup: matched.toneGroup as ToneGroup,
    description: matched.description,
  }
}

export function resolveAvatarForTab(tabId: StateNowTabId): AvatarResult {
  const mapping = tabAvatarMap[tabId]
  if (!mapping) return resolveAvatar(generalAvatar)
  return resolveAvatar({
    toneGroup: 'neutral_thoughtful',
    intent: mapping.intent,
    intensity: mapping.level,
  })
}

export function resolveGeneralAvatar(): AvatarResult {
  return resolveAvatar(generalAvatar)
}

const stateIntentMap: Record<string, { toneGroup: ToneGroup; intent: string }> = {
  'На связи': { toneGroup: 'positive', intent: 'affirmation' },
  'Слушаю': { toneGroup: 'neutral_thoughtful', intent: 'curiosity' },
  'Думаю': { toneGroup: 'neutral_thoughtful', intent: 'thoughtful' },
  'Отвечаю': { toneGroup: 'neutral_thoughtful', intent: 'clear_explanation' },
  'Занята': { toneGroup: 'reminder_caution', intent: 'clarification' },
}

const textKeywordMap: Array<{ keywords: string[]; toneGroup: ToneGroup; intent: string }> = [
  // ── positive: laughter & joy ──
  { keywords: ['ха-ха', 'хаха', 'смешно', ' lol ', 'умора', 'прикол', 'хохма', 'ржу'], toneGroup: 'positive', intent: 'laughter_1' },
  { keywords: ['обожаю', 'восхищаюсь', 'ты лучшая', 'богиня'], toneGroup: 'positive', intent: 'joy_and_admiration' },
  { keywords: ['горжусь', 'молодец', 'отлично', 'здорово', 'класс', 'красавчик'], toneGroup: 'positive', intent: 'joy_user_success' },
  { keywords: ['красота', 'прекрасно', 'чудесно', 'великолепно', 'потрясающе'], toneGroup: 'positive', intent: 'joy' },
  { keywords: ['доволен', 'супер', 'топ', 'лучше', 'круто', 'шикарно'], toneGroup: 'positive', intent: 'satisfaction_user_action' },

  // ── neutral: deep thought & curiosity ──
  { keywords: ['почему', 'зачем', 'отчего', 'интересно', 'любопытно', 'расскажи'], toneGroup: 'neutral_thoughtful', intent: 'curiosity' },
  { keywords: ['странно', 'непонятно', 'объясни', 'поясни'], toneGroup: 'neutral_thoughtful', intent: 'questioning' },
  { keywords: ['мечтаю', 'если бы', 'представь', 'вообрази', 'фантазия'], toneGroup: 'neutral_thoughtful', intent: 'dreams_and_fantasies' },
  { keywords: ['нюанс', 'тонкость', 'деталь', 'оттенок'], toneGroup: 'neutral_thoughtful', intent: 'subtleties' },
  { keywords: ['вдуматься', 'подумать', 'разобраться', 'осмыслить'], toneGroup: 'neutral_thoughtful', intent: 'wondering_thought' },
  { keywords: ['талант', 'гениально', 'мастерски', 'виртуозно'], toneGroup: 'neutral_thoughtful', intent: 'admiration' },
  { keywords: ['внимание', 'всмотрись', 'приглядись', 'изучи'], toneGroup: 'neutral_thoughtful', intent: 'scrutinizing' },
  { keywords: ['представь', 'вообрази себе', 'а если'], toneGroup: 'neutral_thoughtful', intent: 'fantasizing' },

  // ── negative: displeasure, denial, offense ──
  { keywords: ['нет', 'неправ', 'не согласен', 'отказ', 'не буду'], toneGroup: 'negative_displeasure', intent: 'denial' },
  { keywords: ['ни за что', 'никогда', 'исключено', 'запрети'], toneGroup: 'negative_displeasure', intent: 'denial_and_prohibitions' },
  { keywords: ['обидно', 'обидела', 'грустно', 'жаль', 'жалко'], toneGroup: 'negative_displeasure', intent: 'offense' },
  { keywords: ['возмущён', 'негодую', 'как так'], toneGroup: 'negative_displeasure', intent: 'offense_and_anger' },
  { keywords: ['надоело', 'устал', 'достало', 'бесит', 'раздражает'], toneGroup: 'negative_displeasure', intent: 'irritation_and_anger' },
  { keywords: ['злюсь', 'зол', 'в ярости', 'бешенство', 'взбешён'], toneGroup: 'negative_displeasure', intent: 'anger' },
  { keywords: ['разочарован', 'разочарование', 'не оправдало', 'обманулся'], toneGroup: 'negative_displeasure', intent: 'disappointment' },
  { keywords: ['бесполезно', 'всё зря', 'тщетно', 'разочаровалась'], toneGroup: 'negative_displeasure', intent: 'disappointment_and_dissatisfaction' },
  { keywords: ['крик', 'ааа', 'аааа', 'докричалась'], toneGroup: 'negative_displeasure', intent: 'screaming' },
  { keywords: ['надоела', 'отстань', 'уйди'], toneGroup: 'negative_displeasure', intent: 'annoyed' },

  // ── sarcasm / mockery ──
  { keywords: [' ну-ну', 'конечно-конечно', 'ага конечно', 'ну да ну да'], toneGroup: 'mockery_sarcasm', intent: 'mockery' },
  { keywords: ['подкалываю', 'шучу', 'иронично', 'сарказм'], toneGroup: 'mockery_sarcasm', intent: 'mockery_interlocutor' },
  { keywords: ['снисходительно', 'голубчик', 'дорогуша'], toneGroup: 'mockery_sarcasm', intent: 'condescension' },
  { keywords: ['заигрываю', 'флиртую', 'кокетничаю', ' flirt '], toneGroup: 'mockery_sarcasm', intent: 'flirting' },
  { keywords: ['дразню', 'поддразниваю', 'шалю'], toneGroup: 'mockery_sarcasm', intent: 'flirting_and_teasing' },
  { keywords: ['кисло', 'сладко-кисло', 'двусмысленно', 'сладкое'], toneGroup: 'mockery_sarcasm', intent: 'sweet_sour' },
  { keywords: ['перемена', 'переменилась'], toneGroup: 'mockery_sarcasm', intent: 'sweet_to_sour' },

  // ── surprise / fear ──
  { keywords: ['ничего себе', 'ого', 'не ожидал', 'вот это да', 'не может быть'], toneGroup: 'surprise_fear', intent: 'surprise' },
  { keywords: ['страшно', 'пугающе', 'боюсь', 'испуган', 'жутко'], toneGroup: 'surprise_fear', intent: 'frightened_surprise' },
  { keywords: ['секрет', 'тайна', 'не говори', 'никому', 'по секрету'], toneGroup: 'surprise_fear', intent: 'anna_secrets' },
  { keywords: ['плохо', 'тошнит', 'болит', 'температура', 'простыла', 'нездоровится'], toneGroup: 'surprise_fear', intent: 'sick' },
  { keywords: ['не понимаю', 'запутался', 'непонятно', 'сбит с толку'], toneGroup: 'surprise_fear', intent: 'misunderstanding' },
  { keywords: ['интрига', 'таинственно', 'загадочно'], toneGroup: 'surprise_fear', intent: 'curiosity_and_surprise' },

  // ── reminders & warnings ──
  { keywords: ['опасно', 'опасность', 'тревожно', 'риск'], toneGroup: 'reminder_caution', intent: 'warning' },
  { keywords: ['строго', 'нельзя', 'запрещено', 'ни в коем случае', 'категорически'], toneGroup: 'reminder_caution', intent: 'important_warning' },
  { keywords: ['напомни', 'не забудь', 'помни', 'не забыть'], toneGroup: 'reminder_caution', intent: 'useful_reminder' },
  { keywords: ['внимательно', 'осторожно', 'аккуратно', 'бережно'], toneGroup: 'reminder_caution', intent: 'caution' },
  { keywords: ['очень важно', 'критично', 'срочно', 'внимание'], toneGroup: 'reminder_caution', intent: 'important_reminder' },
  { keywords: ['предупреждаю', 'серьёзно', 'последствия'], toneGroup: 'reminder_caution', intent: 'serious_reminder_warning' },
]

export function resolveAvatarByState(state: string, textContext?: string): AvatarResult {
  if (textContext) {
    const lower = textContext.toLowerCase()
    for (const rule of textKeywordMap) {
      if (rule.keywords.some(kw => lower.includes(kw))) {
        return resolveAvatar({ toneGroup: rule.toneGroup, intent: rule.intent })
      }
    }
  }
  const mapping = stateIntentMap[state]
  if (mapping) {
    return resolveAvatar({ toneGroup: mapping.toneGroup, intent: mapping.intent })
  }
  return resolveGeneralAvatar()
}

/**
 * 「見た／正解した」都道府県の記録と、かくれんぼ・かたちの自己ベストを
 * localStorage に保存する。壊れた値（他バージョンの残骸・手動編集）が
 * あってもアプリを落とさない＝読み込み・書き込みとも try/catch で守る。
 */

const KEY = 'todofuken-master:progress:v1'
const TOTAL_PREFS = 47

export type RoundMode = 'hide' | 'shape'

type PrefEntry = { visited?: boolean; correct?: boolean }

type RoundStat = { bestStreak: number }

type StoredState = {
  prefs: Record<number, PrefEntry>
  hide: RoundStat
  shape: RoundStat
}

function empty(): StoredState {
  return { prefs: {}, hide: { bestStreak: 0 }, shape: { bestStreak: 0 } }
}

function load(): StoredState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return empty()
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return empty()
    const base = empty()
    const prefs =
      parsed.prefs && typeof parsed.prefs === 'object' ? (parsed.prefs as Record<number, PrefEntry>) : base.prefs
    const hide =
      parsed.hide && typeof parsed.hide.bestStreak === 'number' ? (parsed.hide as RoundStat) : base.hide
    const shape =
      parsed.shape && typeof parsed.shape.bestStreak === 'number' ? (parsed.shape as RoundStat) : base.shape
    return { prefs, hide, shape }
  } catch {
    return empty()
  }
}

function save(state: StoredState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // 保存できなくても続行する（プライベートブラウズ等）
  }
  try {
    window.dispatchEvent(new Event('todofuken:progress'))
  } catch {
    // ignore
  }
}

/** さんぽモード：タップして名前を見た県を記録する */
export function recordVisit(code: number) {
  const s = load()
  s.prefs[code] = { ...s.prefs[code], visited: true }
  save(s)
}

/** かくれんぼ・かたちモード：出題に正解した県を記録する */
export function recordCorrect(code: number) {
  const s = load()
  s.prefs[code] = { ...s.prefs[code], correct: true }
  save(s)
}

/** 「覚えた」＝見た or 正解したことがある県の数（47県中） */
export function getKnownCount(): number {
  const s = load()
  return Object.values(s.prefs).filter((p) => p.visited || p.correct).length
}

/** さんぽモードでタップして見た県の数（47県中）＝さんぽ自身の達成率に使う */
export function getVisitedCount(): number {
  const s = load()
  return Object.values(s.prefs).filter((p) => p.visited).length
}

export const KNOWN_TOTAL = TOTAL_PREFS

export function getBestStreak(mode: RoundMode): number {
  return load()[mode].bestStreak
}

/** 連続正解数を更新する（自己ベストを更新したときだけ true を返す） */
export function reportStreak(mode: RoundMode, streak: number): boolean {
  const s = load()
  if (streak > s[mode].bestStreak) {
    s[mode].bestStreak = streak
    save(s)
    return true
  }
  return false
}

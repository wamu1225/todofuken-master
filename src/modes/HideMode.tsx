import { useEffect, useRef, useState } from 'react'
import PrefMap from '../components/PrefMap'
import { PREFECTURES, byCode } from '../data/prefectures'
import { shuffled } from '../lib/shuffle'
import { recordCorrect, getBestStreak, reportStreak } from '../lib/progress'

/**
 * かくれんぼモード：同じ地図から名前が消え、出題された県名を頼りに探す。
 * 正解するまで同じ問題にとどまる（間違えた県は赤く一瞬光るだけでヒントにはしない）。
 * 自己ベストは「間違えずに連続で正解できた数」＝正解が続くほど増え、
 * 1回でも外すと0に戻る（かたちモードと同じ考え方）。
 */
export default function HideMode() {
  const poolRef = useRef<number[]>([])
  const [target, setTarget] = useState<number | null>(null)
  const [wrongPick, setWrongPick] = useState<number | null>(null)
  const [justCorrect, setJustCorrect] = useState(false)
  const [score, setScore] = useState({ correct: 0, asked: 0 })
  const [streak, setStreak] = useState(0)
  const [best, setBest] = useState(() => getBestStreak('hide'))
  const [isNewBest, setIsNewBest] = useState(false)
  const firstTryRef = useRef(true)

  const nextTarget = () => {
    if (poolRef.current.length === 0) {
      poolRef.current = shuffled(PREFECTURES.map((p) => p.code))
    }
    const code = poolRef.current.pop()!
    setTarget(code)
  }

  useEffect(() => {
    nextTarget()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSelect = (code: number) => {
    if (target === null || justCorrect) return
    if (code === target) {
      setJustCorrect(true)
      setWrongPick(null)
      setScore((s) => ({ correct: s.correct + 1, asked: s.asked + 1 }))
      recordCorrect(target)
      if (firstTryRef.current) {
        const newStreak = streak + 1
        setStreak(newStreak)
        if (reportStreak('hide', newStreak)) {
          setBest(newStreak)
          setIsNewBest(true)
        }
      } else {
        setStreak(0)
      }
      firstTryRef.current = true
      window.setTimeout(() => {
        setJustCorrect(false)
        nextTarget()
      }, 650)
    } else {
      firstTryRef.current = false
      setStreak(0)
      setIsNewBest(false)
      setWrongPick(code)
      setScore((s) => ({ ...s, asked: s.asked + 1 }))
      window.setTimeout(() => setWrongPick(null), 900)
    }
  }

  // ③自己発見の改善：外したときに赤く光るだけでは「どこを間違えたか」が
  // 学びにならない（一瞬すぎて、しかも名前が出ない）。実際にプレイして
  // 気づいたので、間違えてクリックした県の名前も一緒に出す。
  const wrongPref = wrongPick === null ? null : byCode.get(wrongPick)

  const targetPref = target === null ? null : byCode.get(target)

  return (
    <>
      <div className="quiz-banner">
        <p className="quiz-question">
          {targetPref ? (
            <>
              <span className="quiz-question-name">{targetPref.name}</span> はどこ？
            </>
          ) : (
            '読み込み中…'
          )}
        </p>
        <p className="quiz-score">
          {score.correct} / {score.asked} 問正解
        </p>
        <p className={isNewBest ? 'quiz-best is-new-best' : 'quiz-best'}>
          連続正解 {streak}（自己ベスト <strong>{best}</strong>）
        </p>
        {wrongPref && <p className="quiz-hint">今クリックしたのは{wrongPref.name}でした</p>}
      </div>

      <div className="map-wrap">
        <PrefMap
          ariaLabel="都道府県あてクイズの地図（名前は表示されません）"
          onSelect={handleSelect}
          classify={(code) => {
            if (justCorrect && code === target) return 'is-correct'
            if (code === wrongPick) return 'is-wrong'
            return ''
          }}
        />
      </div>
    </>
  )
}

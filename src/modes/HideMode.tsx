import { useEffect, useRef, useState } from 'react'
import PrefMap from '../components/PrefMap'
import { PREFECTURES, byCode } from '../data/prefectures'
import { shuffled } from '../lib/shuffle'

/**
 * かくれんぼモード：同じ地図から名前が消え、出題された県名を頼りに探す。
 * 正解するまで同じ問題にとどまる（間違えた県は赤く一瞬光るだけでヒントにはしない）。
 */
export default function HideMode() {
  const poolRef = useRef<number[]>([])
  const [target, setTarget] = useState<number | null>(null)
  const [wrongPick, setWrongPick] = useState<number | null>(null)
  const [justCorrect, setJustCorrect] = useState(false)
  const [score, setScore] = useState({ correct: 0, asked: 0 })

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
      window.setTimeout(() => {
        setJustCorrect(false)
        nextTarget()
      }, 650)
    } else {
      setWrongPick(code)
      setScore((s) => ({ ...s, asked: s.asked + 1 }))
      window.setTimeout(() => setWrongPick(null), 420)
    }
  }

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

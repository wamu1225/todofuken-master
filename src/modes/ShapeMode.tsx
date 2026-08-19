import { useEffect, useRef, useState } from 'react'
import { PREF_SHAPES } from '../data/geo'
import { PREFECTURES, byCode } from '../data/prefectures'
import { pathBounds, squareViewBox } from '../lib/pathBounds'
import { shuffled } from '../lib/shuffle'

const shapeByCode = new Map(PREF_SHAPES.map((s) => [s.code, s]))

/** 県境や位置の手がかりを切り離し、輪郭だけで見分ける力を試す */
export default function ShapeMode() {
  const poolRef = useRef<number[]>([])
  const [target, setTarget] = useState<number | null>(null)
  const [choices, setChoices] = useState<number[]>([])
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState({ correct: 0, asked: 0 })

  const nextTarget = () => {
    if (poolRef.current.length === 0) {
      poolRef.current = shuffled(PREFECTURES.map((p) => p.code))
    }
    const code = poolRef.current.pop()!
    const others = shuffled(PREFECTURES.map((p) => p.code).filter((c) => c !== code)).slice(0, 3)
    setChoices(shuffled([code, ...others]))
    setTarget(code)
    setPicked(null)
  }

  useEffect(() => {
    nextTarget()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handlePick = (code: number) => {
    if (picked !== null || target === null) return
    setPicked(code)
    setScore((s) => ({ correct: s.correct + (code === target ? 1 : 0), asked: s.asked + 1 }))
    window.setTimeout(nextTarget, 900)
  }

  if (target === null) return null
  const shape = shapeByCode.get(target)
  // 県ごとに単独で正規化した shape を使う。mainland と nansei は座標系が別なので
  // 連結してはいけない（両方を持つ鹿児島県だけが潰れて点になっていた・2026-08-19）。
  const combined = shape?.shape ?? ''
  const vb = squareViewBox(pathBounds(combined))

  return (
    <>
      <div className="quiz-banner">
        <p className="quiz-question">この形の都道府県は？</p>
        <p className="quiz-score">
          {score.correct} / {score.asked} 問正解
        </p>
      </div>

      <div className="shape-stage">
        <svg className="shape-svg" viewBox={vb} role="img" aria-label="都道府県の輪郭">
          <path d={combined} className="shape-path" />
        </svg>
      </div>

      <div className="shape-choices">
        {choices.map((code) => {
          const p = byCode.get(code)!
          let cls = 'shape-choice'
          if (picked !== null) {
            if (code === target) cls += ' is-correct'
            else if (code === picked) cls += ' is-wrong'
          }
          return (
            <button key={code} className={cls} onClick={() => handlePick(code)} disabled={picked !== null}>
              {p.name}
            </button>
          )
        })}
      </div>
    </>
  )
}

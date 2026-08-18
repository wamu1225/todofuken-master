import { MAP_FRAME, PREF_SHAPES } from '../data/geo'
import { labelPoint } from '../lib/centroid'

/**
 * 47都道府県の全体地図（本土図＋南西諸島の枠）。さんぽ・かくれんぼの
 * 2モードが同じこの地図を使う（見た目・配置は共通、色分けと問い・名前の
 * 有無だけが変わる＝「地図が消えない」という中心体験）。
 */
const INSET = { x: 24, y: 44, pad: 14 }

export type PrefClassifier = (code: number) => string

type Props = {
  onSelect: (code: number) => void
  classify?: PrefClassifier
  ariaLabel?: string
  /** 県名を地図上に常設表示する（さんぽ＝true、かくれんぼ＝false） */
  showLabels?: boolean
}

const insetBox = {
  x: INSET.x,
  y: INSET.y,
  w: MAP_FRAME.nansei.width + INSET.pad * 2,
  h: MAP_FRAME.nansei.height + INSET.pad * 2,
}

// ラベル位置は形状（パス文字列）から一度だけ計算する（PREF_SHAPES は静的データ）
const LABEL_POINTS = new Map(
  PREF_SHAPES.map((s) => [
    s.code,
    { mainland: s.mainland ? labelPoint(s.mainland) : null, nansei: s.nansei ? labelPoint(s.nansei) : null },
  ]),
)

export default function PrefMap({ onSelect, classify, ariaLabel, showLabels }: Props) {
  const cls = (code: number) => `pref${classify ? ' ' + classify(code) : ''}`

  return (
    <svg
      className="map"
      viewBox={`0 0 ${MAP_FRAME.mainland.width} ${MAP_FRAME.mainland.height}`}
      role="img"
      aria-label={ariaLabel ?? '47都道府県の日本地図'}
    >
      <rect
        className="inset-box"
        x={insetBox.x}
        y={insetBox.y}
        width={insetBox.w}
        height={insetBox.h}
        rx="6"
      />
      <text className="inset-label" x={insetBox.x + 10} y={insetBox.y + 24}>
        南西諸島
      </text>

      {PREF_SHAPES.map((s) =>
        s.mainland ? (
          <path
            key={`m${s.code}`}
            className={cls(s.code)}
            d={s.mainland}
            onClick={() => onSelect(s.code)}
          >
            <title>{s.name}</title>
          </path>
        ) : null,
      )}

      <g transform={`translate(${insetBox.x + INSET.pad} ${insetBox.y + INSET.pad + 14})`}>
        {PREF_SHAPES.map((s) =>
          s.nansei ? (
            <path
              key={`n${s.code}`}
              className={cls(s.code)}
              d={s.nansei}
              onClick={() => onSelect(s.code)}
            >
              <title>{s.name}</title>
            </path>
          ) : null,
        )}
      </g>

      {showLabels &&
        PREF_SHAPES.map((s) => {
          const pt = LABEL_POINTS.get(s.code)?.mainland
          if (!pt) return null
          return (
            <text key={`lm${s.code}`} className="pref-label" x={pt[0]} y={pt[1]} aria-hidden="true">
              {s.name}
            </text>
          )
        })}
      {showLabels && (
        <g transform={`translate(${insetBox.x + INSET.pad} ${insetBox.y + INSET.pad + 14})`}>
          {PREF_SHAPES.map((s) => {
            const pt = LABEL_POINTS.get(s.code)?.nansei
            if (!pt) return null
            return (
              <text key={`ln${s.code}`} className="pref-label pref-label--inset" x={pt[0]} y={pt[1]} aria-hidden="true">
                {s.name}
              </text>
            )
          })}
        </g>
      )}
    </svg>
  )
}

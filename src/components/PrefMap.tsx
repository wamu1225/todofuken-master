import { MAP_FRAME, PREF_SHAPES } from '../data/geo'

/**
 * 47都道府県の全体地図（本土図＋南西諸島の枠）。さんぽ・かくれんぼの
 * 2モードが同じこの地図を使う（見た目・配置は共通、色分けと問いだけが変わる）。
 */
const INSET = { x: 24, y: 44, pad: 14 }

export type PrefClassifier = (code: number) => string

type Props = {
  onSelect: (code: number) => void
  classify?: PrefClassifier
  ariaLabel?: string
}

const insetBox = {
  x: INSET.x,
  y: INSET.y,
  w: MAP_FRAME.nansei.width + INSET.pad * 2,
  h: MAP_FRAME.nansei.height + INSET.pad * 2,
}

export default function PrefMap({ onSelect, classify, ariaLabel }: Props) {
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
    </svg>
  )
}

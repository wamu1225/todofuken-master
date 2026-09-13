import { MAP_FRAME, PREF_SHAPES } from '../data/geo'
import { labelPoint } from '../lib/centroid'
import { pathBounds, paddedViewBox } from '../lib/pathBounds'
import { PREFECTURES, type Region } from '../data/prefectures'

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
  /**
   * 地方を1つに絞って拡大する（さんぽのみ）。全県表示のまま10px前後の
   * ラベルを常設すると実効フォントが3px台まで潰れて読めない
   * （study-apps.com/todofuken-master/ 実測）ため、常設ラベルは
   * 「地方を選んで拡大しているとき」だけに限定し、そのぶん確実に
   * 読める大きさで出す。全体図ではタップ→readout（HTMLテキスト）で読む。
   */
  zoomRegion?: Region | null
}

const REGION_CODES = new Map<Region, number[]>()
for (const p of PREFECTURES) {
  const list = REGION_CODES.get(p.region) ?? []
  list.push(p.code)
  REGION_CODES.set(p.region, list)
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

export default function PrefMap({ onSelect, classify, ariaLabel, showLabels, zoomRegion }: Props) {
  const cls = (code: number) => `pref${classify ? ' ' + classify(code) : ''}`

  // 九州を選んだときは沖縄（本土図に形が無い＝nansei枠だけの県）を除いた
  // 本土側の県だけでズーム範囲を作る。沖縄は全体図または「かくれんぼ」等の
  // タップで別途読む（1県だけなので枠内では常に読める大きさになる＝下記）。
  const zoomCodes = zoomRegion ? (REGION_CODES.get(zoomRegion) ?? []) : null
  const zoomMainlandPaths = zoomCodes
    ? PREF_SHAPES.filter((s) => zoomCodes.includes(s.code) && s.mainland).map((s) => s.mainland)
    : null
  const viewBox =
    zoomMainlandPaths && zoomMainlandPaths.length
      ? paddedViewBox(pathBounds(zoomMainlandPaths.join(' ')), 0.28)
      : `0 0 ${MAP_FRAME.mainland.width} ${MAP_FRAME.mainland.height}`
  const showInset = !zoomRegion
  const labelCodes = zoomRegion ? new Set(zoomCodes ?? []) : null

  return (
    <svg className="map" viewBox={viewBox} role="img" aria-label={ariaLabel ?? '47都道府県の日本地図'}>
      {showInset && (
        <>
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
        </>
      )}

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

      {showInset && (
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
      )}

      {showLabels &&
        labelCodes &&
        PREF_SHAPES.map((s) => {
          if (!labelCodes.has(s.code)) return null
          const pt = LABEL_POINTS.get(s.code)?.mainland
          if (!pt) return null
          return (
            <text key={`lm${s.code}`} className="pref-label" x={pt[0]} y={pt[1]} aria-hidden="true">
              {s.name}
            </text>
          )
        })}
      {showLabels && showInset && (
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

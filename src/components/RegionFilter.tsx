import { REGIONS, type Region } from '../data/prefectures'

/**
 * 地方区分で地図を絞り込むチップ。8色に塗り分けるのではなく、
 * 選んだ1地方だけを既存の強調色（--land-active）でハイライトし、
 * それ以外を沈める方式にしている。
 *
 * 理由：8地方すべてを別の色で塗り分けると、隣り合う都道府県の
 * どの組み合わせも起こり得る地図（choropleth）では色覚多様性に
 * 対して安全な組み合わせを8色ぶん確保できない（4色目以降で
 * 隣接ペアが判別困難になることが色設計の検証で分かっている）。
 * 「選択中は1色だけ」にすれば、色の対比はハイライト色と地色の
 * 1対1になり、色数の問題が起きない。地方名は常にラベルとして
 * チップに残るため、色だけに情報を乗せてもいない。
 */
export default function RegionFilter({
  active,
  onChange,
}: {
  active: Region | null
  onChange: (r: Region | null) => void
}) {
  return (
    <div className="region-filter" role="group" aria-label="地方で絞り込む">
      {REGIONS.map((r) => (
        <button
          key={r}
          className={r === active ? 'region-chip is-active' : 'region-chip'}
          onClick={() => onChange(r === active ? null : r)}
          aria-pressed={r === active}
        >
          {r}
        </button>
      ))}
    </div>
  )
}

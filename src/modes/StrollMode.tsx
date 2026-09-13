import { useState } from 'react'
import PrefMap from '../components/PrefMap'
import RegionFilter from '../components/RegionFilter'
import { byCode, type Region } from '../data/prefectures'
import { recordVisit, getVisitedCount } from '../lib/progress'

/** さんぽモード：自由にタップして名前・よみ・県庁所在地・地方・面積を見る */
export default function StrollMode() {
  const [selected, setSelected] = useState<number | null>(null)
  const [region, setRegion] = useState<Region | null>(null)
  const [visited, setVisited] = useState(() => getVisitedCount())
  const pref = selected === null ? null : byCode.get(selected)

  const handleSelect = (code: number) => {
    setSelected(code)
    recordVisit(code)
    setVisited(getVisitedCount())
  }

  return (
    <div className="stroll-layout">
      <div className="map-wrap">
        <p className="stroll-progress">見た県：{visited} / 47</p>
        <RegionFilter active={region} onChange={setRegion} />
        {!region && (
          <p className="region-hint">
            地方を選ぶと、その地方だけを拡大して県名を表示します。まずは気になる県をタップしてみてください。
          </p>
        )}
        <PrefMap
          showLabels
          zoomRegion={region}
          onSelect={handleSelect}
          classify={(code) => {
            if (code === selected) return 'is-selected'
            if (region) return byCode.get(code)!.region === region ? 'is-region-active' : 'is-region-dim'
            return ''
          }}
        />
      </div>

      <aside className="readout" aria-live="polite">
        {pref ? (
          <>
            <p className="readout-kana">{pref.kana}</p>
            <p className="readout-name">{pref.name}</p>
            <dl>
              <div>
                <dt>けんちょうしょざいち</dt>
                <dd>
                  {pref.capital}
                  <span>（{pref.capitalKana}）</span>
                </dd>
              </div>
              <div>
                <dt>ちほう</dt>
                <dd>{pref.region}</dd>
              </div>
              <div>
                <dt>めんせき</dt>
                <dd>{pref.areaKm2.toLocaleString('ja-JP')} k㎡</dd>
              </div>
            </dl>
          </>
        ) : (
          <p className="readout-empty">
            地図の県をタップすると、ここに名前が出ます。上のボタンで地方ごとに絞り込むこともできます。
          </p>
        )}
      </aside>
    </div>
  )
}

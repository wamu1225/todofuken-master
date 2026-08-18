import { useState } from 'react'
import PrefMap from '../components/PrefMap'
import RegionFilter from '../components/RegionFilter'
import { byCode, type Region } from '../data/prefectures'

/** さんぽモード：自由にタップして名前・よみ・県庁所在地・地方・面積を見る */
export default function StrollMode() {
  const [selected, setSelected] = useState<number | null>(null)
  const [region, setRegion] = useState<Region | null>(null)
  const pref = selected === null ? null : byCode.get(selected)

  const handleSelect = (code: number) => {
    setSelected(code)
  }

  return (
    <div className="stroll-layout">
      <div className="map-wrap">
        <RegionFilter active={region} onChange={setRegion} />
        <PrefMap
          showLabels
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

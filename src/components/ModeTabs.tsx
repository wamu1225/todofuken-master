export type Mode = 'stroll' | 'hide' | 'shape'

const TABS: { id: Mode; label: string; hint: string }[] = [
  { id: 'stroll', label: 'さんぽ', hint: 'タップして名前を見る' },
  { id: 'hide', label: 'かくれんぼ', hint: '名前だけを頼りに探す' },
  { id: 'shape', label: 'かたち', hint: '形だけで当てる' },
]

export default function ModeTabs({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <div className="mode-tabs" role="tablist" aria-label="あそびかた">
      {TABS.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={mode === t.id}
          className={mode === t.id ? 'mode-tab is-active' : 'mode-tab'}
          onClick={() => onChange(t.id)}
        >
          <span className="mode-tab-label">{t.label}</span>
          <span className="mode-tab-hint">{t.hint}</span>
        </button>
      ))}
    </div>
  )
}

import { useState } from 'react'
import './App.css'
import ModeTabs, { type Mode } from './components/ModeTabs'
import StrollMode from './modes/StrollMode'
import HideMode from './modes/HideMode'
import ShapeMode from './modes/ShapeMode'

export default function App() {
  const [mode, setMode] = useState<Mode>('stroll')

  return (
    <div className="sheet">
      <header className="masthead">
        <h1>都道府県マスター</h1>
        <p>日本地図をさわって、47都道府県の場所と形をおぼえます。</p>
        <ModeTabs mode={mode} onChange={setMode} />
      </header>

      <main className="mode-body">
        {mode === 'stroll' && <StrollMode />}
        {mode === 'hide' && <HideMode />}
        {mode === 'shape' && <ShapeMode />}
      </main>
    </div>
  )
}

import { useEffect, useState } from 'react'
import './App.css'
import ModeTabs, { type Mode } from './components/ModeTabs'
import StrollMode from './modes/StrollMode'
import HideMode from './modes/HideMode'
import ShapeMode from './modes/ShapeMode'
import StaticPage from './pages/StaticPage'
import { ABOUT_CONTENT, PRIVACY_CONTENT } from './data/static-pages'

const BASE = '/todofuken-master'

function getCurrentPath(): string {
  if (typeof window === 'undefined') return '/'
  const p = window.location.pathname
  return (p.startsWith(BASE) ? p.slice(BASE.length) : p) || '/'
}

function GameHome() {
  const [mode, setMode] = useState<Mode>('stroll')
  return (
    <>
      <ModeTabs mode={mode} onChange={setMode} />
      <main className="mode-body">
        {mode === 'stroll' && <StrollMode />}
        {mode === 'hide' && <HideMode />}
        {mode === 'shape' && <ShapeMode />}
      </main>
    </>
  )
}

export default function App() {
  const [path, setPath] = useState(getCurrentPath())

  useEffect(() => {
    const onPop = () => setPath(getCurrentPath())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = (to: string) => {
    const url = BASE + to
    if (window.location.pathname !== url) {
      window.history.pushState(null, '', url)
      setPath(to)
      window.scrollTo(0, 0)
    }
  }

  return (
    <div className="sheet">
      <header className="masthead">
        <button className="masthead-link" onClick={() => navigate('/')}>
          <h1>都道府県マスター</h1>
        </button>
        <p>日本地図をさわって、47都道府県の場所と形をおぼえます。</p>
        <nav className="footer-nav footer-nav--top">
          <a href={`${BASE}/about/`} onClick={(e) => { e.preventDefault(); navigate('/about/') }}>サイトについて</a>
          <a href={`${BASE}/privacy/`} onClick={(e) => { e.preventDefault(); navigate('/privacy/') }}>プライバシーポリシー</a>
        </nav>
      </header>

      {path === '/' && <GameHome />}
      {path === '/about/' && (
        <main className="mode-body">
          <StaticPage title="サイトについて" content={ABOUT_CONTENT} />
        </main>
      )}
      {path === '/privacy/' && (
        <main className="mode-body">
          <StaticPage title="プライバシーポリシー" content={PRIVACY_CONTENT} />
        </main>
      )}
    </div>
  )
}

import type { ReactNode } from 'react'

/** about/privacy 用の最小限のマークダウン→JSX変換（見出しと段落のみ）。
 * scripts/prerender.ts の同名ロジックと規則を一致させること。 */
export function mdToNodes(content: string): ReactNode[] {
  return content
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b, i) => {
      if (b.startsWith('## ')) return <h2 key={i}>{b.slice(3)}</h2>
      return <p key={i}>{b}</p>
    })
}

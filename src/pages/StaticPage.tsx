import { mdToNodes } from '../lib/md'

export default function StaticPage({ title, content }: { title: string; content: string }) {
  return (
    <article className="static-page">
      <h1>{title}</h1>
      {mdToNodes(content)}
    </article>
  )
}

import { Link } from 'react-router-dom'
import Cover from './Cover'
import { authorOf, groupOf } from '../data'

export function MangaCard({ manga }) {
  const author = authorOf(manga)
  const group = groupOf(manga)
  return (
    <Link to={`/truyen/${manga.id}`} className="manga-card">
      <div className="thumb">
        <Cover manga={manga} />
      </div>
      <h3>{manga.title}</h3>
      <p className="meta">{author.name} · {group.name}</p>
    </Link>
  )
}

export function MangaGrid({ items }) {
  if (!items?.length) return <div className="empty">Không có truyện phù hợp.</div>
  return (
    <div className="grid-manga">
      {items.map((manga) => <MangaCard key={manga.id} manga={manga} />)}
    </div>
  )
}

export function SectionHead({ title, icon, to, more = 'Xem tất cả' }) {
  return (
    <div className="section-head">
      <h2 className="section-title">{title}{icon}</h2>
      {to && <Link className="link-more" to={to}>{more} →</Link>}
    </div>
  )
}

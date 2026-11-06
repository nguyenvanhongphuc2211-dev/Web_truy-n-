import { Link } from 'react-router-dom'
import { Bookmark, Eye, Heart } from 'lucide-react'
import Cover from './Cover'
import { authorOf, compact, groupOf } from '../data'
import { useStore } from '../store'

export function MangaCard({ manga }) {
  const { authors, groups } = useStore()
  const author = authorOf(manga, authors)
  const group = groupOf(manga, groups)
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

export function ShelfCard({ manga }) {
  const chapters = [...(manga.chapters || [])].sort((a, b) => b.id - a.id).slice(0, 2)
  return (
    <article className="shelf-card">
      <Link to={`/truyen/${manga.id}`} className="shelf-cover" aria-label={manga.title}>
        <Cover manga={manga} crop />
        <span className="shelf-stats">
          <span><Eye size={13} aria-hidden="true" />{compact(manga.views)}</span>
          <span><Heart size={13} aria-hidden="true" />{compact(manga.likes)}</span>
        </span>
      </Link>
      <Link to={`/truyen/${manga.id}`} className="shelf-title">{manga.title}</Link>
      <div className="shelf-chaps">
        {chapters.map((chapter) => (
          <Link key={chapter.id} to={`/doc/${manga.id}/${chapter.id}`} className="shelf-chap">
            <Bookmark size={14} aria-hidden="true" />
            <span>
              <b>Chương {chapter.id}</b>
              {chapter.time ? <small>{chapter.time}</small> : null}
            </span>
          </Link>
        ))}
      </div>
    </article>
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

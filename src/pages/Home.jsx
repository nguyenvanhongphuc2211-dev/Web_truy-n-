import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUp, ChevronLeft, ChevronRight, Eye, Flame, MessageCircle, RefreshCw } from 'lucide-react'
import Cover from '../components/Cover'
import { MangaCard, SectionHead, ShelfCard } from '../components/Bits'
import { authorOf, compact, countByGroup, forumReplies, groupOf, hotScore, seedPosts } from '../data'
import { useTitle } from '../hooks'
import { useCatalog, useStore } from '../store'

function freshness(text = '') {
  const value = String(text)
  const hour = value.match(/(\d+)\s*giờ/)
  if (hour) return Number(hour[1])
  const day = value.match(/(\d+)\s*ngày/)
  if (day) return 24 * Number(day[1])
  if (/hôm nay/i.test(value)) return 1
  return 800
}

const UPDATE_PAGE = 12

function UpdatedShelf({ catalog, history, seen, readFilter, page, onFilter, onPage }) {
  const updated = catalog
    .filter((manga) => readFilter === 'all' || history.some((item) => item.mangaId === manga.id) || seen.some((key) => key.startsWith(`${manga.id}:`)))
    .slice()
    .sort((a, b) => freshness(a.updated) - freshness(b.updated))
  const pages = Math.max(1, Math.ceil(updated.length / UPDATE_PAGE))
  const current = Math.min(page, pages - 1)
  const visible = updated.slice(current * UPDATE_PAGE, current * UPDATE_PAGE + UPDATE_PAGE)

  return (
    <>
      <div className="section-head">
        <h2 className="section-title">Vừa cập nhật</h2>
        <div className="update-tools">
          <div className="choice">
            <button className={`tab ${readFilter === 'all' ? 'on' : ''}`} type="button" onClick={() => onFilter('all')}>Tất cả</button>
            <button className={`tab ${readFilter === 'read' ? 'on' : ''}`} type="button" onClick={() => onFilter('read')}>Đã đọc</button>
          </div>
          {pages > 1 && (
            <div className="shelf-nav">
              <button type="button" aria-label="Trang trước" disabled={current <= 0} onClick={() => onPage(current - 1)}>
                <ChevronLeft size={18} />
              </button>
              <button type="button" aria-label="Trang sau" disabled={current >= pages - 1} onClick={() => onPage(current + 1)}>
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
      {visible.length ? (
        <div className="shelf-grid">
          {visible.map((manga) => <ShelfCard key={manga.id} manga={manga} />)}
        </div>
      ) : (
        <div className="empty">{readFilter === 'read' ? 'Bạn chưa đọc bộ nào.' : 'Chưa có truyện vừa cập nhật.'}</div>
      )}
    </>
  )
}

export default function Home() {
  useTitle('')
  const catalog = useCatalog()
  const store = useStore()
  const posts = [...store.posts, ...seedPosts]
  const groups = store.groups
  const genreList = store.genres.filter((genre) => genre.count > 0)
  const featured = catalog.slice(0, 5)
  const [index, setIndex] = useState(0)
  const [period, setPeriod] = useState('week')
  const [board, setBoard] = useState('manga')
  const [picks, setPicks] = useState(() => [3, 7])
  const [readFilter, setReadFilter] = useState('all')
  const [updatePage, setUpdatePage] = useState(0)
  const current = featured.length ? featured[index % featured.length] : null

  useEffect(() => {
    const timer = window.setInterval(() => setIndex((value) => value + 1), 7000)
    return () => window.clearInterval(timer)
  }, [])

  const ranked = useMemo(() => {
    return [...catalog].sort((a, b) => hotScore(b, period) - hotScore(a, period)).slice(0, 10)
  }, [catalog, period])

  const rankedGroups = useMemo(() => {
    return groups
      .map((group) => {
        const works = catalog.filter((manga) => manga.groupId === group.id)
        const views = works.reduce((sum, manga) => sum + (Number(manga.views) || 0), 0)
        return { ...group, views, count: countByGroup(catalog, group.id) }
      })
      .sort((a, b) => b.views - a.views)
  }, [catalog, groups])

  function shuffle(slot) {
    setPicks((currentPicks) => {
      const next = [...currentPicks]
      let value = next[slot]
      while (value === next[slot] || value === next[1 - slot]) value = Math.floor(Math.random() * catalog.length)
      next[slot] = value
      return next
    })
  }

  return (
    <div>
      <h1 className="hide-sm" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>
        MOCHI — Đọc truyện tranh Manga, Doujinshi tiếng Việt
      </h1>
      {current && (
        <section className="hero">
          <div className="hero-copy">
            <p className="kicker">Nổi bật tuần này</p>
            <h1>{current.title}</h1>
            <p className="hero-blurb">{current.blurb}</p>
            <div className="hero-actions">
              <Link className="btn btn-pink" to={`/doc/${current.id}/1`}>Đọc ngay</Link>
              <Link className="btn btn-ghost" to={`/truyen/${current.id}`}>Xem chi tiết</Link>
            </div>
            <div className="dots">
              {featured.map((manga, dot) => (
                <button key={manga.id} className={dot === index % featured.length ? 'on' : ''} type="button" aria-label={manga.title} onClick={() => setIndex(dot)} />
              ))}
            </div>
          </div>
          <Link to={`/truyen/${current.id}`} className="hero-cover" aria-label={current.title}>
            <Cover manga={current} />
          </Link>
        </section>
      )}

      <section className="section">
        <SectionHead title="Dành cho bạn" />
        <div className="circle-row">
          {catalog.slice(2, 10).map((manga) => (
            <Link key={manga.id} to={`/truyen/${manga.id}`} className="circle">
              <div className="avatar"><Cover manga={manga} crop /></div>
              <span>{manga.title}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHead title="Bài viết mới nhất" icon={<Flame className="fire" size={18} />} to="/dien-dan" more="Vào diễn đàn" />
        <div className="post-row">
          {posts.slice(0, 6).map((post) => (
            <Link key={post.id} to={`/dien-dan/${post.id}`} className="post-card">
              <div className="post-top">
                <span className="vote"><ArrowUp size={12} /> {post.up}</span>
                <span>{post.author} · {post.time}</span>
              </div>
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
              <div className="post-foot"><span><MessageCircle size={13} /> {forumReplies(post.id, store.replies).length} bình luận</span></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <UpdatedShelf
          catalog={catalog}
          history={store.history}
          seen={store.seen}
          readFilter={readFilter}
          page={updatePage}
          onFilter={(value) => {
            setReadFilter(value)
            setUpdatePage(0)
          }}
          onPage={setUpdatePage}
        />
      </section>

      <section className="section">
        <div className="rank-box">
          <div className="rank-tabs">
            <button className={`tab ${board === 'manga' ? 'on' : ''}`} type="button" onClick={() => setBoard('manga')}>Truyện hot</button>
            <button className={`tab ${board === 'group' ? 'on' : ''}`} type="button" onClick={() => setBoard('group')}>Dịch giả</button>
            <span className="spacer" />
            {[['day', 'Ngày'], ['week', 'Tuần'], ['month', 'Tháng'], ['all', 'Tất cả']].map(([key, label]) => (
              <button key={key} className={`tab ${period === key ? 'on' : ''}`} type="button" onClick={() => setPeriod(key)}>{label}</button>
            ))}
          </div>
          {board === 'manga' ? ranked.map((manga, index) => (
            <Link key={manga.id} to={`/truyen/${manga.id}`} className="rank-item">
              <span className="rank-no">{index + 1}</span>
              <div className="rank-thumb"><Cover manga={manga} crop /></div>
              <span>
                <b>{manga.title}</b>
                <span className="views"><Eye size={13} /> {compact(manga.views)}</span>
              </span>
            </Link>
          )) : rankedGroups.map((group, index) => (
            <Link key={group.id} to={`/nhom-dich/${group.id}`} className="rank-item">
              <span className="rank-no">{index + 1}</span>
              <span className="letter">{group.name[0]}</span>
              <span>
                <b>{group.name}</b>
                <span className="views">{group.count} truyện · {compact(group.views)} người đọc</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section split">
        <div>
          <SectionHead title="Truyện reup mới" to="/danh-sach" />
          <div className="grid-manga" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {(() => {
              const picked = []
              const seen = new Set()
              ;[...catalog.filter((manga) => manga.badge === 'REUP'), ...catalog.slice(8)].forEach((manga) => {
                if (seen.has(manga.id) || picked.length >= 6) return
                seen.add(manga.id)
                picked.push(manga)
              })
              return picked.map((manga) => <MangaCard key={manga.id} manga={manga} />)
            })()}
          </div>
        </div>
        <div className="today">
          <SectionHead title="Hôm nay đọc gì?" />
          <div className="today-grid">
            {picks.map((pick, slot) => {
              const manga = catalog.length ? catalog[pick % catalog.length] : null
              if (!manga) return null
              return (
                <div key={slot}>
                  <Link to={`/truyen/${manga.id}`} className="pick">
                    <div className="thumb"><Cover manga={manga} /></div>
                    <b>{manga.title}</b>
                    <p className="meta">{authorOf(manga, store.authors).name} · {groupOf(manga, store.groups).name}</p>
                  </Link>
                  <button className="btn btn-ghost" style={{ marginTop: 8, width: '100%' }} type="button" onClick={() => shuffle(slot)}>
                    <RefreshCw size={15} /> Đổi truyện
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="section">
        <SectionHead title="Khám phá thể loại" to="/the-loai" />
        <div className="genre-cloud">
          {genreList.map((genre) => (
            <Link key={genre.slug} to={`/the-loai/${genre.slug}`} className="chip">
              {genre.name} <em>{compact(genre.count)}</em>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

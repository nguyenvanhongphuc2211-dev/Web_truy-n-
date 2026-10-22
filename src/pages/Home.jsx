import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUp, Eye, Flame, MessageCircle, RefreshCw } from 'lucide-react'
import Cover from '../components/Cover'
import { MangaCard, SectionHead } from '../components/Bits'
import { authorOf, communityAlbums, compact, countByGroup, genresWithCounts, groupOf, groups, hotScore, seedPosts } from '../data'
import { useTitle } from '../hooks'
import { useCatalog, useStore } from '../store'

export default function Home() {
  useTitle('')
  const catalog = useCatalog()
  const posts = [...useStore().posts, ...seedPosts]
  const featured = catalog.slice(0, 5)
  const [index, setIndex] = useState(0)
  const [period, setPeriod] = useState('week')
  const [board, setBoard] = useState('manga')
  const [picks, setPicks] = useState(() => [3, 7])
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
        const views = works.reduce((sum, manga) => sum + hotScore(manga, period), 0)
        return { ...group, views, count: countByGroup(catalog, group.id) }
      })
      .sort((a, b) => b.views - a.views)
  }, [catalog, period])
  const genreList = useMemo(() => genresWithCounts(catalog).filter((genre) => genre.count > 0), [catalog])

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
          <div>
            <p className="kicker">Nổi bật tuần này</p>
            <h1>{current.title}</h1>
            <p>{current.blurb}</p>
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
              <div className="post-foot"><span><MessageCircle size={13} /> {post.comments} bình luận</span></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHead title="Truyện mới cập nhật" to="/danh-sach" />
        <div className="grid-manga">
          {catalog.slice(0, 10).map((manga) => <MangaCard key={manga.id} manga={manga} />)}
        </div>
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
                <span className="views">{group.count} truyện · {compact(Math.round(group.views))} điểm</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHead title="Album nổi bật" to="/album" />
        <div className="album-grid">
          {communityAlbums.slice(0, 3).map((album) => {
            const items = album.mangaIds.map((id) => catalog.find((manga) => manga.id === id)).filter(Boolean)
            return (
              <Link key={album.id} to={`/album/${album.id}`} className="album-card">
                <div className="stack">
                  {items.slice(0, 3).map((manga) => (
                    <div key={manga.id} className="mini"><Cover manga={manga} crop /></div>
                  ))}
                </div>
                <div>
                  <h3>{album.name}</h3>
                  <p className="muted">{album.desc}</p>
                  <p className="views">{album.reactions} thích · {album.owner}</p>
                </div>
              </Link>
            )
          })}
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
                    <p className="meta">{authorOf(manga).name} · {groupOf(manga).name}</p>
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

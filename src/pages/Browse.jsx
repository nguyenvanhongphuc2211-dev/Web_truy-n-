import { useEffect, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Cover from '../components/Cover'
import { MangaGrid, ShelfCard } from '../components/Bits'
import { api } from '../api'
import { fold, genreName, isTextNovel, storyStatus, storyStatuses, withChapters } from '../data'
import { useTitle } from '../hooks'
import { useCatalog, useStore } from '../store'

const LIBRARY_SORTS = {
  new: 'cap-nhat',
  hot: 'hot',
  view: 'xem',
  like: 'thich',
}

export function Library() {
  const { genres: storeGenres, uploads } = useStore()
  const [fetchedGenres, setFetchedGenres] = useState([])
  const [params, setParams] = useSearchParams()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const headRef = useRef(null)
  const q = params.get('q') || ''
  const genre = params.get('tl') || 'all'
  const status = storyStatuses.some((item) => item.id === params.get('tt')) ? params.get('tt') : 'all'
  const sort = LIBRARY_SORTS[params.get('sap')] ? params.get('sap') : 'new'
  const page = Math.max(1, Number(params.get('trang')) || 1)
  useTitle('Danh sách truyện')

  useEffect(() => {
    if (storeGenres.length) return undefined
    let cancelled = false
    api.genres().then((list) => {
      if (!cancelled) setFetchedGenres(list)
    }).catch(() => {})
    return () => {
      cancelled = true
    }
  }, [storeGenres.length])

  useEffect(() => {
    const ctrl = new AbortController()
    setLoading(true)
    setError('')
    api.searchMangas({
      page,
      q,
      tl: genre === 'all' ? '' : genre,
      tt: status === 'all' ? '' : status,
      sap: LIBRARY_SORTS[sort],
    }, { signal: ctrl.signal }).then((body) => {
      setResult(body)
      setLoading(false)
    }).catch((err) => {
      if (err.name === 'AbortError') return
      setError(err.message || 'Không tải được danh sách')
      setLoading(false)
    })
    return () => ctrl.abort()
  }, [page, q, genre, status, sort, retry])

  useEffect(() => {
    if (!headRef.current || (page <= 1 && !params.get('trang'))) return
    headRef.current.focus()
  }, [page, result?.page])

  const genres = storeGenres.length ? storeGenres : fetchedGenres
  const localExtras = page === 1
    ? uploads.filter((manga) => {
      if (result?.items?.some((row) => row.id === manga.id)) return false
      if (q && !fold(`${manga.title} ${manga.alt} ${manga.blurb}`).includes(fold(q))) return false
      if (genre !== 'all' && !manga.genres?.includes(genre)) return false
      if (status !== 'all' && storyStatus(manga).id !== status) return false
      return true
    })
    : []
  const items = [
    ...localExtras,
    ...(result?.items || []).map((manga) => uploads.find((item) => item.id === manga.id) || manga),
  ]
  const total = (result?.total || 0) + localExtras.length
  const pages = result?.pages || 1

  function write(next) {
    next.delete('trang')
    setParams(next)
  }

  function setPage(nextPage) {
    const next = new URLSearchParams(params)
    if (nextPage <= 1) next.delete('trang')
    else next.set('trang', String(nextPage))
    setParams(next)
  }

  function setField(key, value, empty = 'all') {
    const next = new URLSearchParams(params)
    if (!value || value === empty) next.delete(key)
    else next.set(key, value)
    write(next)
  }

  return (
    <div>
      <div className="page-head with-nav">
        <div>
          <h1 ref={headRef} tabIndex={-1}>Danh sách truyện</h1>
          <p className="muted" aria-live="polite">{loading && !result ? 'xin hãy chờ ...' : `${total} bộ trên kệ.`}</p>
        </div>
        {pages > 1 && (
          <div className="shelf-nav">
            <button type="button" aria-label="Trang trước" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft size={18} />
            </button>
            <span>Trang {page} / {pages}</span>
            <button type="button" aria-label="Trang sau" disabled={page >= pages} onClick={() => setPage(page + 1)}>
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
      <div className="filters">
        <input className="input" aria-label="Lọc theo tên" placeholder="Lọc theo tên" value={q} onChange={(event) => setField('q', event.target.value, '')} />
        <select className="input" aria-label="Thể loại" value={genre} onChange={(event) => setField('tl', event.target.value)}>
          <option value="all">Mọi thể loại</option>
          {genres.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
        </select>
        <select className="input" aria-label="Trạng thái" value={status} onChange={(event) => setField('tt', event.target.value)}>
          <option value="all">Mọi trạng thái</option>
          {storyStatuses.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
        <select className="input" aria-label="Sắp xếp" value={sort} onChange={(event) => setField('sap', event.target.value, 'new')}>
          <option value="new">Mới cập nhật</option>
          <option value="hot">Điểm nóng</option>
          <option value="view">Người đọc</option>
          <option value="like">Lượt thích</option>
        </select>
      </div>
      {error ? (
        <div className="empty">
          <p>{error}</p>
          <button className="btn btn-pink" type="button" onClick={() => setRetry((value) => value + 1)}>Thử lại</button>
        </div>
      ) : loading && !items.length ? (
        <div className="empty" role="status">xin hãy chờ ...</div>
      ) : (
        <MangaGrid items={items} />
      )}
      {pages > 1 && (
        <nav className="pager" aria-label="Phân trang">
          {pageWindow(page, pages).map((item, index) => (
            item === '…' ? <span key={`gap-${index}`}>…</span> : (
              <button key={item} type="button" aria-current={item === page ? 'page' : undefined} className={item === page ? 'on' : ''} onClick={() => setPage(item)}>
                {item}
              </button>
            )
          ))}
        </nav>
      )}
    </div>
  )
}

export function Genres() {
  useTitle('Thể loại')
  const catalog = useCatalog()
  const list = useStore().genres.filter((genre) => genre.count > 0)
  return (
    <div>
      <div className="page-head">
        <h1>Thể loại</h1>
        <p className="muted">{catalog.length} truyện, chia theo thể loại trên kệ.</p>
      </div>
      {list.length ? (
        <div className="genre-cloud">
          {list.map((genre) => (
            <Link key={genre.slug} to={`/the-loai/${genre.slug}`} className="chip">{genre.name} <em>{genre.count}</em></Link>
          ))}
        </div>
      ) : (
        <div className="empty">Chưa có thể loại.</div>
      )}
    </div>
  )
}

export function GenrePage() {
  const { slug } = useParams()
  const catalog = useCatalog()
  const name = genreName(slug, useStore().genres)
  useTitle(name)
  const items = catalog.filter((manga) => manga.genres?.includes(slug))
  return (
    <div>
      <div className="page-head">
        <p className="crumbs"><Link to="/the-loai">Thể loại</Link> / {name}</p>
        <h1>{name}</h1>
        <p className="muted">{items.length} truyện trong thể loại này.</p>
      </div>
      <MangaGrid items={items} />
    </div>
  )
}

const SORTS = [
  { id: 'xem', label: 'Người đọc' },
  { id: 'danh-gia', label: 'Lượt đánh giá' },
  { id: 'theo-doi', label: 'Lượt theo dõi' },
  { id: 'cap-nhat', label: 'Ngày cập nhật' },
  { id: 'moi', label: 'Truyện mới' },
]

function statusIdsFrom(raw) {
  return String(raw || '').split(',').map((token) => {
    const found = storyStatuses.find((item) => item.id === token || item.label === token || item.values.includes(token))
    return found?.id
  }).filter(Boolean)
}

export function SearchPage() {
  const { genres: storeGenres, uploads } = useStore()
  const [fetchedGenres, setFetchedGenres] = useState([])
  const [params, setParams] = useSearchParams()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const headRef = useRef(null)
  const q = params.get('q') || ''
  const pickedStatus = statusIdsFrom(params.get('tt'))
  const textOnly = params.get('chu') === '1'
  const pickedGenres = [params.get('tl'), params.get('the-loai')].filter(Boolean).join(',').split(',').filter(Boolean)
  const sort = SORTS.some((item) => item.id === params.get('sap')) ? params.get('sap') : 'cap-nhat'
  const page = Math.max(1, Number(params.get('trang')) || 1)
  useTitle('Tìm truyện')

  useEffect(() => {
    if (storeGenres.length) return undefined
    let cancelled = false
    api.genres().then((list) => {
      if (!cancelled) setFetchedGenres(list)
    }).catch(() => {})
    return () => {
      cancelled = true
    }
  }, [storeGenres.length])

  useEffect(() => {
    const ctrl = new AbortController()
    setLoading(true)
    setError('')
    api.searchMangas({
      page,
      q,
      tt: pickedStatus.join(','),
      tl: pickedGenres.join(','),
      chu: textOnly ? '1' : '',
      sap: sort,
    }, { signal: ctrl.signal }).then((body) => {
      setResult(body)
      setLoading(false)
    }).catch((err) => {
      if (err.name === 'AbortError') return
      setError(err.message || 'Không tải được danh sách')
      setLoading(false)
    })
    return () => ctrl.abort()
  }, [page, q, pickedStatus.join(','), pickedGenres.join(','), textOnly, sort, retry])

  useEffect(() => {
    if (!headRef.current || page <= 1 && !params.get('trang')) return
    headRef.current.focus()
  }, [page, result?.page])

  const genres = storeGenres.length ? storeGenres : fetchedGenres

  function write(next) {
    next.delete('trang')
    setParams(next)
  }

  function setPage(nextPage) {
    const next = new URLSearchParams(params)
    if (nextPage <= 1) next.delete('trang')
    else next.set('trang', String(nextPage))
    setParams(next)
  }

  function setQuery(value) {
    const next = new URLSearchParams(params)
    if (value) next.set('q', value)
    else next.delete('q')
    write(next)
  }

  function toggleList(key, id, current) {
    const next = new URLSearchParams(params)
    const values = current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    if (values.length) next.set(key, values.join(','))
    else next.delete(key)
    if (key === 'tl') next.delete('the-loai')
    write(next)
  }

  const genreList = genres.filter((genre) => genre.count > 0)
  const statusCounts = result?.statusCounts || {}
  const localExtras = page === 1
    ? uploads.filter((manga) => {
      const item = withChapters(manga)
      if (result?.items?.some((row) => row.id === item.id)) return false
      if (q && !fold(`${item.title} ${item.alt} ${item.blurb}`).includes(fold(q))) return false
      if (pickedStatus.length && !pickedStatus.includes(storyStatus(item).id)) return false
      if (textOnly && !isTextNovel(item)) return false
      if (pickedGenres.length && !pickedGenres.some((slug) => item.genres?.includes(slug))) return false
      return true
    }).map((manga) => withChapters(manga))
    : []
  const items = [
    ...localExtras,
    ...(result?.items || []).map((manga) => {
      const edit = uploads.find((item) => item.id === manga.id)
      return edit ? { ...manga, ...withChapters(edit) } : manga
    }),
  ]
  const total = (result?.total || 0) + localExtras.length
  const pages = result?.pages || 1
  const pageButtons = pageWindow(page, pages)

  return (
    <div>
      <div className="page-head">
        <h1>Tìm truyện</h1>
        <p className="muted" aria-live="polite">{loading && !result ? 'xin hãy chờ ...' : `${total} bộ khớp bộ lọc.`}</p>
      </div>
      <label className="lbl">Từ khóa
        <input className="input" aria-label="Từ khóa" placeholder="Tên truyện" value={q} onChange={(event) => setQuery(event.target.value)} />
      </label>

      <section className="find-block">
        <h2>Trạng thái</h2>
        <div className="genre-cloud" role="group" aria-label="Trạng thái">
          {storyStatuses.map((item) => {
            const count = statusCounts[item.id] || 0
            const on = pickedStatus.includes(item.id)
            return (
              <button key={item.id} className={`chip chip-btn ${on ? 'on' : ''}`} type="button" aria-pressed={on} onClick={() => toggleList('tt', item.id, pickedStatus)}>
                {item.label} <em>{count}</em>
              </button>
            )
          })}
        </div>
      </section>

      <label className="find-check">
        <input type="checkbox" checked={textOnly} onChange={(event) => {
          const next = new URLSearchParams(params)
          if (event.target.checked) next.set('chu', '1')
          else next.delete('chu')
          write(next)
        }} />
        Có truyện chữ
      </label>

      <section className="find-block">
        <h2>Thể loại</h2>
        <div className="genre-cloud" role="group" aria-label="Thể loại">
          {genreList.map((genre) => {
            const on = pickedGenres.includes(genre.slug)
            return (
              <button key={genre.slug} className={`chip chip-btn ${on ? 'on' : ''}`} type="button" aria-pressed={on} onClick={() => toggleList('tl', genre.slug, pickedGenres)}>
                {genre.name} <em>{genre.count}</em>
              </button>
            )
          })}
        </div>
      </section>

      <div className="sort-row" role="radiogroup" aria-label="Sắp xếp">
        {SORTS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={sort === item.id}
            className={sort === item.id ? 'on' : ''}
            onClick={() => {
              const next = new URLSearchParams(params)
              next.set('sap', item.id)
              write(next)
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="shelf-head">
        <h2 id="ket-qua" ref={headRef} tabIndex={-1}>Nội dung</h2>
        {pages > 1 && (
          <div className="shelf-nav">
            <button type="button" aria-label="Trang trước" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft size={18} />
            </button>
            <span>Trang {page} / {pages}</span>
            <button type="button" aria-label="Trang sau" disabled={page >= pages} onClick={() => setPage(page + 1)}>
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {error ? (
        <div className="empty">
          <p>{error}</p>
          <button className="btn btn-pink" type="button" onClick={() => setRetry((value) => value + 1)}>Thử lại</button>
        </div>
      ) : loading && !items.length ? (
        <div className="empty" role="status">xin hãy chờ ...</div>
      ) : items.length ? (
        <div className="shelf-grid" aria-busy={loading}>
          {items.map((manga) => <ShelfCard key={manga.id} manga={manga} />)}
        </div>
      ) : <div className="empty">Không có truyện khớp bộ lọc.</div>}

      {pages > 1 && (
        <nav className="pager" aria-label="Phân trang">
          {pageButtons.map((item, index) => (
            item === '…' ? <span key={`gap-${index}`}>…</span> : (
              <button key={item} type="button" aria-current={item === page ? 'page' : undefined} className={item === page ? 'on' : ''} onClick={() => setPage(item)}>
                {item}
              </button>
            )
          ))}
        </nav>
      )}
    </div>
  )
}

function pageWindow(page, pages) {
  const start = Math.max(1, page - 2)
  const end = Math.min(pages, page + 2)
  const items = []
  if (start > 1) items.push(1)
  if (start > 2) items.push('…')
  for (let n = start; n <= end; n += 1) items.push(n)
  if (end < pages - 1) items.push('…')
  if (end < pages) items.push(pages)
  return items
}

function AlbumCard({ album, catalog }) {
  const items = album.mangaIds.map((id) => catalog.find((manga) => manga.id === id)).filter(Boolean)
  return (
    <Link to={`/album/${album.id}`} className="album-card">
      <div className="stack">
        {items.slice(0, 3).map((manga) => (
          <div key={manga.id} className="mini"><Cover manga={manga} crop /></div>
        ))}
        {!items.length && <div className="mini mini-empty">Trống</div>}
      </div>
      <div>
        <h3>{album.name}</h3>
        <p className="muted">{album.desc || 'Album cá nhân'}</p>
        <p className="views">{album.mangaIds.length} truyện · {album.owner}</p>
      </div>
    </Link>
  )
}

export function Albums() {
  useTitle('Album công khai')
  const catalog = useCatalog()
  const list = useStore().albums.filter((album) => album.public)
  return (
    <div>
      <div className="page-head">
        <h1>Album công khai</h1>
        <p className="muted">Chỉ hiện album bạn bật chia sẻ.</p>
      </div>
      {list.length ? (
        <div className="album-grid">
          {list.map((album) => <AlbumCard key={album.id} album={album} catalog={catalog} />)}
        </div>
      ) : <div className="empty">Chưa có album công khai.</div>}
    </div>
  )
}

export function AlbumPage() {
  const { id } = useParams()
  const catalog = useCatalog()
  const album = useStore().albums.find((item) => item.id === id)
  useTitle(album?.name || 'Album')
  if (!album) return <div className="empty">Không thấy album này.</div>
  const items = album.mangaIds.map((mangaId) => catalog.find((manga) => manga.id === mangaId)).filter(Boolean)
  return (
    <div>
      <div className="page-head">
        <p className="crumbs"><Link to="/album">Album</Link> / {album.owner}</p>
        <h1>{album.name}</h1>
        <p className="muted">{album.desc}</p>
      </div>
      {items.length ? <MangaGrid items={items} /> : <div className="empty">Album này chưa có truyện.</div>}
    </div>
  )
}

import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import Cover from '../components/Cover'
import { MangaGrid } from '../components/Bits'
import { communityAlbums, fold, genreName, genres, genresWithCounts, hotScore } from '../data'
import { useTitle } from '../hooks'
import { useCatalog, useStore } from '../store'

export function Library() {
  useTitle('Danh sách truyện')
  const catalog = useCatalog()
  const [q, setQ] = useState('')
  const [genre, setGenre] = useState('all')
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState('new')
  const items = useMemo(() => {
    let list = catalog.filter((manga) => {
      const text = fold(`${manga.title} ${manga.alt}`)
      if (q && !text.includes(fold(q))) return false
      if (genre !== 'all' && !manga.genres.includes(genre)) return false
      if (status !== 'all' && manga.status !== status) return false
      return true
    })
    if (sort === 'view') list = [...list].sort((a, b) => b.views - a.views)
    if (sort === 'like') list = [...list].sort((a, b) => b.likes - a.likes)
    if (sort === 'hot') list = [...list].sort((a, b) => hotScore(b, 'all') - hotScore(a, 'all'))
    return list
  }, [catalog, q, genre, status, sort])

  return (
    <div>
      <div className="page-head">
        <h1>Danh sách truyện</h1>
        <p className="muted">{items.length} bộ trên kệ mẫu.</p>
      </div>
      <div className="filters">
        <input className="input" placeholder="Lọc theo tên" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input" value={genre} onChange={(e) => setGenre(e.target.value)}>
          <option value="all">Mọi thể loại</option>
          {genres.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
        </select>
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">Mọi trạng thái</option>
          <option>Đang ra</option>
          <option>Hoàn thành</option>
          <option>Tạm dừng</option>
        </select>
        <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="new">Mới cập nhật</option>
          <option value="hot">Điểm nóng</option>
          <option value="view">Lượt xem</option>
          <option value="like">Lượt thích</option>
        </select>
      </div>
      <MangaGrid items={items} />
    </div>
  )
}

export function Genres() {
  useTitle('Thể loại')
  const catalog = useCatalog()
  const list = genresWithCounts(catalog).filter((genre) => genre.count > 0)
  return (
    <div>
      <div className="page-head">
        <h1>Thể loại</h1>
        <p className="muted">{catalog.length} truyện, chia theo thể loại đang có trên kệ.</p>
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
  const name = genreName(slug)
  useTitle(name)
  const items = catalog.filter((manga) => manga.genres?.includes(slug))
  return (
    <div>
      <div className="page-head">
        <p className="crumbs"><Link to="/the-loai">Thể loại</Link> / {name}</p>
        <h1>{name}</h1>
        <p className="muted">{items.length} truyện trong dữ liệu mẫu.</p>
      </div>
      <MangaGrid items={items} />
    </div>
  )
}

export function SearchPage() {
  const catalog = useCatalog()
  const [params, setParams] = useSearchParams()
  const q = params.get('q') || ''
  const genre = params.get('the-loai') || 'all'
  const status = params.get('tt') || 'all'
  const minChapters = Number(params.get('chuong') || 0)
  useTitle('Tìm kiếm nâng cao')

  function set(key, value) {
    const next = new URLSearchParams(params)
    if (!value || value === 'all' || value === '0') next.delete(key)
    else next.set(key, value)
    setParams(next)
  }

  const items = catalog.filter((manga) => {
    if (q && !fold(`${manga.title} ${manga.alt} ${manga.blurb} ${manga.description}`).includes(fold(q))) return false
    if (genre !== 'all' && !manga.genres.includes(genre)) return false
    if (status !== 'all' && manga.status !== status) return false
    if ((manga.chapterCount || manga.chapters?.length || 0) < minChapters) return false
    return true
  })

  return (
    <div>
      <div className="page-head">
        <h1>Tìm kiếm nâng cao</h1>
        <p className="muted">Gõ “/” ở trang bất kỳ để mở ô tìm nhanh.</p>
      </div>
      <div className="filters">
        <input className="input" placeholder="Từ khóa" value={q} onChange={(e) => set('q', e.target.value)} />
        <select className="input" value={genre} onChange={(e) => set('the-loai', e.target.value)}>
          <option value="all">Mọi thể loại</option>
          {genres.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
        </select>
        <select className="input" value={status} onChange={(e) => set('tt', e.target.value)}>
          <option value="all">Mọi trạng thái</option>
          <option>Đang ra</option>
          <option>Hoàn thành</option>
          <option>Tạm dừng</option>
        </select>
        <select className="input" value={String(minChapters)} onChange={(e) => set('chuong', e.target.value)}>
          <option value="0">Mọi độ dài</option>
          <option value="3">Từ 3 chương</option>
          <option value="6">Từ 6 chương</option>
          <option value="8">Từ 8 chương</option>
        </select>
      </div>
      <MangaGrid items={items} />
    </div>
  )
}

function AlbumCard({ album, catalog }) {
  const items = album.mangaIds.map((id) => catalog.find((manga) => manga.id === id)).filter(Boolean)
  return (
    <Link to={`/album/${album.id}`} className="album-card">
      <div className="stack">
        {(items.length ? items : [{ id: 'empty', title: album.name, hue: 320 }]).slice(0, 3).map((manga) => (
          <div key={manga.id} className="mini"><Cover manga={manga} crop /></div>
        ))}
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
  useTitle('Album cộng đồng')
  const catalog = useCatalog()
  const mine = useStore().albums.filter((album) => album.public)
  const list = [...mine, ...communityAlbums]
  return (
    <div>
      <div className="page-head">
        <h1>Album cộng đồng</h1>
        <p className="muted">Tuyển tập công khai. Album của bạn có thể bật chia sẻ khi tạo.</p>
      </div>
      <div className="album-grid">
        {list.map((album) => <AlbumCard key={album.id} album={album} catalog={catalog} />)}
      </div>
    </div>
  )
}

export function AlbumPage() {
  const { id } = useParams()
  const catalog = useCatalog()
  const album = [...useStore().albums, ...communityAlbums].find((item) => item.id === id)
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
      <MangaGrid items={items} />
    </div>
  )
}

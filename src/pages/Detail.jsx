import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Bookmark, Eye, Heart, Library, Play } from 'lucide-react'
import Cover from '../components/Cover'
import { MangaGrid } from '../components/Bits'
import { authorOf, compact, countByAuthor, countByGroup, genreName, groupOf, seedComments } from '../data'
import { useTitle } from '../hooks'
import { useCatalog, useStore } from '../store'

export default function Detail() {
  const { id } = useParams()
  const catalog = useCatalog()
  const manga = catalog.find((item) => item.id === id)
  const store = useStore()
  const [tab, setTab] = useState('chapters')
  const [text, setText] = useState('')
  const [albumOpen, setAlbumOpen] = useState(false)
  const [albumName, setAlbumName] = useState('')
  useTitle(manga?.title || 'Truyện')

  if (!manga) return <div className="empty">Không tìm thấy truyện.</div>

  const author = authorOf(manga)
  const group = groupOf(manga)
  const saved = store.saved.includes(manga.id)
  const liked = store.likes.includes(manga.id)
  const history = store.history.find((item) => item.mangaId === manga.id)
  const firstChapter = manga.chapters.find((chapter) => chapter.id === 1) || manga.chapters[manga.chapters.length - 1]
  const continueChapter = manga.chapters.find((chapter) => chapter.id === history?.chapterId) || firstChapter
  const comments = [...(store.comments[manga.id] || []), ...(seedComments[manga.id] || [])]
  const related = catalog.filter((item) => item.id !== manga.id && item.genres.some((genre) => manga.genres.includes(genre))).slice(0, 5)

  function createAlbum(event) {
    event.preventDefault()
    const name = albumName.trim()
    if (!name) return
    const album = {
      id: `album-${Date.now()}`,
      name,
      desc: 'Album tự tạo',
      owner: store.user?.name || 'Bạn',
      public: false,
      mangaIds: [manga.id],
      reactions: 0,
    }
    store.addAlbum(album)
    setAlbumName('')
    setAlbumOpen(false)
  }

  return (
    <div>
      <article className="detail">
        <div>
          <div className="detail-cover"><Cover manga={manga} /></div>
          <div className="detail-actions">
            <Link className="btn btn-pink" to={`/doc/${manga.id}/${continueChapter.id}`}>
              <Play size={16} /> {history ? `Đọc tiếp chương ${continueChapter.id}` : 'Bắt đầu đọc'}
            </Link>
            <button className={`btn ${saved ? 'btn-line' : 'btn-line'}`} type="button" onClick={() => store.toggleSave(manga.id)}>
              <Bookmark size={16} /> {saved ? 'Đã lưu' : 'Lưu truyện'}
            </button>
            <button className="btn btn-ghost" type="button" onClick={() => setAlbumOpen(true)}>
              <Library size={16} /> Thêm vào album
            </button>
          </div>
        </div>
        <div>
          <h1>{manga.title}</h1>
          <p className="alt">Tên khác: {manga.alt}</p>
          <p><Link to={`/tac-gia/${author.id}`}>{author.name}</Link> · {manga.kind} · {manga.status}</p>
          <div className="stat-row">
            <button className="stat" type="button" onClick={() => store.toggleLike(manga.id)}>
              <Heart size={18} color={liked ? '#ff4e9b' : '#9a90a4'} fill={liked ? '#ff4e9b' : 'none'} />
              <span><b>{compact(manga.likes + (liked ? 1 : 0))}</b><span>LƯỢT THÍCH</span></span>
            </button>
            <div className="stat">
              <Bookmark size={18} color="#7aa2ff" />
              <span><b>{compact(manga.follows + (saved ? 1 : 0))}</b><span>THEO DÕI</span></span>
            </div>
            <div className="stat">
              <Eye size={18} color="#3dce8a" />
              <span><b>{compact(manga.views)}</b><span>LƯỢT XEM</span></span>
            </div>
          </div>
          <div className="tags">
            {manga.genres.map((slug) => (
              <Link key={slug} to={`/the-loai/${slug}`} className="chip">{genreName(slug)}</Link>
            ))}
          </div>
          <h2>Mô tả</h2>
          <p className="prose">{manga.description}</p>
          <div className="people">
            <div className="person">
              <span className="avatar-letter">{(manga.translator || 'D')[0]}</span>
              <span>
                <small>Dịch giả</small>
                <b>{manga.translator}</b>
                <button className="btn btn-ghost" style={{ marginTop: 6, padding: '6px 10px' }} type="button" onClick={() => store.toggleTranslator(manga.translator)}>
                  {store.followTranslators.includes(manga.translator) ? 'Đang theo dõi' : 'Theo dõi'}
                </button>
              </span>
            </div>
            <Link to={`/nhom-dich/${group.id}`} className="person">
              <span className="avatar-letter">{group.name[0]}</span>
              <span>
                <small>Nhóm dịch</small>
                <b>{group.name}</b>
                <em>{countByGroup(catalog, group.id)} truyện</em>
              </span>
            </Link>
            <Link to={`/tac-gia/${author.id}`} className="person">
              <span className="avatar-letter">{author.name[0]}</span>
              <span>
                <small>Tác giả</small>
                <b>{author.name}</b>
                <em>{countByAuthor(catalog, author.id)} truyện</em>
              </span>
            </Link>
          </div>

          <div className="tabs-line">
            <button className={tab === 'chapters' ? 'on' : ''} type="button" onClick={() => setTab('chapters')}>Danh sách chương · {manga.chapters.length}</button>
            <button className={tab === 'comments' ? 'on' : ''} type="button" onClick={() => setTab('comments')}>Bình luận · {comments.length}</button>
          </div>
          {tab === 'chapters' ? (
            <div className="chap-list">
              {manga.chapters.map((chapter) => (
                <Link key={chapter.id} to={`/doc/${manga.id}/${chapter.id}`} className={`chap ${store.seen.includes(`${manga.id}:${chapter.id}`) ? 'read' : ''}`}>
                  <span>
                    <b>{chapter.title}</b>
                    <span className="meta" style={{ display: 'block' }}>{chapter.time}</span>
                  </span>
                  <span className="views"><Heart size={13} /> {chapter.likes}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div>
              <form className="row" onSubmit={(event) => { event.preventDefault(); store.addComment(manga.id, text); setText('') }}>
                <input className="input" placeholder="Viết bình luận..." value={text} onChange={(e) => setText(e.target.value)} />
                <button className="btn btn-pink" type="submit">Gửi</button>
              </form>
              {comments.map((comment) => (
                <div key={comment.id} className="comment">
                  <b>{comment.user}</b>
                  <span className="meta">{comment.at}</span>
                  <p style={{ margin: '6px 0 0' }}>{comment.text}</p>
                </div>
              ))}
              {!comments.length && <div className="empty">Chưa có bình luận.</div>}
            </div>
          )}
        </div>
      </article>

      <section className="section">
        <h2 className="section-title">Gợi ý cho bạn</h2>
        <div style={{ height: 12 }} />
        <MangaGrid items={related} />
      </section>

      {albumOpen && (
        <div className="modal-back" onClick={() => setAlbumOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0 }}>Thêm vào album</h2>
            {store.albums.length === 0 && <p className="muted">Bạn chưa có album. Tạo một album mới bên dưới.</p>}
            {store.albums.map((album) => (
              <button key={album.id} className="chap" type="button" onClick={() => store.addToAlbum(album.id, manga.id)} style={{ width: '100%' }}>
                <b>{album.name}</b>
                <span className="pink">{album.mangaIds.includes(manga.id) ? 'Đã có' : 'Thêm'}</span>
              </button>
            ))}
            <form onSubmit={createAlbum} className="row" style={{ marginTop: 12 }}>
              <input className="input" placeholder="Tên album mới" value={albumName} onChange={(e) => setAlbumName(e.target.value)} />
              <button className="btn btn-pink" type="submit">Tạo</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

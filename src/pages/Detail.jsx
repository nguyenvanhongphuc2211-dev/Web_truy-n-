import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Bell, Bookmark, Eye, Heart, Library, Play, Star } from 'lucide-react'
import Cover from '../components/Cover'
import { MangaGrid } from '../components/Bits'
import Comments from '../components/Comments'
import { authorOf, chapterViewCount, compact, countByAuthor, countByGroup, genreName, groupOf } from '../data'
import { useTitle } from '../hooks'
import { useCatalog, useStore } from '../store'

export default function Detail() {
  const { id } = useParams()
  const catalog = useCatalog()
  const manga = catalog.find((item) => item.id === id)
  const store = useStore()
  const navigate = useNavigate()
  const [tab, setTab] = useState('chapters')
  const [jump, setJump] = useState('')
  const [jumpError, setJumpError] = useState('')
  const [albumOpen, setAlbumOpen] = useState(false)
  const [albumName, setAlbumName] = useState('')
  const manual = /^Truyện \d+$/.test(manga?.title || '')
  const [editTitle, setEditTitle] = useState(manga?.title || '')
  const [editAuthor, setEditAuthor] = useState('')
  const [editBlurb, setEditBlurb] = useState(manga?.description || '')
  useEffect(() => {
    setEditTitle(manga?.title || '')
    setEditAuthor('')
    setEditBlurb(manga?.description || '')
  }, [manga?.id])
  useEffect(() => {
    store.ensureManga(id)
  }, [id, store.ensureManga])
  useTitle(manga?.title || 'Truyện')

  if (!manga) return <div className="empty">Không tìm thấy truyện.</div>

  const author = authorOf(manga, store.authors)
  const group = groupOf(manga, store.groups)
  const liked = store.likes.includes(manga.id)
  const following = (store.follows || []).includes(manga.id)
  const mine = store.ratings?.[manga.id] || 0
  const history = store.history.find((item) => item.mangaId === manga.id)
  const chapters = manga.chapters || []
  const firstChapter = chapters.find((chapter) => chapter.id === 1) || chapters[chapters.length - 1]
  const continueChapter = chapters.find((chapter) => chapter.id === history?.chapterId) || firstChapter
  const comments = store.comments[manga.id] || []
  const related = catalog.filter((item) => item.id !== manga.id && item.genres?.some((genre) => manga.genres?.includes(genre))).slice(0, 5)

  function goChapter(event) {
    event.preventDefault()
    const number = Number(jump)
    const found = chapters.find((chapter) => chapter.id === number)
    if (!found) {
      setJumpError('Không có chương này.')
      return
    }
    navigate(`/doc/${manga.id}/${found.id}`)
  }

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
            <Link className="btn btn-pink" to={`/doc/${manga.id}/${continueChapter?.id || 1}`}>
              <Play size={16} /> {history ? `Đọc tiếp chương ${continueChapter?.id}` : 'Bắt đầu đọc'}
            </Link>
            <Link className="btn btn-ghost" to={`/doc/${manga.id}/${firstChapter?.id || 1}`}>Đọc từ đầu</Link>
            <button className={`btn ${following ? 'btn-line' : 'btn-ghost'}`} type="button" aria-pressed={following} onClick={() => store.toggleFollow(manga.id)}>
              <Bell size={16} /> {following ? 'Đang theo dõi' : 'Theo dõi'}
            </button>
            <button className="btn btn-ghost" type="button" onClick={() => setAlbumOpen(true)}>
              <Library size={16} /> Thêm vào album
            </button>
          </div>
        </div>
        <div>
          <h1>{manga.title}</h1>
          {manga.moderation && manga.moderation !== 'approved' && (
            <p className={`mod-banner ${manga.moderation === 'rejected' ? 'is-reject' : ''}`} role="status">
              {manga.moderation === 'pending' && 'Đang chờ quản trị duyệt. Chưa hiện trên kệ công khai.'}
              {manga.moderation === 'draft' && 'Bản nháp, chỉ bạn thấy.'}
              {manga.moderation === 'rejected' && `Quản trị từ chối${manga.reviewNote ? `: ${manga.reviewNote}` : '.'}`}
              {(store.user?.id === manga.ownerId || store.user?.role === 'admin') && (
                <> <Link to={`/dang-truyen/${manga.id}`}>Mở trang sửa</Link></>
              )}
            </p>
          )}
          <p className="alt">Tên khác: {manga.alt}</p>
          <p><Link to={`/tac-gia/${author.id}`}>{author.name}</Link> · {manga.kind} · {manga.status}</p>
          <div className="stat-row">
            <button className="stat" type="button" aria-pressed={liked} onClick={() => store.toggleLike(manga.id)} style={{ cursor: 'pointer' }}>
              <Heart className={`stat-like ${liked ? 'on' : ''}`} size={18} fill={liked ? 'currentColor' : 'none'} aria-hidden="true" />
              <span><b>{compact(manga.likes)}</b><span>LƯỢT THÍCH</span></span>
            </button>
            <div className="stat">
              <Bookmark className="stat-save" size={18} aria-hidden="true" />
              <span><b>{compact(manga.follows)}</b><span>THEO DÕI</span></span>
            </div>
            <div className="stat">
              <Eye className="stat-view" size={18} aria-hidden="true" />
              <span><b>{compact(manga.views)}</b><span>NGƯỜI ĐỌC</span></span>
            </div>
          </div>
          <div className="score-row" role="group" aria-label="Đánh giá sao">
            <span><b>{mine ? `${mine}/5` : '—'}</b></span>
            {[1, 2, 3, 4, 5].map((value) => (
              <button key={value} type="button" className={value <= mine ? 'on' : ''} aria-label={`${value} sao`} aria-pressed={mine === value} onClick={() => store.rateManga(manga.id, value)}>
                <Star size={18} fill={value <= mine ? 'currentColor' : 'none'} />
              </button>
            ))}
            <span className="meta">{mine ? `Điểm của bạn ${mine}/5` : 'Chưa có đánh giá'}</span>
          </div>
          <div className="tags">
            {(manga.genres || []).map((slug) => (
              <Link key={slug} to={`/the-loai/${slug}`} className="chip">{genreName(slug, store.genres)}</Link>
            ))}
          </div>
          {manual && (
            <form
              className="panel"
              style={{ padding: 14, margin: '12px 0' }}
              onSubmit={(event) => {
                event.preventDefault()
                const title = editTitle.trim()
                if (!title || /^Truyện \d+$/.test(title)) return
                store.saveMangaEdit({
                  ...manga,
                  chapters: undefined,
                  title,
                  alt: title,
                  authorName: editAuthor.trim() || 'đang cập nhật',
                  authorId: 'chua-ro',
                  blurb: editBlurb.trim() || title,
                  description: editBlurb.trim() || manga.description,
                })
              }}
            >
              <b>Bìa chưa đọc rõ chữ</b>
              <p className="muted">Điền tay. Thông tin lưu trên trình duyệt này.</p>
              <label className="lbl">Tên truyện<input className="input" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} /></label>
              <label className="lbl">Tác giả<input className="input" value={editAuthor} onChange={(e) => setEditAuthor(e.target.value)} placeholder="Để trống nếu bìa không có" /></label>
              <label className="lbl">Mô tả<textarea className="input" value={editBlurb} onChange={(e) => setEditBlurb(e.target.value)} /></label>
              <button className="btn btn-pink" type="submit">Lưu thông tin</button>
            </form>
          )}
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
            <button className={tab === 'chapters' ? 'on' : ''} type="button" onClick={() => setTab('chapters')}>Danh sách chương · {chapters.length}</button>
            <button className={tab === 'comments' ? 'on' : ''} type="button" onClick={() => setTab('comments')}>Bình luận · {comments.length}</button>
          </div>
          {tab === 'chapters' ? (
            <div className="chap-list">
              <form className="row" onSubmit={goChapter} style={{ marginBottom: 12 }}>
                <label className="lbl grow">Đi tới chương
                  <input className="input" inputMode="numeric" aria-label="Đi tới chương" placeholder="Số chương" value={jump} onChange={(event) => { setJump(event.target.value); setJumpError('') }} />
                </label>
                <button className="btn btn-pink" type="submit">Tới</button>
              </form>
              {jumpError && <p className="muted">{jumpError}</p>}
              {chapters.map((chapter) => (
                <Link key={chapter.id} to={`/doc/${manga.id}/${chapter.id}`} className={`chap ${store.seen.includes(`${manga.id}:${chapter.id}`) ? 'read' : ''}`}>
                  <span>
                    <b>{chapter.title}</b>
                    <span className="meta" style={{ display: 'block' }}>{chapter.time}</span>
                  </span>
                  <span className="views"><Eye size={13} /> {compact(chapterViewCount(manga, chapter))} người đọc</span>
                </Link>
              ))}
            </div>
          ) : (
            <Comments manga={manga} />
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
              <input className="input" aria-label="Tên album mới" placeholder="Tên album mới" value={albumName} onChange={(e) => setAlbumName(e.target.value)} />
              <button className="btn btn-pink" type="submit">Tạo</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

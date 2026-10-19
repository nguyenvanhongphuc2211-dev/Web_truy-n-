import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MangaGrid } from '../components/Bits'
import { authors, communityAlbums, genres, groups, notices } from '../data'
import { useTitle } from '../hooks'
import { useCatalog, useStore } from '../store'
import Cover from '../components/Cover'

function Head({ title, text }) {
  return (
    <div className="page-head">
      <h1>{title}</h1>
      {text && <p className="muted">{text}</p>}
    </div>
  )
}

export function Saved() {
  useTitle('Truyện đã lưu')
  const catalog = useCatalog()
  const { saved } = useStore()
  const items = saved.map((id) => catalog.find((manga) => manga.id === id)).filter(Boolean)
  return (
    <div>
      <Head title="Truyện đã lưu" text="Danh sách nằm trong trình duyệt, không cần tài khoản." />
      <MangaGrid items={items} />
    </div>
  )
}

export function HistoryPage() {
  useTitle('Lịch sử đọc')
  const catalog = useCatalog()
  const { history } = useStore()
  const rows = history.map((item) => ({ ...item, manga: catalog.find((manga) => manga.id === item.mangaId) })).filter((item) => item.manga)
  return (
    <div>
      <Head title="Lịch sử đọc" text="Chương mở gần nhất của mỗi bộ." />
      {!rows.length && <div className="empty">Bạn chưa mở chương nào.</div>}
      <div className="note-list">
        {rows.map((row) => (
          <Link key={row.mangaId} to={`/doc/${row.mangaId}/${row.chapterId}`} className="chap">
            <span style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span className="rank-thumb"><Cover manga={row.manga} crop /></span>
              <span>
                <b>{row.manga.title}</b>
                <span className="views">Đang ở chương {row.chapterId} · {new Date(row.at).toLocaleString('vi-VN')}</span>
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export function MyAlbums() {
  useTitle('Album của bạn')
  const store = useStore()
  const catalog = useCatalog()
  const [name, setName] = useState('')
  const [isPublic, setPublic] = useState(false)

  function create(event) {
    event.preventDefault()
    if (!name.trim()) return
    store.addAlbum({
      id: `album-${Date.now()}`,
      name: name.trim(),
      desc: isPublic ? 'Chia sẻ công khai' : 'Chỉ mình bạn',
      owner: store.user?.name || 'Bạn',
      public: isPublic,
      mangaIds: [],
      reactions: 0,
    })
    setName('')
  }

  return (
    <div>
      <Head title="Album của bạn" text="Tạo tuyển tập rồi thêm truyện từ trang chi tiết." />
      <form className="row" onSubmit={create} style={{ marginBottom: 16 }}>
        <input className="input" placeholder="Tên album" value={name} onChange={(e) => setName(e.target.value)} />
        <label className="chip"><input type="checkbox" checked={isPublic} onChange={(e) => setPublic(e.target.checked)} /> Công khai</label>
        <button className="btn btn-pink" type="submit">Tạo</button>
      </form>
      {!store.albums.length && <div className="empty">Chưa có album.</div>}
      <div className="album-grid">
        {store.albums.map((album) => (
          <Link key={album.id} to={`/album/${album.id}`} className="album-card">
            <div className="stack">
              {(album.mangaIds.map((id) => catalog.find((manga) => manga.id === id)).filter(Boolean).slice(0, 3)).map((manga) => (
                <div key={manga.id} className="mini"><Cover manga={manga} crop /></div>
              ))}
            </div>
            <div>
              <h3>{album.name}</h3>
              <p className="muted">{album.public ? 'Công khai' : 'Riêng tư'} · {album.mangaIds.length} truyện</p>
            </div>
          </Link>
        ))}
      </div>
      <p className="meta">Gợi ý có sẵn: {communityAlbums.map((album) => album.name).join(', ')}.</p>
    </div>
  )
}

export function FollowAuthors() {
  useTitle('Tác giả theo dõi')
  const { followAuthors, toggleAuthor } = useStore()
  const list = authors.filter((author) => followAuthors.includes(author.id))
  return (
    <div>
      <Head title="Tác giả theo dõi" text="Bấm theo dõi ở trang tác giả để thêm vào đây." />
      {!list.length && <div className="empty">Chưa theo dõi tác giả nào.</div>}
      <div className="note-list">
        {list.map((author) => (
          <div key={author.id} className="chap">
            <Link to={`/tac-gia/${author.id}`}><b>{author.name}</b></Link>
            <button className="btn btn-ghost" type="button" onClick={() => toggleAuthor(author.id)}>Bỏ theo dõi</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export function FollowGroups() {
  useTitle('Dịch giả theo dõi')
  const store = useStore()
  const followedGroups = groups.filter((group) => store.followGroups.includes(group.id))
  return (
    <div>
      <Head title="Dịch giả theo dõi" text="Gồm dịch giả và nhóm dịch bạn đã bấm theo dõi." />
      <h2>Dịch giả</h2>
      {!store.followTranslators.length && <p className="muted">Chưa có dịch giả.</p>}
      {store.followTranslators.map((name) => (
        <div key={name} className="chap">
          <b>{name}</b>
          <button className="btn btn-ghost" type="button" onClick={() => store.toggleTranslator(name)}>Bỏ theo dõi</button>
        </div>
      ))}
      <h2>Nhóm dịch</h2>
      {!followedGroups.length && <p className="muted">Chưa có nhóm.</p>}
      {followedGroups.map((group) => (
        <div key={group.id} className="chap">
          <Link to={`/nhom-dich/${group.id}`}><b>{group.name}</b></Link>
          <button className="btn btn-ghost" type="button" onClick={() => store.toggleGroup(group.id)}>Bỏ theo dõi</button>
        </div>
      ))}
    </div>
  )
}

export function SettingsPage() {
  useTitle('Cài đặt đọc truyện')
  const { settings, updateSettings } = useStore()
  return (
    <div>
      <Head title="Cài đặt đọc truyện" text="Áp dụng cho mọi chương. Lưu trên máy bạn." />
      <div className="panel" style={{ padding: 16, display: 'grid', gap: 14 }}>
        <div>
          <b>Cách đọc</b>
          <div className="choice" style={{ marginTop: 8 }}>
            <button className={`tab ${settings.mode === 'scroll' ? 'on' : ''}`} type="button" onClick={() => updateSettings({ mode: 'scroll' })}>Cuộn dọc</button>
            <button className={`tab ${settings.mode === 'page' ? 'on' : ''}`} type="button" onClick={() => updateSettings({ mode: 'page' })}>Từng trang</button>
          </div>
        </div>
        <div>
          <b>Độ rộng trang</b>
          <div className="choice" style={{ marginTop: 8 }}>
            {[640, 760, 920].map((width) => (
              <button key={width} className={`tab ${settings.width === width ? 'on' : ''}`} type="button" onClick={() => updateSettings({ width })}>{width}px</button>
            ))}
          </div>
        </div>
        <div>
          <b>Màu nền</b>
          <div className="choice" style={{ marginTop: 8 }}>
            {['#0c0a10', '#16141c', '#efe6d6', '#f7f7f5'].map((color) => (
              <button key={color} className={`swatch ${settings.bg === color ? 'on' : ''}`} style={{ background: color }} type="button" onClick={() => updateSettings({ bg: color })} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function SecurityPage() {
  useTitle('Bảo mật')
  const { user, logout, notify } = useStore()
  const [password, setPassword] = useState('')
  return (
    <div>
      <Head title="Bảo mật" text="Đăng nhập ở bản này chỉ để gắn tên. Mật khẩu không được gửi đi đâu." />
      <div className="panel" style={{ padding: 16 }}>
        {user ? (
          <>
            <p>Đang dùng tên <b>{user.name}</b> · {user.email}</p>
            <form className="row" onSubmit={(event) => {
              event.preventDefault()
              if (password.length < 6) { notify('Mật khẩu mới cần ít nhất 6 ký tự'); return }
              setPassword('')
              notify('Đã cập nhật mật khẩu trên phiên này')
            }}>
              <input className="input" type="password" placeholder="Mật khẩu mới" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button className="btn btn-pink" type="submit">Đổi mật khẩu</button>
            </form>
            <button className="btn btn-ghost" style={{ marginTop: 12 }} type="button" onClick={logout}>Đăng xuất</button>
          </>
        ) : (
          <p>Bạn chưa đăng nhập. <Link to="/dang-nhap" className="pink">Vào trang đăng nhập</Link></p>
        )}
        <p className="muted">Phiên hiện tại: trình duyệt này · Windows</p>
      </div>
    </div>
  )
}

export function LoginPage() {
  useTitle('Đăng nhập')
  const { user, login } = useStore()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function submit(event) {
    event.preventDefault()
    if (!email.includes('@') || password.length < 4) {
      setError('Cần email hợp lệ và mật khẩu từ 4 ký tự.')
      return
    }
    const display = (mode === 'register' ? name : email.split('@')[0]).trim() || 'Bạn đọc'
    login({ name: display, email })
    navigate('/')
  }

  if (user) {
    return (
      <div>
        <Head title={`Xin chào, ${user.name}`} text={user.email} />
        <Link className="btn btn-pink" to="/bao-mat">Mở bảo mật</Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 460, margin: '12px auto' }}>
      <div className="panel" style={{ padding: 20 }}>
        <div className="tabs-line">
          <button className={mode === 'login' ? 'on' : ''} type="button" onClick={() => setMode('login')}>Đăng nhập</button>
          <button className={mode === 'register' ? 'on' : ''} type="button" onClick={() => setMode('register')}>Tạo tài khoản</button>
        </div>
        <form onSubmit={submit} className="form-grid" style={{ marginTop: 12 }}>
          {mode === 'register' && (
            <label className="lbl full">Tên hiển thị
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
          )}
          <label className="lbl full">Email
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="lbl full">Mật khẩu
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {error && <p className="pink full">{error}</p>}
          <button className="btn btn-pink full" type="submit">{mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}</button>
        </form>
      </div>
    </div>
  )
}

export function UploadPage() {
  useTitle('Đăng truyện')
  const { uploadManga, user } = useStore()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [alt, setAlt] = useState('')
  const [description, setDescription] = useState('')
  const [picked, setPicked] = useState(['romance'])

  function toggle(slug) {
    setPicked((current) => current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug])
  }

  function submit(event) {
    event.preventDefault()
    const id = `${title.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now().toString().slice(-4)}`
    uploadManga({
      id,
      title: title.trim(),
      alt: alt.trim() || 'Bản gốc chưa đặt',
      authorId: 'guest',
      authorName: user?.name || 'Bạn',
      groupId: 'doc-lap',
      groupName: 'Độc lập',
      translator: user?.name || 'Bạn',
      genres: picked.length ? picked : ['romance'],
      views: 1,
      likes: 0,
      follows: 0,
      status: 'Đang ra',
      updated: 'Vừa xong',
      hue: Math.floor(Math.random() * 360),
      badge: 'MỚI',
      kind: 'Doujinshi',
      chapterCount: 1,
      lead: 'Bạn',
      partner: 'Người ấy',
      blurb: description.trim().slice(0, 140),
      description: description.trim(),
      lineA: 'Đây là chương vừa đăng trên máy mình.',
      lineB: 'Cảm ơn vì đã mở ra đọc.',
    })
    navigate(`/truyen/${id}`)
  }

  return (
    <div>
      <Head title="Đăng truyện" text="Truyện mới chỉ hiện trên trình duyệt này." />
      <form className="panel form-grid" style={{ padding: 16 }} onSubmit={submit}>
        <label className="lbl">Tên truyện
          <input className="input" required value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="lbl">Tên khác
          <input className="input" value={alt} onChange={(e) => setAlt(e.target.value)} />
        </label>
        <label className="lbl full">Mô tả
          <textarea className="input" required value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <div className="full">
          <b>Thể loại</b>
          <div className="check-grid" style={{ marginTop: 8 }}>
            {genres.map((genre) => (
              <label key={genre.slug}><input type="checkbox" checked={picked.includes(genre.slug)} onChange={() => toggle(genre.slug)} /> {genre.name}</label>
            ))}
          </div>
        </div>
        <button className="btn btn-pink" type="submit">Đăng lên kệ</button>
      </form>
    </div>
  )
}

export function Notifications() {
  useTitle('Thông báo')
  const { readNotes, markNotice, markAllNotices } = useStore()
  return (
    <div>
      <div className="section-head">
        <h1 className="section-title" style={{ textTransform: 'none' }}>Thông báo</h1>
        <button className="btn btn-ghost" type="button" onClick={() => markAllNotices(notices.map((item) => item.id))}>Đánh dấu đã đọc</button>
      </div>
      <div className="note-list">
        {notices.map((notice) => (
          <Link key={notice.id} to={notice.href} className={`notice ${readNotes.includes(notice.id) ? '' : 'unread'}`} onClick={() => markNotice(notice.id)}>
            <b>{notice.title}</b>
            <p className="muted" style={{ margin: '4px 0' }}>{notice.body}</p>
            <span className="meta">{notice.time}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export function NotFound() {
  useTitle('Không tìm thấy')
  return (
    <div className="empty">
      <p>Trang này không có trong MOCHI.</p>
      <Link to="/" className="btn btn-pink">Về trang chủ</Link>
    </div>
  )
}

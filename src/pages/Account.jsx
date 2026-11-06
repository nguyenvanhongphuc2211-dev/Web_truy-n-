import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MangaGrid } from '../components/Bits'
import { api } from '../api'
import { chapterNotices, notices } from '../data'
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

export function FollowedStories() {
  useTitle('Truyện theo dõi')
  const catalog = useCatalog()
  const { follows } = useStore()
  const items = (follows || []).map((id) => catalog.find((manga) => manga.id === id)).filter(Boolean)
  return (
    <div>
      <Head title="Truyện theo dõi" text="Chương mới của các bộ này hiện trong Thông báo." />
      {items.length ? <MangaGrid items={items} /> : <div className="empty">Bạn chưa theo dõi bộ nào. Mở một truyện và bấm Theo dõi.</div>}
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
        <input className="input" aria-label="Tên album" placeholder="Tên album" value={name} onChange={(e) => setName(e.target.value)} />
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
    </div>
  )
}

export function FollowAuthors() {
  useTitle('Tác giả theo dõi')
  const { authors, followAuthors, toggleAuthor } = useStore()
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
  const followedGroups = store.groups.filter((group) => store.followGroups.includes(group.id))
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
  const { user, logout, notify, authReady } = useStore()
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    if (password.length < 6) {
      notify('Mật khẩu mới cần ít nhất 6 ký tự')
      return
    }
    setBusy(true)
    try {
      await api.changePassword({ currentPassword, password })
      setCurrentPassword('')
      setPassword('')
      notify('Đã đổi mật khẩu trên máy chủ')
    } catch (err) {
      notify(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (!authReady) return <div className="empty">Đang kiểm tra phiên đăng nhập…</div>

  return (
    <div>
      <Head title="Bảo mật" text="Tài khoản lưu trên MongoDB. Mật khẩu được băm, không lưu bản rõ." />
      <div className="panel" style={{ padding: 16 }}>
        {user ? (
          <>
            <p>Đang dùng tên <b>{user.name}</b> · {user.email}</p>
            <p className="muted">{user.role === 'admin' ? 'Tài khoản quản trị, được duyệt truyện.' : user.role === 'uploader' ? 'Tài khoản đăng truyện.' : 'Tài khoản đọc truyện.'}</p>
            <p className="muted">{user.emailVerified ? 'Email đã xác minh.' : 'Email chưa xác minh.'}</p>
            {user.role === 'admin' && <p><Link className="pink" to="/duyet-truyen">Mở trang duyệt truyện</Link></p>}
            <form className="form-grid" style={{ marginTop: 12 }} onSubmit={submit}>
              <label className="lbl full">Mật khẩu hiện tại
                <input className="input" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              </label>
              <label className="lbl full">Mật khẩu mới
                <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </label>
              <button className="btn btn-pink" type="submit" disabled={busy}>{busy ? 'Đang lưu…' : 'Đổi mật khẩu'}</button>
            </form>
            <button className="btn btn-ghost" style={{ marginTop: 12 }} type="button" onClick={logout}>Đăng xuất</button>
          </>
        ) : (
          <p>Bạn chưa đăng nhập. <Link to="/dang-nhap" className="pink">Vào trang đăng nhập</Link></p>
        )}
      </div>
    </div>
  )
}

export function Notifications() {
  useTitle('Thông báo')
  const catalog = useCatalog()
  const { readNotes, follows, seen, markNotice, markAllNotices } = useStore()
  const feed = [...chapterNotices(catalog, follows, seen), ...notices]
  return (
    <div>
      <div className="section-head">
        <h1 className="section-title" style={{ textTransform: 'none' }}>Thông báo</h1>
        <button className="btn btn-ghost" type="button" onClick={() => markAllNotices(feed.map((item) => item.id))}>Đánh dấu đã đọc</button>
      </div>
      <div className="note-list">
        {feed.map((notice) => (
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

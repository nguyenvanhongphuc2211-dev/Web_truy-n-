import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Cover from '../components/Cover'
import { MangaGrid } from '../components/Bits'
import { api } from '../api'
import { useTitle } from '../hooks'
import { useCatalog, useStore } from '../store'

function Head({ title, text }) {
  return (
    <div className="page-head">
      <h1>{title}</h1>
      {text && <p className="muted">{text}</p>}
    </div>
  )
}

export function modLabel(value) {
  if (value === 'pending') return 'Chờ duyệt'
  if (value === 'draft') return 'Nháp'
  if (value === 'rejected') return 'Từ chối'
  return 'Đã lên kệ'
}

async function uploadList(files) {
  const urls = []
  for (const file of files) {
    const data = await api.uploadImage(file)
    if (data.url) urls.push(data.url)
  }
  return urls
}

export function UploadPage() {
  useTitle('Đăng truyện')
  const { user, genres, authReady, setUser, reloadCatalog, notify } = useStore()
  const catalog = useCatalog()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [alt, setAlt] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [description, setDescription] = useState('')
  const [kind, setKind] = useState('Manga')
  const [status, setStatus] = useState('Đang ra')
  const [picked, setPicked] = useState([])
  const [coverUrl, setCoverUrl] = useState('')
  const [chapterTitle, setChapterTitle] = useState('Chương 1')
  const [chapterText, setChapterText] = useState('')
  const [images, setImages] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const mine = catalog.filter((manga) => user && manga.ownerId === user.id)

  useEffect(() => {
    if (user?.name && !authorName) setAuthorName(user.name)
  }, [user, authorName])

  function toggle(slug) {
    setPicked((current) => current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug])
  }

  async function onCover(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setBusy(true)
    setError('')
    try {
      const data = await api.uploadImage(file)
      setCoverUrl(data.url)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
      event.target.value = ''
    }
  }

  async function onPages(event) {
    const files = [...(event.target.files || [])]
    if (!files.length) return
    setBusy(true)
    setError('')
    try {
      const urls = await uploadList(files)
      setImages((current) => [...current, ...urls])
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
      event.target.value = ''
    }
  }

  async function submit(event, draft) {
    event.preventDefault()
    if (!user) {
      navigate('/dang-nhap')
      return
    }
    setBusy(true)
    setError('')
    try {
      const payload = await api.createManga({
        title: title.trim(),
        alt: alt.trim(),
        authorName: authorName.trim(),
        translator: user.name,
        description: description.trim(),
        genres: picked,
        kind,
        status,
        coverUrl,
        chapterTitle: chapterTitle.trim(),
        chapterText: chapterText.trim(),
        images,
        draft,
      })
      if (payload.user) setUser(payload.user)
      await reloadCatalog()
      notify(draft ? 'Đã lưu nháp' : 'Đã gửi chờ quản trị duyệt')
      navigate(`/dang-truyen/${payload.manga.id}`)
    } catch (err) {
      if (err.payload?.needsVerification) {
        navigate(`/xac-minh-email?email=${encodeURIComponent(err.payload.email || user.email)}`)
        return
      }
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (!authReady) return <div className="empty">Đang kiểm tra phiên đăng nhập…</div>

  if (!user) {
    return (
      <div>
        <Head title="Đăng truyện" text="Cần tài khoản đăng truyện. Truyện mới phải được quản trị duyệt mới lên kệ." />
        <div className="panel" style={{ padding: 16 }}>
          <p>Đăng nhập hoặc tạo tài khoản loại <b>Đăng truyện</b> rồi gửi bản lên duyệt.</p>
          <div className="auth-actions">
            <Link className="btn btn-pink" to="/dang-nhap">Đăng nhập</Link>
            <Link className="btn btn-ghost" to="/dang-ky?role=uploader">Tạo tài khoản đăng truyện</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Head title="Đăng truyện" text="Điền thông tin, tải bìa và chương. Gửi duyệt thì mới lên kệ công khai." />
      <form className="panel form-grid" style={{ padding: 16 }} onSubmit={(event) => submit(event, false)}>
        <label className="lbl">Tên truyện
          <input className="input" required value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="lbl">Tên khác
          <input className="input" value={alt} onChange={(e) => setAlt(e.target.value)} />
        </label>
        <label className="lbl">Tác giả trên bìa
          <input className="input" value={authorName} onChange={(e) => setAuthorName(e.target.value)} />
        </label>
        <label className="lbl">Loại
          <select className="input" value={kind} onChange={(e) => setKind(e.target.value)}>
            <option>Manga</option>
            <option>Tiểu thuyết</option>
          </select>
        </label>
        <label className="lbl">Trạng thái
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>Đang ra</option>
            <option>Hoàn thành</option>
            <option>Tạm dừng</option>
          </select>
        </label>
        <label className="lbl">Ảnh bìa
          <input className="input" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={onCover} />
        </label>
        {coverUrl && (
          <div className="full cover-preview">
            <Cover manga={{ id: 'preview', title, coverUrl, hue: 340 }} />
          </div>
        )}
        <label className="lbl full">Mô tả
          <textarea className="input" required minLength={8} value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <div className="full">
          <b>Thể loại</b>
          <div className="check-grid" style={{ marginTop: 8 }}>
            {genres.map((genre) => (
              <label key={genre.slug}><input type="checkbox" checked={picked.includes(genre.slug)} onChange={() => toggle(genre.slug)} /> {genre.name}</label>
            ))}
          </div>
        </div>
        <label className="lbl">Chương đầu
          <input className="input" value={chapterTitle} onChange={(e) => setChapterTitle(e.target.value)} />
        </label>
        {kind === 'Tiểu thuyết' ? (
          <label className="lbl full">Nội dung chữ (cách đoạn bằng dòng trống)
            <textarea className="input" rows={8} value={chapterText} onChange={(e) => setChapterText(e.target.value)} />
          </label>
        ) : (
          <label className="lbl full">Trang chương (ảnh, theo thứ tự đọc)
            <input className="input" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={onPages} />
          </label>
        )}
        {images.length > 0 && (
          <div className="full page-thumbs">
            {images.map((url) => <img key={url} src={url} alt="" />)}
          </div>
        )}
        {error && <p className="pink full" role="alert">{error}</p>}
        <div className="full auth-actions" style={{ gridColumn: '1 / -1' }}>
          <button className="btn btn-pink" type="submit" disabled={busy}>{busy ? 'Đang gửi…' : 'Gửi duyệt'}</button>
          <button className="btn btn-ghost" type="button" disabled={busy} onClick={(event) => submit(event, true)}>Lưu nháp</button>
        </div>
      </form>
      {mine.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <h2 className="section-title">Truyện bạn đã đăng</h2>
          <div className="note-list" style={{ marginBottom: 16 }}>
            {mine.map((manga) => (
              <Link key={manga.id} to={`/dang-truyen/${manga.id}`} className="chap">
                <span>
                  <b>{manga.title}</b>
                  <span className="views">{modLabel(manga.moderation)}</span>
                </span>
              </Link>
            ))}
          </div>
          <MangaGrid items={mine} />
        </div>
      )}
    </div>
  )
}

export function ManageMangaPage() {
  const { id } = useParams()
  const { user, genres, authReady, reloadCatalog, notify, ensureManga } = useStore()
  const catalog = useCatalog()
  const navigate = useNavigate()
  const manga = catalog.find((item) => item.id === id)
  useTitle(manga?.title || 'Sửa truyện')
  const [title, setTitle] = useState('')
  const [alt, setAlt] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [description, setDescription] = useState('')
  const [kind, setKind] = useState('Manga')
  const [status, setStatus] = useState('Đang ra')
  const [picked, setPicked] = useState([])
  const [coverUrl, setCoverUrl] = useState('')
  const [chapterTitle, setChapterTitle] = useState('')
  const [chapterText, setChapterText] = useState('')
  const [images, setImages] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    ensureManga(id)
  }, [id, ensureManga])

  useEffect(() => {
    if (!manga) return
    setTitle(manga.title || '')
    setAlt(manga.alt || '')
    setAuthorName(manga.authorName || '')
    setDescription(manga.description || '')
    setKind(manga.kind === 'Tiểu thuyết' ? 'Tiểu thuyết' : 'Manga')
    setStatus(manga.status || 'Đang ra')
    setPicked(manga.genres || [])
    setCoverUrl(manga.coverUrl || '')
  }, [manga])

  if (!authReady) return <div className="empty">Đang kiểm tra phiên đăng nhập…</div>
  if (!user) {
    return <div className="empty">Cần đăng nhập. <Link to="/dang-nhap">Vào đăng nhập</Link></div>
  }
  if (!manga) return <div className="empty">Không thấy truyện này.</div>
  if (user.role !== 'admin' && manga.ownerId !== user.id) {
    return <div className="empty">Bạn không được sửa truyện này.</div>
  }

  async function save(event, submit) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api.updateManga(id, {
        title: title.trim(),
        alt: alt.trim(),
        authorName: authorName.trim(),
        description: description.trim(),
        genres: picked,
        kind,
        status,
        coverUrl,
        submit,
      })
      await reloadCatalog()
      notify(submit ? 'Đã gửi lại chờ duyệt' : 'Đã lưu. Nếu đã lên kệ thì phải duyệt lại.')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function addChapter(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api.addChapter(id, {
        title: chapterTitle.trim() || `Chương ${(manga.chapters?.length || 0) + 1}`,
        chapterText: chapterText.trim(),
        images,
      })
      setChapterTitle('')
      setChapterText('')
      setImages([])
      await reloadCatalog()
      notify('Đã thêm chương, chờ duyệt lại nếu truyện đang công khai.')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (!window.confirm(`Xóa "${manga.title}" khỏi máy chủ?`)) return
    setBusy(true)
    try {
      await api.deleteManga(id)
      await reloadCatalog()
      notify('Đã xóa truyện')
      navigate('/dang-truyen')
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div>
      <Head title={manga.title} text={`${modLabel(manga.moderation)}${manga.reviewNote ? ` · ${manga.reviewNote}` : ''}`} />
      <p className="crumbs"><Link to="/dang-truyen">Đăng truyện</Link> / Sửa</p>
      {manga.moderation === 'rejected' && manga.reviewNote && (
        <p className="mod-banner is-reject" role="status">Quản trị từ chối: {manga.reviewNote}</p>
      )}
      {manga.moderation === 'pending' && (
        <p className="mod-banner" role="status">Đang chờ quản trị duyệt. Chưa hiện trên kệ công khai.</p>
      )}
      <form className="panel form-grid" style={{ padding: 16 }} onSubmit={(event) => save(event, false)}>
        <label className="lbl">Tên truyện
          <input className="input" required value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="lbl">Tên khác
          <input className="input" value={alt} onChange={(e) => setAlt(e.target.value)} />
        </label>
        <label className="lbl">Tác giả
          <input className="input" value={authorName} onChange={(e) => setAuthorName(e.target.value)} />
        </label>
        <label className="lbl">Loại
          <select className="input" value={kind} onChange={(e) => setKind(e.target.value)}>
            <option>Manga</option>
            <option>Tiểu thuyết</option>
          </select>
        </label>
        <label className="lbl">Trạng thái
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>Đang ra</option>
            <option>Hoàn thành</option>
            <option>Tạm dừng</option>
          </select>
        </label>
        <label className="lbl">Đổi bìa
          <input className="input" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={async (event) => {
            const file = event.target.files?.[0]
            if (!file) return
            try {
              setCoverUrl((await api.uploadImage(file)).url)
            } catch (err) {
              setError(err.message)
            }
            event.target.value = ''
          }} />
        </label>
        <div className="full cover-preview"><Cover manga={{ ...manga, coverUrl, title }} /></div>
        <label className="lbl full">Mô tả
          <textarea className="input" required value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <div className="full">
          <b>Thể loại</b>
          <div className="check-grid" style={{ marginTop: 8 }}>
            {genres.map((genre) => (
              <label key={genre.slug}>
                <input type="checkbox" checked={picked.includes(genre.slug)} onChange={() => setPicked((current) => current.includes(genre.slug) ? current.filter((item) => item !== genre.slug) : [...current, genre.slug])} />
                {genre.name}
              </label>
            ))}
          </div>
        </div>
        {error && <p className="pink full" role="alert">{error}</p>}
        <div className="full auth-actions">
          <button className="btn btn-ghost" type="submit" disabled={busy}>Lưu thay đổi</button>
          {(manga.moderation === 'draft' || manga.moderation === 'rejected') && (
            <button className="btn btn-pink" type="button" disabled={busy} onClick={(event) => save(event, true)}>Gửi duyệt</button>
          )}
          <Link className="btn btn-ghost" to={`/truyen/${manga.id}`}>Xem trang truyện</Link>
          <button className="btn btn-ghost" type="button" disabled={busy} onClick={remove}>Xóa truyện</button>
        </div>
      </form>

      <h2 className="section-title" style={{ marginTop: 28 }}>Chương đã có</h2>
      <div className="note-list">
        {(manga.chapters || []).map((chapter) => (
          <Link key={chapter.id} to={`/doc/${manga.id}/${chapter.id}`} className="chap">
            <b>{chapter.title}</b>
            <span className="views">{chapter.images?.length ? `${chapter.images.length} trang` : (chapter.paragraphs?.length ? 'Chữ' : 'Trống')}</span>
          </Link>
        ))}
      </div>

      <form className="panel form-grid" style={{ padding: 16, marginTop: 16 }} onSubmit={addChapter}>
        <h2 className="full" style={{ margin: 0 }}>Thêm chương</h2>
        <label className="lbl full">Tên chương
          <input className="input" value={chapterTitle} onChange={(e) => setChapterTitle(e.target.value)} placeholder={`Chương ${(manga.chapters?.length || 0) + 1}`} />
        </label>
        {kind === 'Tiểu thuyết' ? (
          <label className="lbl full">Nội dung
            <textarea className="input" rows={8} value={chapterText} onChange={(e) => setChapterText(e.target.value)} />
          </label>
        ) : (
          <label className="lbl full">Ảnh trang
            <input className="input" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={async (event) => {
              const files = [...(event.target.files || [])]
              if (!files.length) return
              try {
                const urls = await uploadList(files)
                setImages((current) => [...current, ...urls])
              } catch (err) {
                setError(err.message)
              }
              event.target.value = ''
            }} />
          </label>
        )}
        {images.length > 0 && (
          <div className="full page-thumbs">
            {images.map((url) => <img key={url} src={url} alt="" />)}
          </div>
        )}
        <button className="btn btn-pink" type="submit" disabled={busy}>Thêm chương</button>
      </form>
    </div>
  )
}

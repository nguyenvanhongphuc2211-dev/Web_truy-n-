import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Cover from '../components/Cover'
import { api } from '../api'
import { useTitle } from '../hooks'
import { useStore } from '../store'
import { modLabel } from './Publish'

const TABS = [
  { id: 'pending', label: 'Chờ duyệt' },
  { id: 'rejected', label: 'Từ chối' },
  { id: 'approved', label: 'Đã lên kệ' },
  { id: 'draft', label: 'Nháp' },
]

export default function AdminPage() {
  useTitle('Duyệt truyện')
  const { user, authReady, reloadCatalog, notify } = useStore()
  const [status, setStatus] = useState('pending')
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')
  const [note, setNote] = useState('')

  async function load(next = status) {
    setError('')
    try {
      setItems(await api.reviewQueue(next))
    } catch (err) {
      setError(err.message)
      setItems([])
    }
  }

  useEffect(() => {
    if (user?.role === 'admin') load(status)
  }, [user, status])

  if (!authReady) return <div className="empty">Đang kiểm tra phiên đăng nhập…</div>
  if (!user) {
    return <div className="empty">Cần đăng nhập quản trị. <Link to="/dang-nhap">Đăng nhập</Link></div>
  }
  if (user.role !== 'admin') {
    return <div className="empty">Tài khoản này không phải quản trị.</div>
  }

  async function decide(id, action) {
    setBusy(id + action)
    try {
      await api.reviewManga(id, { action, note })
      setNote('')
      await load(status)
      await reloadCatalog()
      notify(action === 'approve' ? 'Đã duyệt lên kệ' : 'Đã từ chối')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy('')
    }
  }

  return (
    <div>
      <div className="page-head">
        <h1>Duyệt truyện</h1>
        <p className="muted">Truyện gửi lên chỉ hiện công khai sau khi tài khoản quản trị duyệt.</p>
      </div>
      <div className="tabs-line">
        {TABS.map((tab) => (
          <button key={tab.id} className={status === tab.id ? 'on' : ''} type="button" onClick={() => setStatus(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>
      <label className="lbl" style={{ margin: '16px 0' }}>Lý do từ chối (nếu cần)
        <input className="input" value={note} onChange={(e) => setNote(e.target.value)} />
      </label>
      {error && <p className="pink" role="alert">{error}</p>}
      {!items.length && <div className="empty">Không có truyện ở mục này.</div>}
      <div className="review-list">
        {items.map((manga) => (
          <article key={manga.id} className="panel review-card">
            <Cover manga={manga} crop />
            <div>
              <h2>{manga.title}</h2>
              <p className="muted">{manga.authorName} · {manga.groupName} · {modLabel(manga.moderation)}</p>
              <p>{manga.blurb || manga.description}</p>
              <p className="views">{manga.chapters?.length || 0} chương</p>
              <div className="auth-actions">
                <Link className="btn btn-ghost" to={`/truyen/${manga.id}`}>Xem</Link>
                <Link className="btn btn-ghost" to={`/dang-truyen/${manga.id}`}>Sửa</Link>
                {manga.moderation !== 'approved' && (
                  <button className="btn btn-pink" type="button" disabled={Boolean(busy)} onClick={() => decide(manga.id, 'approve')}>
                    {busy === `${manga.id}approve` ? 'Đang duyệt…' : 'Duyệt lên kệ'}
                  </button>
                )}
                {manga.moderation !== 'rejected' && (
                  <button className="btn btn-ghost" type="button" disabled={Boolean(busy)} onClick={() => decide(manga.id, 'reject')}>
                    Từ chối
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

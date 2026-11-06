import { useEffect, useRef, useState } from 'react'
import { Link, Outlet, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api'
import { useTitle } from '../hooks'
import { ToastLine } from '../components/Toast'
import { useStore } from '../store'

function Mascot() {
  return (
    <svg className="mascot" viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="34" r="18" fill="#ffd2e6" />
      <circle cx="18" cy="20" r="8" fill="#ffd2e6" />
      <circle cx="46" cy="20" r="8" fill="#ffd2e6" />
      <circle cx="25" cy="34" r="2.4" fill="#3a2430" />
      <circle cx="39" cy="34" r="2.4" fill="#3a2430" />
      <path d="M28 40 Q32 44 36 40" fill="none" stroke="#e06a98" strokeWidth="2" />
    </svg>
  )
}

export function AuthLayout() {
  const { toast } = useStore()
  return (
    <div className="auth-page">
      <Link to="/" className="auth-brand">
        <b>MOCHI</b>
        <Mascot />
      </Link>
      <div className="auth-card">
        <Outlet />
      </div>
      <p className="auth-back"><Link to="/">← Về trang chủ</Link></p>
      <ToastLine toast={toast} />
    </div>
  )
}

function SignedIn({ user }) {
  return (
    <div>
      <h1>Bạn đã đăng nhập</h1>
      <p className="muted">{user.name} · {user.email}</p>
      <div className="auth-actions">
        <Link className="btn btn-pink" to="/">Về trang chủ</Link>
        <Link className="btn btn-ghost" to="/bao-mat">Mở bảo mật</Link>
      </div>
    </div>
  )
}

export function LoginPage() {
  useTitle('Đăng nhập')
  const { user, setSession, authReady } = useStore()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const errorRef = useRef(null)

  useEffect(() => {
    if (error) errorRef.current?.focus()
  }, [error])

  async function submit(event) {
    event.preventDefault()
    if (!email.includes('@') || password.length < 6) {
      setError('Cần email hợp lệ và mật khẩu từ 6 ký tự.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const payload = await api.login({ email, password })
      setSession(payload.user, payload.token)
      navigate('/')
    } catch (err) {
      if (err.payload?.needsVerification) {
        navigate(`/xac-minh-email?email=${encodeURIComponent(err.payload.email || email.trim().toLowerCase())}`)
        return
      }
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (!authReady) return <p className="muted">Đang kiểm tra phiên đăng nhập…</p>
  if (user) return <SignedIn user={user} />

  return (
    <>
      <h1>Đăng nhập</h1>
      <p className="muted">Vào tài khoản MOCHI để đọc và theo dõi truyện.</p>
      <form className="auth-form" onSubmit={submit} noValidate>
        {error && (
          <p ref={errorRef} className="auth-error" role="alert" tabIndex={-1}>{error}</p>
        )}
        <label className="lbl">Email
          <input
            className="input"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="lbl">Mật khẩu
          <input
            className="input"
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button className="btn btn-pink btn-block" type="submit" disabled={busy}>
          {busy ? 'Đang đăng nhập…' : 'Đăng nhập'}
        </button>
      </form>
      <p className="auth-switch">Chưa có tài khoản? <Link to="/dang-ky">Tạo tài khoản</Link></p>
    </>
  )
}

export function RegisterPage() {
  useTitle('Tạo tài khoản')
  const { user, authReady } = useStore()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState(() => (params.get('role') === 'uploader' ? 'uploader' : 'reader'))
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const errorRef = useRef(null)

  useEffect(() => {
    if (error) errorRef.current?.focus()
  }, [error])

  async function submit(event) {
    event.preventDefault()
    if (name.trim().length < 2) {
      setError('Tên hiển thị cần ít nhất 2 ký tự.')
      return
    }
    if (!email.includes('@') || password.length < 6) {
      setError('Cần email hợp lệ và mật khẩu từ 6 ký tự.')
      return
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await api.register({ name: name.trim(), email, password, confirmPassword, role })
      navigate(`/xac-minh-email?email=${encodeURIComponent(email.trim().toLowerCase())}`)
    } catch (err) {
      if (err.payload?.needsVerification) {
        navigate(`/xac-minh-email?email=${encodeURIComponent(err.payload.email || email.trim().toLowerCase())}`)
        return
      }
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (!authReady) return <p className="muted">Đang kiểm tra phiên đăng nhập…</p>
  if (user) return <SignedIn user={user} />

  return (
    <>
      <h1>Tạo tài khoản</h1>
      <p className="muted">Chọn đọc truyện hoặc đăng truyện. Mật khẩu tối thiểu 6 ký tự.</p>
      <form className="auth-form" onSubmit={submit} noValidate>
        {error && (
          <p ref={errorRef} className="auth-error" role="alert" tabIndex={-1}>{error}</p>
        )}
        <fieldset className="role-pick">
          <legend>Loại tài khoản</legend>
          <label>
            <input type="radio" name="role" value="reader" checked={role === 'reader'} onChange={() => setRole('reader')} />
            <span>
              <b>Đọc truyện</b>
              <em>Theo dõi, lưu kệ, bình luận.</em>
            </span>
          </label>
          <label>
            <input type="radio" name="role" value="uploader" checked={role === 'uploader'} onChange={() => setRole('uploader')} />
            <span>
              <b>Đăng truyện</b>
              <em>Tài khoản nhóm dịch / người đăng lên kệ.</em>
            </span>
          </label>
        </fieldset>
        <label className="lbl">Tên hiển thị
          <input className="input" name="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="lbl">Email
          <input className="input" type="email" name="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="lbl">Mật khẩu
          <input className="input" type="password" name="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <label className="lbl">Xác nhận mật khẩu
          <input className="input" type="password" name="confirmPassword" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </label>
        <button className="btn btn-pink btn-block" type="submit" disabled={busy}>
          {busy ? 'Đang tạo…' : 'Tạo tài khoản'}
        </button>
      </form>
      <p className="auth-switch">Đã có tài khoản? <Link to="/dang-nhap">Đăng nhập</Link></p>
    </>
  )
}

export function VerifyEmailPage() {
  useTitle('Xác minh email')
  const { setSession, user } = useStore()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [email, setEmail] = useState(() => params.get('email') || '')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [info, setInfo] = useState('')
  const errorRef = useRef(null)

  useEffect(() => {
    if (error) errorRef.current?.focus()
  }, [error])

  async function submit(event) {
    event.preventDefault()
    if (!email.includes('@') || code.replace(/\D/g, '').length !== 6) {
      setError('Cần email và mã gồm 6 số.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const payload = await api.verifyEmail({ email, code })
      setSession(payload.user, payload.token)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function resend() {
    if (!email.includes('@')) {
      setError('Nhập email trước khi gửi lại mã.')
      return
    }
    setBusy(true)
    setError('')
    setInfo('')
    try {
      await api.resendVerify({ email })
      setInfo('Đã gửi mã mới. Kiểm tra hộp thư, hoặc cửa sổ chạy API nếu chưa gắn SMTP.')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (user?.emailVerified) {
    return (
      <>
        <h1>Email đã xác minh</h1>
        <p className="muted">{user.email}</p>
        <Link className="btn btn-pink btn-block" to="/">Về trang chủ</Link>
      </>
    )
  }

  return (
    <>
      <h1>Xác minh email</h1>
      <p className="muted">Nhập mã 6 số gửi tới hộp thư. Mã hết hạn sau 15 phút. Có thể dán mã từ email.</p>
      <form className="auth-form" onSubmit={submit} noValidate>
        {error && (
          <p ref={errorRef} className="auth-error" role="alert" tabIndex={-1}>{error}</p>
        )}
        {info && <p className="muted">{info}</p>}
        <label className="lbl">Email
          <input className="input" type="email" name="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="lbl">Mã xác minh
          <input
            className="input"
            inputMode="numeric"
            name="one-time-code"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          />
        </label>
        <button className="btn btn-pink btn-block" type="submit" disabled={busy}>{busy ? 'Đang kiểm tra…' : 'Xác minh'}</button>
        <button className="btn btn-ghost btn-block" type="button" disabled={busy} onClick={resend}>Gửi lại mã</button>
      </form>
      <p className="auth-switch"><Link to="/dang-nhap">Quay lại đăng nhập</Link></p>
    </>
  )
}

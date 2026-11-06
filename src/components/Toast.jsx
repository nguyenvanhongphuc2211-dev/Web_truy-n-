import { Link } from 'react-router-dom'
import { useStore } from '../store'

export function ToastLine({ toast }) {
  const { clearToast } = useStore()
  if (!toast) return null
  if (toast === 'login') {
    return (
      <div className="login-note" role="status">
        <p>Bạn cần phải <Link to="/dang-nhap" onClick={clearToast}>đăng nhập</Link></p>
      </div>
    )
  }
  return <div className="toast" role="status">{toast}</div>
}

import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell, BookOpen, ChevronDown, ChevronsLeft, Compass, FolderHeart,
  History, Home, Library, LogIn, Menu, MessagesSquare, Search, Settings,
  Shield, SlidersHorizontal, Upload, UserRound, Users, X,
} from 'lucide-react'
import { chapterNotices, fold, notices } from '../data'
import { useCatalog, useStore } from '../store'
import Cover from './Cover'
import { ToastLine } from './Toast'

const groups = [
  {
    id: 'explore',
    label: 'Khám phá',
    icon: Compass,
    children: [
      { to: '/danh-sach', label: 'Danh sách truyện', icon: Library },
      { to: '/tim-kiem', label: 'Tìm truyện', icon: SlidersHorizontal },
    ],
  },
  {
    id: 'library',
    label: 'Thư viện của bạn',
    icon: BookOpen,
    children: [
      { to: '/theo-doi/truyen', label: 'Truyện theo dõi', icon: Bell },
      { to: '/lich-su', label: 'Lịch sử đọc', icon: History },
      { to: '/album-cua-ban', label: 'Album của bạn', icon: FolderHeart },
      { to: '/theo-doi/tac-gia', label: 'Tác giả theo dõi', icon: UserRound },
      { to: '/theo-doi/dich-gia', label: 'Dịch giả theo dõi', icon: Users },
    ],
  },
  {
    id: 'community',
    label: 'Cộng đồng',
    icon: Users,
    children: [
      { to: '/dien-dan', label: 'Diễn đàn', icon: MessagesSquare },
      { to: '/nhom-dich', label: 'Nhóm dịch', icon: Users },
    ],
  },
  {
    id: 'account',
    label: 'Tài khoản',
    icon: Settings,
    children: [
      { to: '/cai-dat', label: 'Cài đặt đọc truyện', icon: Settings },
      { to: '/bao-mat', label: 'Bảo mật', icon: Shield },
    ],
  },
]

function SideLink({ to, label, icon: Icon, onClick }) {
  return (
    <NavLink to={to} end={to === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClick} title={label}>
      <Icon size={18} />
      <span className="hide-collapsed">{label}</span>
    </NavLink>
  )
}

function Sidebar({ onSearch }) {
  const { collapsed, toggleCollapsed, user, askLogin } = useStore()
  const [open, setOpen] = useState({ explore: true, library: true, community: true, account: true })
  return (
    <aside className="sidebar">
      <div className="brand-row">
        <Link to="/" className="brand" title="MOCHI">
          <b className="hide-collapsed">MOCHI</b>
          <svg className="mascot" viewBox="0 0 64 64" aria-hidden="true">
            <circle cx="32" cy="34" r="18" fill="#ffd2e6" />
            <circle cx="18" cy="20" r="8" fill="#ffd2e6" />
            <circle cx="46" cy="20" r="8" fill="#ffd2e6" />
            <circle cx="25" cy="34" r="2.4" fill="#3a2430" />
            <circle cx="39" cy="34" r="2.4" fill="#3a2430" />
            <path d="M28 40 Q32 44 36 40" fill="none" stroke="#e06a98" strokeWidth="2" />
          </svg>
        </Link>
        <button className="collapse hide-sm" type="button" onClick={toggleCollapsed} aria-label="Thu gọn thanh bên">
          <ChevronsLeft size={18} style={{ transform: collapsed ? 'rotate(180deg)' : undefined }} />
        </button>
      </div>
      <div className="side-scroll">
        <div className="quick">
          <Link to="/thong-bao" title="Thông báo"><Bell size={16} /> <span className="hide-collapsed">Thông báo</span></Link>
          {user ? (
            <Link to="/dang-truyen" title="Đăng truyện"><Upload size={16} /> <span className="hide-collapsed">Đăng truyện</span></Link>
          ) : (
            <button type="button" title="Đăng truyện" onClick={() => askLogin()}><Upload size={16} /> <span className="hide-collapsed">Đăng truyện</span></button>
          )}
        </div>
        <SideLink to="/" label="Trang chủ" icon={Home} />
        <button className="nav-btn" type="button" onClick={onSearch}>
          <Search size={18} />
          <span className="hide-collapsed">Tìm kiếm</span>
        </button>
        {groups.map((group) => {
          const Icon = group.icon
          return (
            <div key={group.id}>
              <button
                className={`nav-btn ${open[group.id] ? 'open' : ''}`}
                type="button"
                onClick={() => setOpen((s) => ({ ...s, [group.id]: !s[group.id] }))}
              >
                <Icon size={18} />
                <span className="hide-collapsed">{group.label}</span>
                <ChevronDown className="chev" size={16} />
              </button>
              {open[group.id] && (
                <div className="sub">
                  {group.children.map((item) => <SideLink key={item.to} {...item} />)}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="side-bottom">
        {user ? (
          <Link to="/bao-mat" className="user-chip" title={user.name}>
            <UserRound size={18} />
            <span className="hide-collapsed">{user.name}</span>
          </Link>
        ) : (
          <Link to="/dang-nhap" className="login-wide">
            <LogIn size={18} />
            <span className="hide-collapsed">Đăng nhập</span>
          </Link>
        )}
      </div>
    </aside>
  )
}

function SearchModal({ onClose }) {
  const catalog = useCatalog()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const results = useMemo(() => {
    const query = fold(q.trim())
    if (!query) return catalog.slice(0, 6)
    return catalog.filter((manga) => fold(`${manga.title} ${manga.alt} ${manga.blurb}`).includes(query)).slice(0, 8)
  }, [catalog, q])

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" role="dialog" aria-label="Tìm kiếm" onClick={(e) => e.stopPropagation()}>
        <div className="row" style={{ marginBottom: 10 }}>
          <input className="input" autoFocus aria-label="Tìm truyện" placeholder="Tìm truyện, tác giả, từ khóa..." value={q} onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                navigate(`/tim-kiem?q=${encodeURIComponent(q)}`)
                onClose()
              }
            }}
          />
          <button className="icon-btn" type="button" onClick={onClose} aria-label="Đóng"><X size={18} /></button>
        </div>
        {results.map((manga) => (
          <Link key={manga.id} to={`/truyen/${manga.id}`} className="search-hit" onClick={onClose}>
            <div className="hit-thumb"><Cover manga={manga} crop /></div>
            <span>
              <b>{manga.title}</b>
              <span className="meta" style={{ display: 'block' }}>{manga.alt}</span>
            </span>
          </Link>
        ))}
        {!results.length && <div className="empty">Không thấy truyện nào.</div>}
      </div>
    </div>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="foot-grid">
        <div>
          <h2>Khám phá</h2>
          <Link to="/danh-sach">Danh sách truyện</Link>
          <Link to="/tim-kiem">Tìm truyện</Link>
          <Link to="/nhom-dich">Nhóm dịch</Link>
        </div>
        <div>
          <h2>Cá nhân</h2>
          <Link to="/theo-doi/truyen">Truyện theo dõi</Link>
          <Link to="/lich-su">Lịch sử đọc</Link>
          <Link to="/album-cua-ban">Album của bạn</Link>
          <Link to="/cai-dat">Cài đặt đọc truyện</Link>
        </div>
        <div>
          <h2>Liên hệ</h2>
          <a href="mailto:hello@mochi.local">hello@mochi.local</a>
          <p>Kệ truyện lấy từ API. Tài khoản và bình luận vẫn lưu trên trình duyệt này.</p>
        </div>
        <div>
          <h2>Về MOCHI</h2>
          <p>MOCHI là trang đọc truyện tranh tiếng Việt: kệ truyện, thể loại, album, diễn đàn và trình đọc. Catalog lấy từ MongoDB.</p>
        </div>
      </div>
      <p className="legal">© 2026 MOCHI. Nội dung 18+ — người dùng cần đủ tuổi theo quy định nơi mình sinh sống.</p>
    </footer>
  )
}

export default function Shell() {
  const { toast, user, collapsed, readNotes, follows, seen, catalogStatus, catalogError, reloadCatalog, authReady } = useStore()
  const catalog = useCatalog()
  const feed = [...notices, ...chapterNotices(catalog, follows, seen)]
  const unread = feed.filter((item) => !readNotes.includes(item.id)).length
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const catalogOptional = location.pathname === '/bao-mat' || location.pathname === '/tim-kiem' || location.pathname === '/danh-sach'

  useEffect(() => {
    setMobileOpen(false)
    window.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    if (location.pathname === '/tim-kiem' || location.pathname === '/danh-sach') return
    if (catalogStatus === 'idle') reloadCatalog()
  }, [location.pathname, catalogStatus, reloadCatalog])

  useEffect(() => {
    function onKey(event) {
      const tag = document.activeElement?.tagName
      if (event.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        event.preventDefault()
        setSearchOpen(true)
      }
      if (event.key === 'Escape') setSearchOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className={`app ${collapsed ? 'is-collapsed' : ''} ${mobileOpen ? 'nav-open' : ''}`}>
      <Sidebar onSearch={() => setSearchOpen(true)} />
      {mobileOpen && <div className="scrim" onClick={() => setMobileOpen(false)} />}
      <div className="main">
        <div className="topbar">
          <button className="icon-btn menu-btn" type="button" onClick={() => setMobileOpen(true)} aria-label="Mở menu">
            <Menu size={18} />
          </button>
          <button className="icon-btn" type="button" onClick={() => setSearchOpen(true)} aria-label="Tìm kiếm">
            <Search size={18} />
          </button>
          <Link to="/thong-bao" className="icon-btn" aria-label="Thông báo" style={{ textDecoration: 'none', position: 'relative' }}>
            <Bell size={18} />
            {unread > 0 && <span className="ribbon" style={{ top: -4, left: 18 }}>{unread}</span>}
          </Link>
          <Link to="/cai-dat" className="icon-btn" aria-label="Cài đặt" style={{ textDecoration: 'none' }}>
            <Settings size={18} />
          </Link>
          <Link to={user ? '/bao-mat' : '/dang-nhap'} className="login-mini">
            <UserRound size={16} /> {!authReady ? '…' : user ? user.name : 'Đăng nhập'}
          </Link>
        </div>
        <div className="content">
          {!catalogOptional && catalogStatus === 'loading' && <div className="empty">xin hãy chờ ...</div>}
          {!catalogOptional && catalogStatus === 'error' && (
            <div className="empty">
              <p>Không tải được kệ truyện. {catalogError}</p>
              <p className="muted">Hãy chắc API đang chạy ở cổng 4000.</p>
              <button className="btn btn-pink" type="button" onClick={reloadCatalog}>Thử lại</button>
            </div>
          )}
          {(catalogOptional || catalogStatus === 'ready') && <Outlet />}
        </div>
        <Footer />
      </div>
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
      <ToastLine toast={toast} />
    </div>
  )
}

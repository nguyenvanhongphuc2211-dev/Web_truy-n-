import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowUp, MessageCircle } from 'lucide-react'
import { MangaGrid } from '../components/Bits'
import { authors, countByGroup, groups, seedPosts } from '../data'
import { useTitle } from '../hooks'
import { useCatalog, useStore } from '../store'

export function Forum() {
  useTitle('Diễn đàn')
  const store = useStore()
  const posts = [...store.posts, ...seedPosts]
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')

  function submit(event) {
    event.preventDefault()
    if (!title.trim() || !excerpt.trim()) return
    store.addPost({
      id: `post-${Date.now()}`,
      author: store.user?.name || 'Khách',
      tag: 'Thảo luận',
      title: title.trim(),
      excerpt: excerpt.trim(),
      comments: 0,
      up: 1,
      time: 'Vừa xong',
    })
    setTitle('')
    setExcerpt('')
  }

  return (
    <div>
      <div className="page-head">
        <h1>Diễn đàn</h1>
        <p className="muted">Hỏi truyện, rủ nhóm dịch, góp ý giao diện. Bài viết chỉ lưu trên trình duyệt này.</p>
      </div>
      <form className="panel" style={{ padding: 16, marginBottom: 16 }} onSubmit={submit}>
        <div className="form-grid">
          <label className="lbl full">Tiêu đề
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="lbl full">Nội dung
            <textarea className="input" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
          </label>
        </div>
        <button className="btn btn-pink" style={{ marginTop: 10 }} type="submit">Đăng bài</button>
      </form>
      <div className="note-list">
        {posts.map((post) => (
          <Link key={post.id} to={`/dien-dan/${post.id}`} className="post-card">
            <div className="post-top">
              <span className="vote"><ArrowUp size={12} /> {post.up}</span>
              <span>{post.tag} · {post.author} · {post.time}</span>
            </div>
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
            <div className="post-foot"><MessageCircle size={13} /> {(store.replies[post.id]?.length || 0) + post.comments} bình luận</div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export function PostPage() {
  const { id } = useParams()
  const store = useStore()
  const post = [...store.posts, ...seedPosts].find((item) => item.id === id)
  const [text, setText] = useState('')
  useTitle(post?.title || 'Bài viết')
  if (!post) return <div className="empty">Không thấy bài viết.</div>
  const replies = store.replies[post.id] || []
  return (
    <div>
      <p className="crumbs"><Link to="/dien-dan">Diễn đàn</Link> / {post.tag}</p>
      <article className="panel" style={{ padding: 18 }}>
        <div className="post-top"><span className="vote"><ArrowUp size={12} /> {post.up}</span><span>{post.author} · {post.time}</span></div>
        <h1 style={{ marginBottom: 8 }}>{post.title}</h1>
        <p className="prose">{post.excerpt}</p>
      </article>
      <h2>Bình luận</h2>
      <form className="row" onSubmit={(event) => { event.preventDefault(); store.addReply(post.id, text); setText('') }}>
        <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Viết trả lời..." />
        <button className="btn btn-pink" type="submit">Gửi</button>
      </form>
      {replies.map((reply) => (
        <div key={reply.id} className="comment"><b>{reply.user}</b> <span className="meta">{reply.at}</span><p>{reply.text}</p></div>
      ))}
      {!replies.length && <p className="muted">Chưa có trả lời mới.</p>}
    </div>
  )
}

export function Guilds() {
  useTitle('Nhóm dịch')
  const catalog = useCatalog()
  return (
    <div>
      <div className="page-head">
        <h1>Nhóm dịch</h1>
        <p className="muted">Các nhóm trong dữ liệu mẫu.</p>
      </div>
      <div className="guild-grid">
        {groups.map((group) => {
          const count = countByGroup(catalog, group.id)
          return (
            <Link key={group.id} to={`/nhom-dich/${group.id}`} className="guild">
              <span className="avatar-letter">{group.name[0]}</span>
              <h3>{group.name}</h3>
              <p className="muted">{group.motto}</p>
              <p className="views">{group.members} thành viên · {count} truyện</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export function GuildPage() {
  const { id } = useParams()
  const catalog = useCatalog()
  const store = useStore()
  const group = groups.find((item) => item.id === id)
  useTitle(group?.name || 'Nhóm dịch')
  if (!group) return <div className="empty">Không thấy nhóm này.</div>
  const items = catalog.filter((manga) => manga.groupId === group.id)
  const followed = store.followGroups.includes(group.id)
  return (
    <div>
      <div className="page-head">
        <p className="crumbs"><Link to="/nhom-dich">Nhóm dịch</Link></p>
        <h1>{group.name}</h1>
        <p className="muted">{group.motto} · {group.members} thành viên</p>
        <button className="btn btn-pink" type="button" onClick={() => store.toggleGroup(group.id)}>{followed ? 'Đang theo dõi' : 'Theo dõi nhóm'}</button>
      </div>
      <MangaGrid items={items} />
    </div>
  )
}

export function AuthorPage() {
  const { id } = useParams()
  const catalog = useCatalog()
  const store = useStore()
  const author = authors.find((item) => item.id === id) || { id, name: catalog.find((manga) => manga.authorId === id)?.authorName || 'Tác giả' }
  useTitle(author.name)
  const items = catalog.filter((manga) => manga.authorId === id)
  const followed = store.followAuthors.includes(id)
  return (
    <div>
      <div className="page-head">
        <h1>{author.name}</h1>
        <p className="muted">{items.length} truyện trên kệ này.</p>
        <button className="btn btn-line" type="button" onClick={() => store.toggleAuthor(id)}>{followed ? 'Đang theo dõi' : 'Theo dõi tác giả'}</button>
      </div>
      <MangaGrid items={items} />
    </div>
  )
}

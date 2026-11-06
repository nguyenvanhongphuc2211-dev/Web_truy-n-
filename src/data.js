import { posterMangas } from './posters.js'
import { storyOnePatch } from './stories/truyen1.js'
import { generatedAuthors, generatedGenres, generatedStories } from './stories/generated.js'

const BASE_GENRES = [
  { slug: 'mat-the', name: 'Mạt thế' },
  { slug: 'khong-gian', name: 'Không gian' },
  { slug: 'sinh-ton', name: 'Sinh tồn' },
  { slug: 'khoa-huyen', name: 'Khoa huyễn' },
]

export const genres = [...BASE_GENRES, ...generatedGenres].filter(
  (genre, index, list) => list.findIndex((item) => item.slug === genre.slug) === index,
)

export const authors = [
  ...generatedAuthors,
  { id: 'chua-ro', name: 'đang cập nhật' },
  { id: 'bat-thi', name: 'Bất Thị Đại Ba Ti Cơ' },
  { id: 'lan-anh', name: 'Lan Anh' },
  { id: 'mio-k', name: 'Mio K.' },
  { id: 'haru-nguyen', name: 'Haru Nguyễn' },
  { id: 'sora-lee', name: 'Sora Lee' },
  { id: 'yuki-tran', name: 'Yuki Trần' },
  { id: 'kenji-pham', name: 'Kenji Phạm' },
  { id: 'nao-vo', name: 'Nao Võ' },
  { id: 'rin-dao', name: 'Rin Đào' },
]

export const groups = [
  { id: 'com-nguoi', name: 'Cơm Nguội Novel', members: 4, motto: 'Bản Việt trên bìa truyện.' },
  { id: 'may-hong', name: 'Mây Hồng', members: 12, motto: 'Dịch chậm mà ngọt.' },
  { id: 'dem-khuya', name: 'Đêm Khuya Scan', members: 8, motto: 'Ra chương trước khi ngủ.' },
  { id: 'ban-cong', name: 'Ban Công Team', members: 5, motto: 'Truyện mưa và đèn vàng.' },
  { id: 'pho-nho', name: 'Phố Nhỏ', members: 15, motto: 'Manhwa đời thường.' },
  { id: 'khong-ngu', name: 'Không Ngủ', members: 3, motto: 'Oneshot cuối tuần.' },
  { id: 'doc-lap', name: 'Độc lập', members: 1, motto: 'Đăng một mình, không theo nhóm.' },
]

const CHAPTER_TITLES = [
  'Người bên kia tấm kính',
  'Chìa khóa dự phòng',
  'Đèn bật lúc một giờ',
  'Tin nhắn chưa gửi',
  'Buổi sáng không mưa',
  'Hộp cơm hai người',
  'Cuối tuần ở lại',
  'Điều chưa nói',
  'Phòng chờ',
  'Bản thảo dở',
]

const RAW = posterMangas

export function withChapters(manga) {
  if (manga.chapters?.length) return manga
  const count = manga.chapterCount || 1
  const chapters = []
  for (let n = count; n >= 1; n -= 1) {
    chapters.push({
      id: n,
      title: `Chương ${n}: ${CHAPTER_TITLES[(n + manga.title.length) % CHAPTER_TITLES.length]}`,
      time: n === count ? manga.updated : `${count - n + 2} ngày trước`,
      likes: 0,
      views: 0,
    })
  }
  return { ...manga, chapters }
}

const storyPatches = new Map(generatedStories.map((story) => [story.id, story]))
storyPatches.set(storyOnePatch.id, storyOnePatch)

export const mangas = RAW.map(withChapters).map((manga) => {
  const patch = storyPatches.get(manga.id)
  return patch ? { ...manga, ...patch } : manga
})

const seedThreads = [
  {
    id: 'p1',
    author: 'Cú đêm',
    tag: 'Tìm truyện',
    title: 'Tìm truyện mưa và ban công',
    excerpt: 'Mình nhớ một bộ hai người nói chuyện qua ban công mùa mưa, nhịp rất chậm. Ai còn link bản dịch thì cho mình xin.',
    up: 18,
    time: '20 giờ trước',
    replies: [
      { id: 'p1-r1', user: 'Lan', text: 'Hình như là “Mưa trên ban công” của nhóm Mây Hồng. Chương 12 đúng cảnh hai người nói chuyện ngoài mưa.', at: '18 giờ trước' },
      { id: 'p1-r2', user: 'Cú đêm', text: 'Đúng tên rồi. Bản đó còn đủ chương không?', at: '16 giờ trước' },
      { id: 'p1-r3', user: 'Minh', text: 'Nhóm đăng tới chương 18. Nhịp chậm, đúng bộ bạn mô tả.', at: '14 giờ trước' },
      { id: 'p1-r4', user: 'Hana', text: 'Mình để trong album “đọc một mạch”. Vào trang nhóm Mây Hồng là thấy.', at: '11 giờ trước' },
    ],
  },
  {
    id: 'p2',
    author: 'NTRD',
    tag: 'Nhóm dịch',
    title: 'Nhận góp ý truyện ngắn cuối tuần',
    excerpt: 'Nhóm đang trống lịch thứ Bảy. Ai có bộ đời thường, nhân vật trưởng thành, cứ để tên ở dưới. Ưu tiên bản đã xong.',
    up: 11,
    time: '1 ngày trước',
    replies: [
      { id: 'p2-r1', user: 'Bobby', text: '“Hợp đồng 30 ngày” đã xong, đời thường, nhân vật ngoài hai mươi.', at: '22 giờ trước' },
      { id: 'p2-r2', user: 'Tiểu Bạch', text: '“Phố nhỏ cuối tuần”, 6 chương, bản đầy đủ.', at: '20 giờ trước' },
      { id: 'p2-r3', user: 'Vũ Lâm', text: 'Nên lấy bộ dưới 20 chương thì nhóm kịp ra thứ Bảy.', at: '19 giờ trước' },
      { id: 'p2-r4', user: 'NTRD', text: 'Ghi nhận. Để tên bộ và số chương là được.', at: '18 giờ trước' },
      { id: 'p2-r5', user: 'Cú đêm', text: '“Đèn vàng sau mưa”, oneshot, đã hoàn.', at: '15 giờ trước' },
      { id: 'p2-r6', user: 'Hana', text: 'Mình có bản tiếng Việt đã soát. Gửi kèm ở bài tìm truyện.', at: '12 giờ trước' },
      { id: 'p2-r7', user: 'An', text: 'Thứ Bảy rảnh, mình phụ soát chính tả được.', at: '9 giờ trước' },
    ],
  },
  {
    id: 'p3',
    author: 'Tiểu Bạch',
    tag: 'Góp ý',
    title: 'Nên thêm nút đọc tiếp ngay trên thẻ truyện',
    excerpt: 'Lịch sử đọc có rồi nhưng về trang chủ vẫn phải mở lại trang chi tiết. Một nút nhỏ sẽ đỡ hơn.',
    up: 22,
    time: '2 ngày trước',
    replies: [
      { id: 'p3-r1', user: 'Bobby', text: 'Đồng ý. Về trang chủ là bấm đọc tiếp luôn.', at: '1 ngày trước' },
      { id: 'p3-r2', user: 'Vũ Lâm', text: 'Nút nên hiện số chương đang đọc, không chỉ tên truyện.', at: '1 ngày trước' },
      { id: 'p3-r3', user: 'Tiểu Bạch', text: 'Đặt cạnh bìa. Đừng giấu trong menu.', at: '22 giờ trước' },
    ],
  },
  {
    id: 'p4',
    author: 'Bobby',
    tag: 'Thảo luận',
    title: 'Manhwa hợp đồng giả vờ hẹn hò còn bộ nào ngon?',
    excerpt: 'Vừa đọc xong một bộ điều khoản 30 ngày. Cần bản cùng chất, nhân vật ngoài hai mươi, bớt hiểu lầm vô cớ.',
    up: 15,
    time: '2 ngày trước',
    replies: [
      { id: 'p4-r1', user: 'Hana', text: '“Điều khoản ba mươi ngày”, hết ở chương 24.', at: '2 ngày trước' },
      { id: 'p4-r2', user: 'Cú đêm', text: '“Hẹn hò theo hợp đồng” cùng chất, ít hiểu lầm.', at: '2 ngày trước' },
      { id: 'p4-r3', user: 'Minh', text: '“Bạn trai thuê”, 16 chương, nhân vật 24 tuổi.', at: '1 ngày trước' },
      { id: 'p4-r4', user: 'Lan', text: 'Tránh mấy bộ học đường. Bộ đó hiểu lầm suốt.', at: '1 ngày trước' },
      { id: 'p4-r5', user: 'NTRD', text: '“Phụ lục tình cảm” đã hoàn, nhịp chậm.', at: '1 ngày trước' },
      { id: 'p4-r6', user: 'Vũ Lâm', text: 'Mình xếp vào album cuối tuần nếu bạn cần danh sách.', at: '22 giờ trước' },
      { id: 'p4-r7', user: 'Tiểu Bạch', text: '“Sếp giả vờ” hơi ồn, không hợp nếu bạn muốn nhẹ.', at: '18 giờ trước' },
      { id: 'p4-r8', user: 'Bobby', text: 'Cảm ơn. Mình đọc “Điều khoản” trước.', at: '14 giờ trước' },
      { id: 'p4-r9', user: 'An', text: 'Chương 8 của “Phụ lục” viết lại hợp đồng, đoạn đó đáng đọc.', at: '10 giờ trước' },
    ],
  },
  {
    id: 'p5',
    author: 'Vũ Lâm',
    tag: 'Cộng đồng',
    title: 'Ai lập album “đọc một mạch” chưa?',
    excerpt: 'Mình muốn một danh sách dưới 30 chương để đọc trong cuối tuần. Có thể lấy từ truyện đã hoàn thành.',
    up: 6,
    time: '3 ngày trước',
    replies: [
      { id: 'p5-r1', user: 'Hana', text: 'Album “Đọc một mạch” đang có 4 bộ, bộ nào cũng dưới 30 chương.', at: '2 ngày trước' },
      { id: 'p5-r2', user: 'Bobby', text: 'Thêm “Đèn vàng sau mưa”, 8 chương, một tối là xong.', at: '2 ngày trước' },
    ],
  },
  {
    id: 'p6',
    author: 'Hana',
    tag: 'Dịch thuật',
    title: 'Bàn cách đặt tiêu đề chương cho sát lời thoại',
    excerpt: 'Đặt tên chương theo câu nhân vật nói thường dễ nhớ hơn tóm tắt cốt. Mọi người đang đặt theo kiểu nào?',
    up: 13,
    time: '4 ngày trước',
    replies: [
      { id: 'p6-r1', user: 'Cú đêm', text: 'Mình lấy đúng câu nhân vật nói ở cuối trang.', at: '3 ngày trước' },
      { id: 'p6-r2', user: 'NTRD', text: 'Tóm tắt cốt dễ tìm lại, nhưng câu thoại dễ nhớ hơn.', at: '3 ngày trước' },
      { id: 'p6-r3', user: 'Tiểu Bạch', text: 'Giữ khoảng tám chữ. Dài hơn sẽ bị cắt trên thẻ chương.', at: '2 ngày trước' },
      { id: 'p6-r4', user: 'Vũ Lâm', text: 'Chương hành động thì tóm tắt. Chương thoại thì lấy câu nói.', at: '2 ngày trước' },
      { id: 'p6-r5', user: 'Hana', text: 'Nhóm mình thử cả hai. Câu thoại được bấm nhiều hơn.', at: '1 ngày trước' },
    ],
  },
]

export const seedReplies = Object.fromEntries(seedThreads.map((thread) => [thread.id, thread.replies]))

export const seedPosts = seedThreads.map(({ replies, ...post }) => ({
  ...post,
  comments: replies.length,
}))

export function forumReplies(postId, userReplies = {}) {
  return [...(seedReplies[postId] || []), ...(userReplies[postId] || [])]
}

export const notices = [
  {
    id: 'n4',
    title: 'Chào mừng đến MOCHI',
    body: 'Kệ truyện lấy từ máy chủ. Đăng nhập, lưu truyện và bình luận vẫn nằm trên trình duyệt của bạn.',
    time: 'Hôm nay',
    href: '/cai-dat',
  },
]

export const seedComments = {}

export function authorLabel(name) {
  return name === 'Chưa ghi trên bìa' ? 'đang cập nhật' : name
}

export function authorOf(manga, list = authors) {
  const found = list.find((author) => author.id === manga.authorId)
  if (found) return { ...found, name: authorLabel(found.name) }
  return {
    id: manga.authorId || 'an-danh',
    name: authorLabel(manga.authorName) || 'Ẩn danh',
    works: 0,
  }
}

export function groupOf(manga, list = groups) {
  return (
    list.find((g) => g.id === manga.groupId) || {
      id: manga.groupId || 'doc-lap',
      name: manga.groupName || 'Độc lập',
      members: 1,
      motto: 'Tự đăng.',
    }
  )
}

export function genreName(slug, list = genres) {
  return list.find((g) => g.slug === slug)?.name || slug
}

export function genresWithCounts(list, genreList = genres) {
  return genreList.map((genre) => ({
    ...genre,
    count: list.filter((manga) => manga.genres?.includes(genre.slug)).length,
  }))
}

export function countByAuthor(list, authorId) {
  return list.filter((manga) => manga.authorId === authorId).length
}

export function countByGroup(list, groupId) {
  return list.filter((manga) => manga.groupId === groupId).length
}

export function fold(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

export function compact(n) {
  const value = Number(n) || 0
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace('.0', '')}M`
  if (value >= 1000) {
    const v = value / 1000
    return `${(v >= 10 ? Math.round(v) : Number(v.toFixed(1))).toString()}K`
  }
  return String(value)
}

export function newestChapters(manga, count = 2) {
  return [...(manga?.chapters || [])].sort((a, b) => b.id - a.id).slice(0, count)
}

export function chapterViewCount(_manga, chapter) {
  return Number(chapter?.views) || 0
}

export function communityScore(manga) {
  const count = Number(manga?.ratingCount) || 0
  const score = Number(manga?.rating)
  if (!count || !Number.isFinite(score)) return null
  return Math.round(score * 10) / 10
}

export const storyStatuses = [
  { id: 'chua-bat-dau', label: 'Chưa bắt đầu', values: ['Chưa bắt đầu'] },
  { id: 'dang-lam', label: 'Đang làm', values: ['Đang làm', 'Đang ra'] },
  { id: 'hoan', label: 'Hoãn', values: ['Hoãn'] },
  { id: 'da-dung', label: 'Đã dừng', values: ['Đã dừng', 'Tạm dừng'] },
  { id: 'hoan-thanh', label: 'Hoàn thành', values: ['Hoàn thành'] },
]

export function storyStatus(manga) {
  const raw = manga?.status || ''
  return storyStatuses.find((item) => item.values.includes(raw)) || { id: 'dang-lam', label: raw || 'Đang làm' }
}

export function isTextNovel(manga) {
  if (manga?.kind === 'Tiểu thuyết') return true
  return (manga?.chapters || []).some((chapter) => chapter.paragraphs?.length)
}

export function updatedRank(text = '') {
  const value = String(text)
  const hour = value.match(/(\d+)\s*giờ/)
  if (hour) return Number(hour[1])
  const day = value.match(/(\d+)\s*ngày/)
  if (day) return 24 * Number(day[1])
  if (/hôm nay|vừa/i.test(value)) return 0
  return 900
}

export function addedRank(manga) {
  const match = String(manga?.id || '').match(/(\d{10,})/)
  return match ? Number(match[1]) : 0
}

export function chapterNotices(catalog, follows, seen) {
  const notes = []
  for (const id of follows || []) {
    const manga = catalog.find((item) => item.id === id)
    if (!manga) continue
    const latest = newestChapters(manga, 1)[0]
    if (!latest) continue
    const seenIds = (seen || [])
      .filter((key) => key.startsWith(`${id}:`))
      .map((key) => Number(key.split(':')[1]))
      .filter((value) => Number.isFinite(value))
    const known = seenIds.length ? Math.max(...seenIds) : 0
    if (latest.id <= known) continue
    notes.push({
      id: `new-${id}-${latest.id}`,
      title: `Chương mới · ${manga.title}`,
      body: `${latest.title} vừa có trên bộ bạn theo dõi.`,
      time: latest.time || 'Mới',
      href: `/doc/${id}/${latest.id}`,
    })
  }
  return notes
}

export function readerLevel(name, comments, historyLength) {
  const written = Object.values(comments || {}).flat().filter((item) => item.user === name).length
  const score = written + (historyLength || 0)
  if (score >= 20) return 'Thủ thư'
  if (score >= 8) return 'Đọc giả'
  if (score >= 2) return 'Thành viên'
  return 'Tân thủ'
}

export function hotScore(manga, period) {
  if (period === 'day') return manga.likes + manga.follows
  if (period === 'week') return manga.views * 0.3 + manga.likes * 8
  if (period === 'month') return manga.views
  return manga.views + manga.likes * 20 + manga.follows * 10
}

export function scriptFor(manga, chapter) {
  if (chapter.lines?.length) return chapter.lines
  const a = manga.lead || 'Bạn'
  const b = manga.partner || 'Người ấy'
  const pool = [
    { who: 'narr', text: `${manga.title} — ${chapter.title}.` },
    { who: 'narr', text: manga.blurb },
    {
      who: a,
      text: chapter.id % 2 === 0 ? 'Cậu còn thức không? Mình vừa pha thừa một tách.' : 'Đèn bên ấy tắt từ lúc nào thế?',
    },
    { who: b, text: 'Còn thức. Tưởng cậu ngủ rồi.' },
    { who: a, text: 'Ngủ không được. Trong đầu toàn câu chưa kịp nói.' },
    { who: b, text: 'Vậy nói bây giờ. Mình nghe.' },
    { who: 'narr', text: 'Gió lùa qua khe cửa. Hai tách nước nguội dần.' },
    { who: a, text: manga.lineA },
    { who: b, text: manga.lineB },
    { who: 'narr', text: 'Ngoài cửa sổ, thành phố vẫn sáng như một bản thảo bỏ dở.' },
    { who: a, text: `Chương ${chapter.id} kết ở đây cũng được. Nhưng mình chưa muốn dừng.` },
    { who: b, text: 'Vậy đừng dừng. Gõ cửa tiếp là được.' },
  ]
  const start = (chapter.id * 3) % 6
  return pool.slice(start).concat(pool.slice(0, start))
}

export function pagesFor(manga, chapter) {
  const lines = scriptFor(manga, chapter)
  const pages = []
  for (let i = 0; i < lines.length; i += 4) pages.push(lines.slice(i, i + 4))
  return pages
}

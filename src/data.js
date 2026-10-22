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
  { id: 'chua-ro', name: 'Chưa ghi trên bìa' },
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
  const count = manga.chapterCount || 1
  const chapters = []
  for (let n = count; n >= 1; n -= 1) {
    chapters.push({
      id: n,
      title: `Chương ${n}: ${CHAPTER_TITLES[(n + manga.title.length) % CHAPTER_TITLES.length]}`,
      time: n === count ? manga.updated : `${count - n + 2} ngày trước`,
      likes: 12 + ((n * 17 + (manga.views || 0)) % 90),
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

export const communityAlbums = [
  {
    id: 'mua',
    name: 'Đọc khi trời mưa',
    owner: 'Lan',
    desc: 'Truyện chậm, nhiều khoảng lặng và cửa sổ.',
    reactions: 128,
    mangaIds: [],
  },
  {
    id: 'ngot',
    name: 'Ngọt cuối tuần',
    owner: 'Mochi',
    desc: 'Hài nhẹ, có bếp và có người nấu thừa một suất.',
    reactions: 96,
    mangaIds: [],
  },
  {
    id: 'dem',
    name: 'Đêm văn phòng',
    owner: 'K.',
    desc: 'Đèn bàn, deadline, và những câu nói sau mười một giờ.',
    reactions: 74,
    mangaIds: [],
  },
  {
    id: 'dao',
    name: 'Đi một vòng rồi về',
    owner: 'Haru',
    desc: 'Fantasy dịu, không cần bảng stat.',
    reactions: 61,
    mangaIds: [],
  },
  {
    id: 'pho',
    name: 'Phố chưa tắt đèn',
    owner: 'Rin',
    desc: 'Thành phố, biển hiệu, phòng trọ và tiệm mở khuya.',
    reactions: 83,
    mangaIds: [],
  },
]

export const seedPosts = [
  {
    id: 'p1',
    author: 'Cú đêm',
    tag: 'Tìm truyện',
    title: 'Tìm truyện mưa và ban công',
    excerpt: 'Mình nhớ một bộ hai người nói chuyện qua ban công mùa mưa, nhịp rất chậm. Ai còn link bản dịch thì cho mình xin.',
    comments: 4,
    up: 18,
    time: '20 giờ trước',
  },
  {
    id: 'p2',
    author: 'NTRD',
    tag: 'Nhóm dịch',
    title: 'Nhận góp ý truyện ngắn cuối tuần',
    excerpt: 'Nhóm đang trống lịch thứ Bảy. Ai có bộ đời thường, nhân vật trưởng thành, cứ để tên ở dưới. Ưu tiên bản đã xong.',
    comments: 7,
    up: 11,
    time: '1 ngày trước',
  },
  {
    id: 'p3',
    author: 'Tiểu Bạch',
    tag: 'Góp ý',
    title: 'Nên thêm nút đọc tiếp ngay trên thẻ truyện',
    excerpt: 'Lịch sử đọc có rồi nhưng về trang chủ vẫn phải mở lại trang chi tiết. Một nút nhỏ sẽ đỡ hơn.',
    comments: 3,
    up: 22,
    time: '2 ngày trước',
  },
  {
    id: 'p4',
    author: 'Bobby',
    tag: 'Thảo luận',
    title: 'Manhwa hợp đồng giả vờ hẹn hò còn bộ nào ngon?',
    excerpt: 'Vừa đọc xong một bộ điều khoản 30 ngày. Cần bản cùng chất, nhân vật ngoài hai mươi, bớt hiểu lầm vô cớ.',
    comments: 9,
    up: 15,
    time: '2 ngày trước',
  },
  {
    id: 'p5',
    author: 'Vũ Lâm',
    tag: 'Cộng đồng',
    title: 'Ai lập album “đọc một mạch” chưa?',
    excerpt: 'Mình muốn một danh sách dưới 30 chương để đọc trong cuối tuần. Có thể lấy từ truyện đã hoàn thành.',
    comments: 2,
    up: 6,
    time: '3 ngày trước',
  },
  {
    id: 'p6',
    author: 'Hana',
    tag: 'Dịch thuật',
    title: 'Bàn cách đặt tiêu đề chương cho sát lời thoại',
    excerpt: 'Đặt tên chương theo câu nhân vật nói thường dễ nhớ hơn tóm tắt cốt. Mọi người đang đặt theo kiểu nào?',
    comments: 5,
    up: 13,
    time: '4 ngày trước',
  },
]

export const notices = [
  {
    id: 'n4',
    title: 'Chào mừng đến MOCHI',
    body: 'Đây là bản frontend. Dữ liệu lưu trên trình duyệt của bạn.',
    time: 'Hôm nay',
    href: '/cai-dat',
  },
]

export const seedComments = {}

export function authorOf(manga) {
  return (
    authors.find((a) => a.id === manga.authorId) || {
      id: manga.authorId || 'an-danh',
      name: manga.authorName || 'Ẩn danh',
      works: 0,
    }
  )
}

export function groupOf(manga) {
  return (
    groups.find((g) => g.id === manga.groupId) || {
      id: manga.groupId || 'doc-lap',
      name: manga.groupName || 'Độc lập',
      members: 1,
      motto: 'Tự đăng.',
    }
  )
}

export function genreName(slug) {
  return genres.find((g) => g.slug === slug)?.name || slug
}

export function genresWithCounts(list) {
  return genres.map((genre) => ({
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

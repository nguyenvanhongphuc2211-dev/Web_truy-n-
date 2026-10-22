import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const known = [
  {
    id: 'poster_1792250674219',
    title: 'Vô Tình Xông Vào Thiên Gia? Mỗi Giây Ta Có Một Vạn Linh Thạch',
    alt: '',
    author: 'Hoàng Kim Bách Hương Quả',
    publisher: 'Cơm Nguội Novel',
    tags: ['Võ hiệp', 'Tiên hiệp', 'Tu chân'],
    lead: 'chàng trai áo trắng đang đón linh thạch',
    partner: 'vị tiên râu trắng trên mây',
    setting: 'cổng trời lơ lửng giữa mây, linh thạch xanh bay quanh tay',
    hook: 'mỗi giây có thêm một vạn linh thạch',
  },
  {
    id: 'poster_1792133552535',
    title: 'Học Tỷ Của Ta Biết Ma Pháp',
    alt: '',
    author: 'Vinh Tiểu Vinh',
    publisher: 'Cơm Nguội Novel',
    tags: ['Ma pháp', 'Học viện'],
    lead: 'chàng trai cầm sách phát sáng',
    partner: 'cô gái tóc tím đang vẽ vòng tròn phép',
    setting: 'thư viện học viện, kệ sách cao và thành phố lâu đài ngoài cửa sổ',
    hook: 'học tỷ biết dùng ma pháp',
  },
  {
    id: 'poster_1792120830513',
    title: 'Tiểu Khu Cầu Sinh: Mỗi Người Mỗi Ngày Cho Ta Một Chiếc Bánh Mì',
    alt: '',
    author: '',
    publisher: 'Cơm Nguội Novel',
    tags: ['Mạt thế', 'Cầu sinh'],
    lead: 'chàng trai áo đen ngồi trên nóc nhà, tay cầm bánh mì',
    partner: 'cô gái tóc đen đứng trên sân thượng',
    setting: 'nóc chung cư giữa thành phố đổ nát, quái vật dưới đường và mặt trăng đỏ',
    hook: 'mỗi người mỗi ngày đưa một chiếc bánh mì',
  },
  {
    id: 'poster_1792118285847',
    title: 'Tụ Bảo Tiên Bồn',
    alt: '聚宝仙盆',
    author: 'Hương Quả Vị Nãi Trà',
    publisher: 'Cơm Nguội Novel',
    tags: ['Tiên hiệp', 'Tu chân'],
    lead: 'chàng trai áo lam đang thả vật phẩm vào chậu',
    partner: '',
    setting: 'đỉnh núi giữa biển mây, chậu đồng đầy bảo vật và các tông môn trên không',
    hook: 'chậu tiên gom bảo vật rồi sinh thêm',
  },
  {
    id: 'poster_1792073223607',
    title: 'Trò Chơi Ghép Hình Tận Thế',
    alt: '',
    author: 'Canh Tòng Tâm',
    publisher: 'Cơm Nguội Novel',
    tags: ['Mạt thế', 'Trò chơi'],
    lead: 'chàng trai ba lô đứng nhìn tòa tháp',
    partner: '',
    setting: 'thành phố ngập nước, tháp khổng lồ trên trời và khung ghép hình hiện quanh quái vật',
    hook: 'quái vật và vật phẩm hiện thành mảnh ghép',
  },
  {
    id: 'poster_1791794800191',
    title: 'Tiệm Quan Tài Số 44',
    alt: '',
    author: 'Trùng Hạ Nguyệt Bán',
    publisher: 'Cơm Nguội Novel',
    tags: ['Linh dị'],
    lead: 'người đứng trong cửa tiệm',
    partner: '',
    setting: 'tiệm quan tài đèn đỏ, xích sắt, bùa chú và vũng đỏ trên sàn gỗ',
    hook: 'tiệm quan tài số 44 mở cửa sau giờ khuya',
  },
]

const GENRE_RULES = [
  ['mat-the', 'Mạt thế', /mạt thế|tận thế|cầu sinh|tận thế|sinh tồn/i],
  ['tien-hiep', 'Tiên hiệp', /tiên hiệp|tu chân|võ hiệp|huyền huyễn|linh thạch/i],
  ['ma-phap', 'Ma pháp', /ma pháp|phép thuật|học viện/i],
  ['he-thong', 'Hệ thống', /hệ thống|trò chơi|ghép hình/i],
  ['linh-di', 'Linh dị', /linh dị|kinh dị|quan tài|bùa/i],
  ['do-thi', 'Đô thị', /đô thị|hiện đại/i],
  ['khong-gian', 'Không gian', /không gian/i],
  ['ngon-tinh', 'Ngôn tình', /ngôn tình|học tỷ/i],
  ['xuyen-khong', 'Xuyên không', /xuyên không|trọng sinh/i],
  ['khoa-huyen', 'Khoa huyễn', /khoa huyễn|tương lai/i],
]

function hash(text) {
  let h = 2166136261
  for (const ch of text) {
    h ^= ch.codePointAt(0)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function pick(id, salt, list) {
  return list[hash(`${id}:${salt}`) % list.length]
}

function slug(name) {
  const base = name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return base ? `tg-${base}` : ''
}

function speaker(visual, fallback) {
  const text = (visual || '').toLowerCase()
  if (!text) return fallback
  if (/cô gái|học tỷ|nữ|thiếu nữ/.test(text)) return 'Cô gái'
  if (/tiên|lão|râu/.test(text)) return 'Vị tiền bối'
  if (/chàng trai|nam|áo/.test(text)) return 'Chàng trai'
  return fallback
}

function genresFor(meta) {
  const blob = `${meta.title} ${(meta.tags || []).join(' ')} ${meta.hook || ''}`
  const found = GENRE_RULES.filter(([, , rule]) => rule.test(blob)).map(([slug, name]) => ({ slug, name }))
  return found.length ? found : [{ slug: 'tien-hiep', name: 'Tiên hiệp' }]
}

function vietnamese(value) {
  if (!value || /[A-Za-z]{4}/.test(value)) return ''
  return value
}

function paragraphs(meta) {
  const lead = speaker(meta.lead, 'Chàng trai')
  const partner = speaker(meta.partner, '')
  const other = partner || 'Người đứng gần'
  const setting = vietnamese(meta.setting) || 'một nơi vừa lạ vừa quá yên'
  const hook = vietnamese(meta.hook) || meta.title
  const id = meta.id
  const open = pick(id, 'open', [
    `${lead} dừng một nhịp. ${setting.charAt(0).toUpperCase()}${setting.slice(1)}.`,
    `Gió đổi hướng trước khi ${lead.toLowerCase()} kịp hiểu mình đang đứng đâu. ${setting.charAt(0).toUpperCase()}${setting.slice(1)}.`,
    `${lead} không nhớ mình đã bước qua cửa từ lúc nào. Trước mắt, ${setting}.`,
  ])
  const rule = pick(id, 'rule', [
    `Trong đầu chỉ còn một câu, rõ đến mức không thể coi là ảo giác: ${hook}.`,
    `Không có bảng thông báo. Chỉ có một sự thật đặt xuống rất khẽ: ${hook}.`,
    `${lead} thử đếm. Câu ấy vẫn đúng. ${hook.charAt(0).toUpperCase()}${hook.slice(1)}.`,
  ])
  const say = pick(id, 'say', [
    `“Mình không xin việc này.”`,
    `“Khoan đã. Nói lại lần nữa.”`,
    `“Nếu đây là nhầm cửa, thì cửa ấy mở hơi kỹ.”`,
  ])
  const watch = partner
    ? pick(id, 'watch', [
      `${partner} nhìn ${lead.toLowerCase()}, chưa vội cười.`,
      `${partner} không hỏi tên. Người ấy chỉ nhìn thứ vừa xuất hiện.`,
      `“Ngươi thấy rồi thì đừng giả vờ chưa thấy,” ${partner.toLowerCase()} nói.`,
    ])
    : pick(id, 'watch', [
      `Xung quanh chưa có ai nhận ra điều ấy.`,
      `Một lúc lâu không ai bước tới. Yên đến mức nghe được cả nhịp thở của mình.`,
      `Phía xa có tiếng người, nhưng chưa ai nhìn về hướng này.`,
    ])
  const keep = pick(id, 'keep', [
    `${lead} giấu tay vào tay áo. Chưa phải lúc khoe.`,
    `Nhận quá sớm là mời người khác đến hỏi. ${lead} chọn im.`,
    `“Đêm nay chỉ cần sống qua đã. Phần còn lại để mai tính.”`,
  ])
  const stay = pick(id, 'stay', [
    `${lead} quyết định ở lại đến sáng. Quay ra bây giờ không còn đường cũ.`,
    `Cửa phía sau đã khép. ${lead} hít một hơi và bước tiếp.`,
    `“Được. Mình ở. Nhưng mình không nợ ai một lời giải thích.”`,
  ])
  return [
    [
      open,
      rule,
      say,
      watch,
      `${meta.title} — câu ấy không viết trên không trung, nhưng ${lead.toLowerCase()} vẫn nghe như có người vừa đọc xong.`,
      keep,
    ],
    [
      pick(id, 'c2a', [
        `Lần thứ hai, ${hook} vẫn xảy ra đúng như lần đầu.`,
        `${lead} thử với một thứ nhỏ. Kết quả không đổi: ${hook}.`,
        `Không cần ai chứng kiến. ${lead} tự kiểm lại, chậm, và thấy ${hook}.`,
      ]),
      pick(id, 'c2b', [
        `“Không phải may,” ${lead.toLowerCase()} nói nhỏ.`,
        `“Một lần là ngẫu nhiên. Hai lần thì là luật.”`,
        `Tay vẫn run, nhưng mắt đã hết hoài nghi.`,
      ]),
      `${setting.charAt(0).toUpperCase()}${setting.slice(1)}. Ở giữa cảnh ấy, luật mới này nhỏ hơn mọi thứ xung quanh, và cũng nguy hiểm hơn.`,
      partner
        ? `“Ngươi định giấu đến bao giờ?” ${other} hỏi.`
        : `Chưa có ai hỏi, nên ${lead.toLowerCase()} cũng chưa phải trả lời.`,
      pick(id, 'c2c', [
        `${lead} không trả lời hết. Biết luật là một chuyện. Để người khác biết lại là chuyện khác.`,
        `“Tôi chỉ mới thử. Chưa đủ để khoe.”`,
        `${lead} cất thứ vừa dùng vào chỗ chỉ mình với tới.`,
      ]),
      `Đêm còn dài. ${lead} ghi lại giờ, số lượng, và cảm giác trong lồng ngực khi luật ấy chạy.`,
    ],
    [
      partner
        ? `${other} đứng gần hơn một bước. Không phải để cướp. Là để nhìn cho rõ.`
        : `Một bóng người dừng ở rìa ánh sáng, chưa bước vào hẳn.`,
      pick(id, 'c3a', [
        `“Tôi không cần đồng minh,” ${lead.toLowerCase()} nói. “Tôi cần một người đừng hô to.”`,
        `“Nếu cậu đã thấy, thì đừng kể ở chỗ đông.”`,
        `“Ngồi xuống. Đứng đó nom như sắp gây chuyện.”`,
      ]),
      pick(id, 'c3b', [
        `${other} im một lát. “Được. Một đêm. Qua sáng thì mỗi người một ngả.”`,
        `“Ta không tin ngươi. Nhưng ta tin cái lạnh ngoài kia còn tệ hơn.”`,
        `${other} gật, rất ngắn. Đó là lời hứa duy nhất đêm ấy có được.`,
      ]),
      `${setting.charAt(0).toUpperCase()}${setting.slice(1)}. Hai người cùng nghe một tiếng động ở phía không nên có tiếng động.`,
      `${lead} đưa mắt ra hiệu đừng lại gần nguồn sáng.`,
      `Họ chưa là bạn. Họ chỉ cùng cần sáng mai vẫn còn đứng được.`,
    ],
    [
      pick(id, 'c4a', [
        `Rắc rối đến nhanh hơn dự đoán. Có người nhìn quá lâu.`,
        `Một tiếng gọi vang lên, không thân thiện. ${lead} không quay lại ngay.`,
        `Luật ấy vừa chạy thêm một vòng thì có bóng người cắt ngang.`,
      ]),
      `“Khoan. Cái đó ở đâu ra?”`,
      `${lead} bước sang một bên, che phần vừa xuất hiện. ${hook.charAt(0).toUpperCase()}${hook.slice(1)} — nếu câu này lọt ra ngoài, đêm nay không còn yên.`,
      partner
        ? `${other} đứng chắn nửa cửa. “Nhầm phòng. Đi chỗ khác.”`
        : `${lead} nói, giọng đều: “Nhầm chỗ. Tôi không bán gì cả.”`,
      pick(id, 'c4b', [
        `Người kia chần chừ, rồi bỏ đi. Tiếng bước nhỏ dần.`,
        `Chưa đánh nhau. Chỉ suýt. ${lead} thấy tay mình đã nắm chặt.`,
        `Đủ gần để hiểu: lần sau sẽ không chỉ là một câu hỏi.`,
      ]),
      `${lead} thở ra. “Từ giờ không thử giữa chỗ có mắt.”`,
    ],
    [
      `Sáng chưa tới, nhưng hướng đi thì đã rõ.`,
      pick(id, 'c5a', [
        `${lead} nhìn lại ${setting}. Chỗ này nguy, nhưng còn chỗ để thở.`,
        `Ra ngoài lúc này là mất dấu luật vừa học được. ${lead} không muốn mất.`,
        `Trên bàn, ${lead.toLowerCase()} để lại một thứ nhỏ làm mốc. Sáng mai nếu nó đổi, luật ấy vẫn còn.`,
      ]),
      stay,
      partner
        ? `${other} không ngăn. “Ngủ đi. Canh cửa để ta.”`
        : `Không ai canh cùng. ${lead} tự kéo ghế chặn cửa.`,
      pick(id, 'c5b', [
        `“Sống qua đêm đã. Sáng mai hãy tính đường dài,” ${lead.toLowerCase()} nghĩ.`,
        `${lead} nhắm mắt một lúc, không ngủ hẳn. Tai vẫn mở.`,
        `Ngoài kia còn ồn. Trong này, ${hook}.`,
      ]),
      `${lead} giữ câu ấy như giữ chìa khóa. ${meta.title} bắt đầu từ đêm này, không phải từ một lời đồn.`,
    ],
  ]
}

const CHAPTER_NAMES = [
  ['Lối vừa mở', 'Đêm đổi hướng', 'Chỗ không có trên bản đồ'],
  ['Thử lần thứ hai', 'Luật còn đó', 'Đếm lại cho chắc'],
  ['Người đứng cạnh', 'Một đêm chung cửa', 'Chưa phải bạn'],
  ['Có người nhìn', 'Suýt lộ', 'Câu hỏi không được trả lời'],
  ['Ở đến sáng', 'Chặn cửa', 'Chìa khóa đêm nay'],
]

function storyFrom(meta) {
  const genres = genresFor(meta)
  const authorId = meta.author ? slug(meta.author) : ''
  const pages = paragraphs(meta)
  const chapters = [5, 4, 3, 2, 1].map((n) => ({
    id: n,
    title: `Chương ${n}: ${pick(meta.id, `name${n}`, CHAPTER_NAMES[n - 1])}`,
    time: n === 5 ? '1 giờ trước' : `${6 - n} ngày trước`,
    likes: 20 + (hash(meta.id + n) % 40),
    paragraphs: pages[n - 1],
  }))
  const publisher = meta.publisher || ''
  const com = /cơm nguội/i.test(publisher)
  return {
    id: meta.id,
    title: meta.title,
    alt: meta.alt || meta.title,
    authorId: authorId || 'chua-ro',
    authorName: meta.author || 'Chưa ghi trên bìa',
    groupId: com ? 'com-nguoi' : undefined,
    groupName: com ? 'Cơm Nguội Novel' : publisher || undefined,
    translator: com ? 'Cơm Nguội' : undefined,
    genres: genres.map((item) => item.slug),
    genreRecords: genres,
    status: 'Đang ra',
    kind: 'Tiểu thuyết',
    chapterCount: 5,
    lead: speaker(meta.lead, 'Chàng trai'),
    partner: speaker(meta.partner, 'Người đi cùng'),
    blurb: vietnamese(meta.hook) ? `${vietnamese(meta.hook).charAt(0).toUpperCase()}${vietnamese(meta.hook).slice(1)}.` : meta.title,
    description: `${meta.title}${meta.author ? `. Tác giả ${meta.author}.` : '.'} Năm chương đầu là bản đọc mẫu theo tên trên bìa.`,
    chapters,
  }
}

function loadMeta() {
  const list = [...known]
  const seen = new Set(list.map((item) => item.id))
  for (let i = 0; i < 6; i += 1) {
    const file = `C:/Users/Admin/AppData/Local/Temp/ocr-covers/meta-${i}.json`
    if (!existsSync(file)) continue
    const extra = JSON.parse(readFileSync(file, 'utf8'))
    for (const item of extra) {
      if (!item?.id || !item.title || item.uncertain || seen.has(item.id)) continue
      seen.add(item.id)
      list.push(item)
    }
  }
  return list
}

const stories = loadMeta().map(storyFrom)
const genreMap = new Map()
const authorMap = new Map()
for (const story of stories) {
  for (const genre of story.genreRecords) genreMap.set(genre.slug, genre.name)
  if (story.authorId && story.authorName && story.authorId !== 'chua-ro') authorMap.set(story.authorId, story.authorName)
  delete story.genreRecords
}

const body = `/* Generated from cover text. Sample chapters are original, not copied novels. */
export const generatedGenres = ${JSON.stringify([...genreMap].map(([slug, name]) => ({ slug, name })), null, 2)}

export const generatedAuthors = ${JSON.stringify([...authorMap].map(([id, name]) => ({ id, name })), null, 2)}

export const generatedStories = ${JSON.stringify(stories, null, 2)}
`

writeFileSync(new URL('../src/stories/generated.js', import.meta.url), body)
console.log(`stories ${stories.length}`)

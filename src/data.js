export const genres = [
  { slug: 'romance', name: 'Romance' },
  { slug: 'hai', name: 'Hài' },
  { slug: 'drama', name: 'Drama' },
  { slug: 'doi-thuong', name: 'Đời thường' },
  { slug: 'van-phong', name: 'Văn phòng' },
  { slug: 'dai-hoc', name: 'Đại học' },
  { slug: 'gyaru', name: 'Gyaru' },
  { slug: 'fantasy', name: 'Fantasy' },
  { slug: 'oneshot', name: 'Oneshot' },
  { slug: 'series', name: 'Series' },
  { slug: 'doujinshi', name: 'Doujinshi' },
  { slug: 'manhwa', name: 'Manhwa' },
  { slug: 'ngot', name: 'Ngọt' },
  { slug: 'thanh-thi', name: 'Thành thị' },
  { slug: 'bi-an', name: 'Bí ẩn' },
  { slug: 'hanh-dong', name: 'Hành động' },
  { slug: 'truong-thanh', name: 'Người lớn' },
  { slug: 'isekai', name: 'Isekai' },
]

export const authors = [
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

const RAW = [
  {
    id: 'mua-tren-ban-cong',
    title: 'Mưa Trên Ban Công',
    alt: 'Ame no Balcony',
    authorId: 'lan-anh',
    groupId: 'ban-cong',
    translator: 'Hana',
    genres: ['romance', 'drama', 'thanh-thi', 'series', 'truong-thanh', 'ngot'],
    views: 18420,
    likes: 1260,
    follows: 840,
    status: 'Đang ra',
    updated: '2 giờ trước',
    hue: 330,
    badge: 'HOT',
    kind: 'Manga',
    chapterCount: 8,
    lead: 'Khánh',
    partner: 'Minh',
    blurb: 'Khánh dọn lên căn hộ tầng 12 đúng mùa mưa. Hàng xóm ban công sát vách chỉ mở cửa khi trời đổ.',
    description:
      'Khánh, 26 tuổi, chuyển về thành phố với một vali và thói quen pha cà phê quá tay. Căn hộ mới dính ban công với Minh — người làm ca đêm ở nhà xuất bản. Họ không trao đổi số điện thoại. Mọi chuyện bắt đầu từ một câu nói vọng qua tấm kính ướt.',
    lineA: 'Mình không giỏi nói thẳng. Nhưng hôm nay mưa to, mình muốn thử.',
    lineB: 'Cứ thử. Mình sẽ không cười, trừ khi câu đó dở.',
  },
  {
    id: 'ca-truc-van-phong',
    title: 'Ca Trực Văn Phòng',
    alt: 'Night Shift, Floor 18',
    authorId: 'kenji-pham',
    groupId: 'dem-khuya',
    translator: 'K.',
    genres: ['van-phong', 'romance', 'drama', 'thanh-thi', 'series', 'truong-thanh'],
    views: 15210,
    likes: 980,
    follows: 640,
    status: 'Đang ra',
    updated: '5 giờ trước',
    hue: 262,
    badge: 'MỚI',
    kind: 'Manga',
    chapterCount: 7,
    lead: 'Chi',
    partner: 'Đạt',
    blurb: 'Hai người trực cuối tuần ở tầng 18. Máy lạnh quá lạnh, còn máy pha cà phê thì hỏng đúng đêm giao báo cáo.',
    description:
      'Chi là thiết kế, Đạt là lập trình. Họ chỉ gặp nhau khi cả văn phòng đã tắt đèn. Bản thảo trên bàn, playlist không ai nhận, và một quy tắc ngầm: chuyện nói sau 11 giờ sẽ không được nhắc lại vào sáng thứ Hai. Quy tắc đó không trụ được lâu.',
    lineA: 'Bản này anh xem giúp em được không? Em nhìn mãi mà không thấy lỗi.',
    lineB: 'Lỗi không nằm ở bản vẽ. Nằm ở chỗ em chưa về.',
  },
  {
    id: 'tiem-mi-cua-nang-gal',
    title: 'Tiệm Mì Của Nàng Gal',
    alt: 'Gyaru Ramen After Class',
    authorId: 'mio-k',
    groupId: 'may-hong',
    translator: 'Mochi',
    genres: ['gyaru', 'hai', 'ngot', 'romance', 'dai-hoc', 'series', 'truong-thanh'],
    views: 22150,
    likes: 1640,
    follows: 1102,
    status: 'Đang ra',
    updated: '1 ngày trước',
    hue: 18,
    badge: 'HOT',
    kind: 'Manga',
    chapterCount: 9,
    lead: 'Yến',
    partner: 'Phúc',
    blurb: 'Yến nhuộm tóc sáng, đeo khuyên tai to, và nấu mì ngon đến mức quán nhỏ hết bàn trước chín giờ.',
    description:
      'Phúc ghé quán mì vì mất ngủ, rồi ở lại vì chủ quán nhớ đơn của cậu sau đúng một lần. Yến nói chuyện to, cười lớn, nhưng khi đóng cửa lại thì giọng nhỏ hẳn. Đây là chuyện của hai người lớn học cách ở cạnh nhau mà không cần diễn.',
    lineA: 'Suất cuối cùng. Ăn ở quầy, đừng có chê nước dùng.',
    lineB: 'Anh chưa từng chê. Anh chỉ chưa kịp nói là ngon.',
  },
  {
    id: 'hop-dong-ba-muoi-ngay',
    title: 'Hợp Đồng Ba Mươi Ngày',
    alt: 'Thirty-Day Clause',
    authorId: 'sora-lee',
    groupId: 'pho-nho',
    translator: 'Lynn',
    genres: ['romance', 'drama', 'van-phong', 'manhwa', 'series', 'truong-thanh'],
    views: 19880,
    likes: 1433,
    follows: 990,
    status: 'Đang ra',
    updated: '6 giờ trước',
    hue: 214,
    badge: null,
    kind: 'Manhwa',
    chapterCount: 10,
    lead: 'Mai',
    partner: 'Khoa',
    blurb: 'Một hợp đồng giả vờ hẹn hò để giữ ghế trong công ty gia đình. Điều khoản thứ bảy cấm động lòng.',
    description:
      'Mai cần một người đi cùng các buổi tiệc. Khoa cần thời gian để rời khỏi dự án mà anh không còn muốn ký tên. Họ soạn điều khoản rất kỹ, rồi vi phạm gần như tất cả trước ngày thứ mười hai. Truyện manhwa đời thường, nhịp chậm, nhân vật ngoài hai mươi.',
    lineA: 'Điều khoản bảy: không được thích nhau thật.',
    lineB: 'Vậy mình sửa điều khoản. Hợp đồng sinh ra là để đàm phán lại.',
  },
  {
    id: 'thu-vien-sau-nua-dem',
    title: 'Thư Viện Sau Nửa Đêm',
    alt: 'Library, After Midnight',
    authorId: 'yuki-tran',
    groupId: 'khong-ngu',
    translator: 'Yuki',
    genres: ['dai-hoc', 'romance', 'bi-an', 'ngot', 'doujinshi', 'truong-thanh'],
    views: 8640,
    likes: 720,
    follows: 410,
    status: 'Hoàn thành',
    updated: '3 ngày trước',
    hue: 168,
    badge: 'END',
    kind: 'Doujinshi',
    chapterCount: 5,
    lead: 'Hà',
    partner: 'Tuấn',
    blurb: 'Thư viện đại học lẽ ra đóng cửa lúc mười giờ. Có một người vẫn quẹt thẻ được sau nửa đêm.',
    description:
      'Hà làm thêm ở quầy mượn sách. Tuấn là học viên cao học cứ trả sách trễ và viết lời nhắn vào tờ ghi chú. Khi máy lạnh trong kho kệ cũ kêu một tiếng lạ, họ ở lại cùng nhau đến sáng — không phải vì ma, mà vì chưa ai muốn về trước.',
    lineA: 'Kho sách đóng rồi. Anh đang tìm gì?',
    lineB: 'Cuốn em giấu sau kệ địa lý. Và một lý do để đứng đây thêm mười phút.',
  },
  {
    id: 'dao-cua-loi-hua',
    title: 'Đảo Của Lời Hứa',
    alt: 'Isle of Kept Words',
    authorId: 'haru-nguyen',
    groupId: 'may-hong',
    translator: 'Haru',
    genres: ['fantasy', 'romance', 'hanh-dong', 'series', 'isekai', 'truong-thanh'],
    views: 13330,
    likes: 1011,
    follows: 770,
    status: 'Đang ra',
    updated: '8 giờ trước',
    hue: 146,
    badge: null,
    kind: 'Manga',
    chapterCount: 8,
    lead: 'Linh',
    partner: 'Arun',
    blurb: 'Linh tỉnh dậy trên đảo chỉ xuất hiện với người còn giữ một lời hứa chưa làm được.',
    description:
      'Mỗi đêm đảo dịch thêm một quãng. Linh, hướng dẫn viên 27 tuổi, gặp Arun — người gác hải đăng không nhớ mình đã hứa điều gì. Họ đi bộ dọc bờ biển, gom mảnh ký ức, và học cách nói một câu cho xong trước khi thủy triều rút.',
    lineA: 'Nếu đảo biến mất vào sáng mai, anh muốn nghe câu nào trước?',
    lineB: 'Câu em còn nợ. Nói chậm cũng được.',
  },
  {
    id: 'phong-4b',
    title: 'Phòng 4B',
    alt: 'Apartment 4B',
    authorId: 'nao-vo',
    groupId: 'pho-nho',
    translator: 'Nao',
    genres: ['doi-thuong', 'hai', 'romance', 'thanh-thi', 'series', 'truong-thanh'],
    views: 7420,
    likes: 510,
    follows: 288,
    status: 'Đang ra',
    updated: '12 giờ trước',
    hue: 42,
    badge: 'MỚI',
    kind: 'Manhwa',
    chapterCount: 6,
    lead: 'Trang',
    partner: 'Nam',
    blurb: 'Điều hòa phòng 4B hỏng giữa tháng Tám. Chủ nhà bảo chịu đựng, hàng xóm bảo sang ngồi nhờ.',
    description:
      'Trang viết quảng cáo freelance, Nam sửa xe ở cuối hẻm. Họ dùng chung một cái quạt và một cái nồi. Chuyện không có biến cố lớn — chỉ có những buổi tối quá nóng để giả vờ không quan tâm.',
    lineA: 'Quạt của em. Nước của anh. Công bằng chưa?',
    lineB: 'Chưa. Anh còn thiếu em một câu chúc ngủ ngon tử tế.',
  },
  {
    id: 'anh-neon-pho-cu',
    title: 'Ánh Neon Phố Cũ',
    alt: 'Old Town Neon',
    authorId: 'rin-dao',
    groupId: 'dem-khuya',
    translator: 'Rin',
    genres: ['thanh-thi', 'drama', 'bi-an', 'romance', 'series', 'truong-thanh'],
    views: 11940,
    likes: 860,
    follows: 540,
    status: 'Tạm dừng',
    updated: '1 tuần trước',
    hue: 252,
    badge: null,
    kind: 'Manga',
    chapterCount: 6,
    lead: 'My',
    partner: 'Long',
    blurb: 'My chụp biển hiệu sắp bị tháo. Long là người giữ chìa khóa của dãy phố đó.',
    description:
      'Một con phố chuẩn bị cải tạo. My muốn giữ lại màu đèn trước khi nó tắt hẳn. Long, quản lý tòa nhà, vốn định không mở cửa sau mười một giờ. Rồi anh thấy cô đứng dưới mưa với máy ảnh hết pin.',
    lineA: 'Cho em vào mười phút. Em chỉ chụp hành lang.',
    lineB: 'Mười phút là câu em nói tuần trước. Vào đi, khóa anh giữ.',
  },
  {
    id: 'senpai-bep-lanh',
    title: 'Senpai Bếp Lạnh',
    alt: 'Cold Kitchen Senpai',
    authorId: 'mio-k',
    groupId: 'may-hong',
    translator: 'Mochi',
    genres: ['hai', 'ngot', 'romance', 'doi-thuong', 'dai-hoc', 'series', 'truong-thanh'],
    views: 16770,
    likes: 1390,
    follows: 802,
    status: 'Đang ra',
    updated: '4 giờ trước',
    hue: 4,
    badge: 'HOT',
    kind: 'Manga',
    chapterCount: 7,
    lead: 'Vy',
    partner: 'Hiếu',
    blurb: 'Hiếu nấu ăn cho cả câu lạc bộ nhưng không nhớ nổi tên người rửa bát hộ mình suốt một học kỳ.',
    description:
      'Vy gia nhập câu lạc bộ ẩm thực năm cuối vì cần một hoạt động ngoại khóa. Hiếu, tiền bối đã ra trường nhưng vẫn quanh quẩn ở bếp tập, giao việc như ra lệnh và xin lỗi rất vụng. Mùi gừng và tiếng dao thớt dần thành lịch hẹn.',
    lineA: 'Tiền bối thái to quá. Em chỉnh nhé?',
    lineB: 'Em chỉnh dao, anh chỉnh lại cách mời em ở lại ăn.',
  },
  {
    id: 'chuyen-tau-2340',
    title: 'Chuyến Tàu 23:40',
    alt: 'The 23:40 Train',
    authorId: 'lan-anh',
    groupId: 'ban-cong',
    translator: 'Hana',
    genres: ['romance', 'drama', 'oneshot', 'thanh-thi', 'ngot', 'truong-thanh'],
    views: 6340,
    likes: 488,
    follows: 260,
    status: 'Hoàn thành',
    updated: '4 ngày trước',
    hue: 300,
    badge: 'END',
    kind: 'Doujinshi',
    chapterCount: 3,
    lead: 'An',
    partner: 'Quân',
    blurb: 'Tàu cuối trong đêm chỉ còn hai người thức: một người về quê, một người chưa biết xuống ga nào.',
    description:
      'An cầm vé một chiều. Quân ngồi đối diện với balo chưa khóa. Trong ba tiếng, họ đổi tên ga, đổi chuyện cũ, và một lần suýt ngủ quên điểm dừng. Oneshot ngắn về những người đã trưởng thành vẫn còn sợ xuống tàu.',
    lineA: 'Ga tới rồi. Anh xuống không?',
    lineB: 'Xuống. Nhưng chỉ nếu em nhắn khi tới nơi.',
  },
  {
    id: 'tiem-hoa-khong-ngu',
    title: 'Tiệm Hoa Không Ngủ',
    alt: 'The Sleepless Florist',
    authorId: 'sora-lee',
    groupId: 'khong-ngu',
    translator: 'Lynn',
    genres: ['doi-thuong', 'romance', 'ngot', 'thanh-thi', 'series', 'truong-thanh'],
    views: 9120,
    likes: 744,
    follows: 501,
    status: 'Đang ra',
    updated: '9 giờ trước',
    hue: 128,
    badge: null,
    kind: 'Manga',
    chapterCount: 6,
    lead: 'Đào',
    partner: 'Kiệt',
    blurb: 'Tiệm hoa mở đến hai giờ sáng vì chủ tiệm nói hoa cũng mất ngủ.',
    description:
      'Đào nhận bó hoa không có thiệp. Kiệt, người giao đêm, cứ quay lại hỏi tờ thiệp thất lạc. Họ tìm người nhận suốt một tuần và tìm thấy một lý do khác để gặp nhau khi đường vắng.',
    lineA: 'Bó này không có tên. Anh định giao cho ai?',
    lineB: 'Định giao cho người còn mở cửa. Hóa ra là em.',
  },
  {
    id: 'ban-nhap-chua-gui',
    title: 'Bản Nháp Chưa Gửi',
    alt: 'Unsent Drafts',
    authorId: 'yuki-tran',
    groupId: 'dem-khuya',
    translator: 'Yuki',
    genres: ['drama', 'romance', 'van-phong', 'doi-thuong', 'series', 'truong-thanh'],
    views: 10440,
    likes: 690,
    follows: 455,
    status: 'Đang ra',
    updated: '1 ngày trước',
    hue: 232,
    badge: 'REUP',
    kind: 'Manga',
    chapterCount: 6,
    lead: 'Ngân',
    partner: 'Hưng',
    blurb: 'Ngân viết thư xin lỗi trong thư nháp rồi không bao giờ bấm gửi. Hưng là người sit cùng bàn và thấy màn hình.',
    description:
      'Một tòa soạn nhỏ, deadline dày, và hai biên tập viên dùng chung một máy khi máy kia hỏng màn hình. Ngân giỏi chữ trên giấy, dở chữ ngoài đời. Hưng thì ngược lại. Cả hai đều 28 tuổi và đều đang học lại cách nói cho hết câu.',
    lineA: 'Anh đọc nháp của em à?',
    lineB: 'Đọc dòng đầu rồi nhìn đi chỗ khác. Phần còn lại em nên nói bằng miệng.',
  },
  {
    id: 'hai-ve-mot-ghe',
    title: 'Hai Vé Một Ghế',
    alt: 'Two Tickets, One Seat',
    authorId: 'haru-nguyen',
    groupId: 'may-hong',
    translator: 'Haru',
    genres: ['hai', 'romance', 'ngot', 'dai-hoc', 'oneshot', 'truong-thanh'],
    views: 5890,
    likes: 470,
    follows: 240,
    status: 'Hoàn thành',
    updated: '5 ngày trước',
    hue: 350,
    badge: null,
    kind: 'Doujinshi',
    chapterCount: 2,
    lead: 'Mi',
    partner: 'Bình',
    blurb: 'Vé xem hòa nhạc bị in trùng ghế. Không ai chịu đổi, nên họ ngồi chung tay vịn suốt hai tiếng.',
    description:
      'Mi mua vé phút chót. Bình giữ vé từ một tháng trước. Nhân viên phòng vé bó tay. Họ thống nhất mỗi người ngồi một hiệp và phá lệ ngay bài đầu tiên. Truyện ngắn, hài, ngọt, nhân vật tuổi sinh viên năm cuối.',
    lineA: 'Hiệp này tới em. Anh đừng có hát theo.',
    lineB: 'Anh hát nhỏ. Em cứ xem như tiếng điều hòa.',
  },
  {
    id: 'khach-san-ben-song',
    title: 'Khách Sạn Bên Sông',
    alt: 'Hotel by the River',
    authorId: 'kenji-pham',
    groupId: 'ban-cong',
    translator: 'K.',
    genres: ['drama', 'romance', 'bi-an', 'thanh-thi', 'series', 'truong-thanh'],
    views: 14110,
    likes: 1004,
    follows: 688,
    status: 'Đang ra',
    updated: '3 giờ trước',
    hue: 200,
    badge: 'MỚI',
    kind: 'Manga',
    chapterCount: 8,
    lead: 'Thư',
    partner: 'Vinh',
    blurb: 'Thư nhận ca lễ tân đêm ở khách sạn chỉ còn một vị khách dài hạn: người đàn ông phòng 203.',
    description:
      'Khách sạn cũ bên sông sắp đóng cửa cuối mùa. Thư về làm một tháng để trả nợ học phí. Vinh ở phòng 203, nói mình đang viết xong một cuốn rồi sẽ đi. Mỗi đêm anh xuống sảnh xin nước nóng và ở lại lâu hơn mức cần thiết.',
    lineA: 'Hết nước nóng rồi anh. Em pha ấm trà được không?',
    lineB: 'Được. Và em kể nốt chuyện hồi tối, em dừng giữa chừng.',
  },
  {
    id: 'lop-ve-tang-ap-mai',
    title: 'Lớp Vẽ Tầng Áp Mái',
    alt: 'Attic Drawing Class',
    authorId: 'nao-vo',
    groupId: 'khong-ngu',
    translator: 'Nao',
    genres: ['romance', 'doi-thuong', 'fantasy', 'ngot', 'doujinshi', 'truong-thanh'],
    views: 4550,
    likes: 390,
    follows: 210,
    status: 'Đang ra',
    updated: '2 ngày trước',
    hue: 278,
    badge: 'REUP',
    kind: 'Doujinshi',
    chapterCount: 4,
    lead: 'Quỳnh',
    partner: 'Đông',
    blurb: 'Lớp vẽ người lớn trên tầng áp mái chỉ nhận học viên sau 21 tuổi. Mẫu hôm nay đến trễ mười lăm phút.',
    description:
      'Quỳnh dạy vẽ buổi tối cho người đi làm. Đông đăng ký vì muốn nhìn người khác lâu mà không bị trách là vô duyên. Anh ngồi nhầm chỗ của người mẫu. Cô không đuổi. Bài học đầu tiên: nhìn cho kỹ trước khi vẽ.',
    lineA: 'Anh đang ngồi nhầm ghế. Ghế mẫu ở dưới ánh đèn.',
    lineB: 'Vậy em vẽ anh ở ghế này cũng được. Ánh đèn với qua tới.',
  },
]

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

export const mangas = RAW.map(withChapters)

export const communityAlbums = [
  {
    id: 'mua',
    name: 'Đọc khi trời mưa',
    owner: 'Lan',
    desc: 'Truyện chậm, nhiều khoảng lặng và cửa sổ.',
    reactions: 128,
    mangaIds: ['mua-tren-ban-cong', 'khach-san-ben-song', 'chuyen-tau-2340'],
  },
  {
    id: 'ngot',
    name: 'Ngọt cuối tuần',
    owner: 'Mochi',
    desc: 'Hài nhẹ, có bếp và có người nấu thừa một suất.',
    reactions: 96,
    mangaIds: ['tiem-mi-cua-nang-gal', 'senpai-bep-lanh', 'hai-ve-mot-ghe'],
  },
  {
    id: 'dem',
    name: 'Đêm văn phòng',
    owner: 'K.',
    desc: 'Đèn bàn, deadline, và những câu nói sau mười một giờ.',
    reactions: 74,
    mangaIds: ['ca-truc-van-phong', 'hop-dong-ba-muoi-ngay', 'ban-nhap-chua-gui'],
  },
  {
    id: 'dao',
    name: 'Đi một vòng rồi về',
    owner: 'Haru',
    desc: 'Fantasy dịu, không cần bảng stat.',
    reactions: 61,
    mangaIds: ['dao-cua-loi-hua', 'lop-ve-tang-ap-mai', 'thu-vien-sau-nua-dem'],
  },
  {
    id: 'pho',
    name: 'Phố chưa tắt đèn',
    owner: 'Rin',
    desc: 'Thành phố, biển hiệu, phòng trọ và tiệm mở khuya.',
    reactions: 83,
    mangaIds: ['anh-neon-pho-cu', 'tiem-hoa-khong-ngu', 'phong-4b'],
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
    id: 'n1',
    title: 'Chương mới: Mưa Trên Ban Công',
    body: 'Ban Công Team vừa đăng chương mới.',
    time: '2 giờ trước',
    href: '/truyen/mua-tren-ban-cong',
  },
  {
    id: 'n2',
    title: 'Khách Sạn Bên Sông có cập nhật',
    body: 'Chương mới đã lên kệ.',
    time: '3 giờ trước',
    href: '/truyen/khach-san-ben-song',
  },
  {
    id: 'n3',
    title: 'Album “Ngọt cuối tuần” được ghim',
    body: 'Album cộng đồng tuần này.',
    time: '1 ngày trước',
    href: '/album/ngot',
  },
  {
    id: 'n4',
    title: 'Chào mừng đến MOCHI',
    body: 'Đây là bản frontend. Dữ liệu lưu trên trình duyệt của bạn.',
    time: 'Hôm nay',
    href: '/cai-dat',
  },
]

export const seedComments = {
  'mua-tren-ban-cong': [
    { id: 'c1', user: 'Mây', text: 'Chương mưa đọc rất chậm và dễ chịu. Ở lại hết đêm.', at: '1 ngày trước' },
    { id: 'c2', user: 'Khoa', text: 'Minh nói ít mà trúng. Mong họ đừng hiểu lầm thêm chương nào nữa.', at: '2 ngày trước' },
  ],
  'tiem-mi-cua-nang-gal': [
    { id: 'c3', user: 'An', text: 'Đói thật sự sau chương mì. Yến dễ thương theo kiểu người lớn.', at: '5 giờ trước' },
  ],
  'hop-dong-ba-muoi-ngay': [
    { id: 'c4', user: 'Linh', text: 'Điều khoản bảy chắc chắn không sống nổi. Đang chờ lần đàm phán.', at: '8 giờ trước' },
  ],
}

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

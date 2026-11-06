import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Shell from './components/Shell'
import { StoreProvider } from './store'
import Home from './pages/Home'
import { AlbumPage, Albums, GenrePage, Genres, Library, SearchPage } from './pages/Browse'
import Detail from './pages/Detail'
import Reader from './pages/Reader'
import { AuthorPage, Forum, GuildPage, Guilds, PostPage } from './pages/Community'
import {
  FollowAuthors, FollowedStories, FollowGroups, HistoryPage, MyAlbums, NotFound,
  Notifications, SecurityPage, SettingsPage, UploadPage,
} from './pages/Account'
import { AuthLayout, LoginPage, RegisterPage, VerifyEmailPage } from './pages/Auth'

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/dang-nhap" element={<LoginPage />} />
            <Route path="/dang-ky" element={<RegisterPage />} />
            <Route path="/xac-minh-email" element={<VerifyEmailPage />} />
          </Route>
          <Route element={<Shell />}>
            <Route path="/" element={<Home />} />
            <Route path="/danh-sach" element={<Library />} />
            <Route path="/the-loai" element={<Genres />} />
            <Route path="/the-loai/:slug" element={<GenrePage />} />
            <Route path="/album" element={<Albums />} />
            <Route path="/album/:id" element={<AlbumPage />} />
            <Route path="/tim-kiem" element={<SearchPage />} />
            <Route path="/truyen/:id" element={<Detail />} />
            <Route path="/doc/:id/:chapter" element={<Reader />} />
            <Route path="/dien-dan" element={<Forum />} />
            <Route path="/dien-dan/:id" element={<PostPage />} />
            <Route path="/nhom-dich" element={<Guilds />} />
            <Route path="/nhom-dich/:id" element={<GuildPage />} />
            <Route path="/tac-gia/:id" element={<AuthorPage />} />
            <Route path="/theo-doi/truyen" element={<FollowedStories />} />
            <Route path="/lich-su" element={<HistoryPage />} />
            <Route path="/album-cua-ban" element={<MyAlbums />} />
            <Route path="/theo-doi/tac-gia" element={<FollowAuthors />} />
            <Route path="/theo-doi/dich-gia" element={<FollowGroups />} />
            <Route path="/cai-dat" element={<SettingsPage />} />
            <Route path="/bao-mat" element={<SecurityPage />} />
            <Route path="/dang-truyen" element={<UploadPage />} />
            <Route path="/thong-bao" element={<Notifications />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  )
}

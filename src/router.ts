import { createRouter, createWebHashHistory } from 'vue-router'
import LandingPage from './components_landing/LandingPage.vue'
import LoginPage from './components_login/LoginPage.vue'
import DashboardPage from './components_dashboard/DashboardPage.vue'
import BrowserPage from './components_browser/BrowserPage.vue'
import UploadPage from './components_upload/UploadPage.vue'
import ChatsPage from './components_chats/ChatsPage.vue'

const routes = [
  { path: '/', component: LandingPage, meta: { title: 'ReadCycle | Landing' } },
  { path: '/login', component: LoginPage, meta: { title: 'ReadCycle | Login' } },
  { path: '/dashboard', component: DashboardPage, meta: { title: 'ReadCycle | Dashboard' } },
  { path: '/browser', component: BrowserPage, meta: { title: 'ReadCycle | Browser' } },
  { path: '/upload', component: UploadPage, meta: { title: 'ReadCycle | Upload' } },
  { path: '/chats', component: ChatsPage, meta: { title: 'ReadCycle | Chats' } }
]

const router = createRouter({
  history: createWebHashHistory(),  //NOTE: Web Hash History is temp for static host (github pages), change when buying domain
  routes,
})

router.afterEach((to) => {
  if (to.meta?.title) {
    document.title = to.meta.title
  } else {
    document.title = 'ReadCycle'
  }
})

export default router
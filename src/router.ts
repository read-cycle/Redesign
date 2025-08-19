import { createRouter, createWebHashHistory } from 'vue-router'
import LandingPage from './components_landing/LandingPage.vue'
import LoginPage from './components_login/LoginPage.vue'
import DashboardPage from './components_dashboard/DashboardPage.vue'
import BrowserPage from './components_browser/BrowserPage.vue'
import UploadPage from './components_upload/UploadPage.vue'
import ChatsPage from './components_chats/ChatsPage.vue'
const routes = [
  { path: '/', component: LandingPage },
  { path: '/login', component: LoginPage },
  { path: '/dashboard', component: DashboardPage},
  { path: '/browser', component: BrowserPage },
  { path: '/upload', component: UploadPage },
  { path: '/chats', component: ChatsPage }
]

const router = createRouter({
  history: createWebHashHistory(),  //NOTE: Web Hash History is temp for static host (github pages), change when buying domain
  routes,
})

export default router
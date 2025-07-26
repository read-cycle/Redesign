import { createRouter, createWebHashHistory } from 'vue-router'
import LandingPage from './components/LandingPage.vue'
import LoginPage from './components_login/LoginPage.vue'

const routes = [
  { path: '/', component: LandingPage },
  { path: '/login', component: LoginPage },
]

const router = createRouter({
  history: createWebHashHistory(),  //NOTE: Web Hash History is temp for static host (github pages), change when buying domain
  routes,
})

export default router
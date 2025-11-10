import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SignupView from '../views/SignupView.vue'
import LoginView from '../views/LoginView.vue'
import OtpView from '../views/OtpView.vue'
import DashboardView from '../views/DashboardView.vue'

const routes: Array<RouteRecordRaw> = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/signup', name: 'signup', component: SignupView },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/otp', name: 'otp', component: OtpView },
  { path: '/dashboard', name: 'dashboard', component: DashboardView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

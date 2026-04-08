import { defineStore } from 'pinia'
import api from '@/api/axios'

function readJson(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: readJson('user'),
    status: 'idle', // idle | loading | authed
  }),
  getters: {
    isAuthed: (s) => Boolean(s.token),
    isAdmin: (s) => s.user?.role === 'admin',
  },
  actions: {
    async login({ email, password }) {
      this.status = 'loading'
      try {
        const { data } = await api.post('/auth/login', { email, password })
        this.token = data.token
        this.user = data.user
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        this.status = 'authed'
        return data.user
      } finally {
        if (!this.token) this.status = 'idle'
      }
    },
    logout() {
      this.token = null
      this.user = null
      this.status = 'idle'
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
  },
})


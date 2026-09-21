import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  clearStoredSession,
  loginApi,
  logoutApi,
  readStoredSession,
  registerApi,
} from '@/api/auth'
import type { AuthUser, LoginPayload, RegisterPayload } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const user = ref<AuthUser | null>(null)

  const isAuthenticated = computed(() => Boolean(token.value && user.value))

  function hydrate() {
    const session = readStoredSession()
    if (!session) {
      token.value = null
      user.value = null
      return
    }
    token.value = session.token
    user.value = session.user
  }

  async function login(payload: LoginPayload) {
    const session = await loginApi(payload)
    token.value = session.token
    user.value = session.user
  }

  async function register(payload: RegisterPayload) {
    const session = await registerApi(payload)
    token.value = session.token
    user.value = session.user
  }

  async function logout() {
    try {
      await logoutApi()
    } finally {
      token.value = null
      user.value = null
      clearStoredSession()
    }
  }

  hydrate()

  return {
    token,
    user,
    isAuthenticated,
    hydrate,
    login,
    register,
    logout,
  }
})

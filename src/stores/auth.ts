import type { AuthUser } from '../types'
import { computed, reactive } from 'vue'

const AUTH_KEY = 'morya-admin-auth'
const LOCK_KEY = 'morya-admin-lock'

interface AuthState {
  user: AuthUser | null
  /** 登录时刻（ms） */
  loginAt: number | null
  locked: boolean
}

function readStoredUser(): { user: AuthUser, loginAt: number } | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    if (!raw)
      return null
    const parsed = JSON.parse(raw) as { user: AuthUser, loginAt: number }
    return parsed?.user ? parsed : null
  }
  catch {
    return null
  }
}

const stored = readStoredUser()

const state = reactive<AuthState>({
  user: stored?.user ?? null,
  loginAt: stored?.loginAt ?? null,
  locked: sessionStorage.getItem(LOCK_KEY) === '1',
})

function persist() {
  if (state.user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify({ user: state.user, loginAt: state.loginAt }))
  }
  else {
    localStorage.removeItem(AUTH_KEY)
  }
}

export function useAuthStore() {
  const isAuthenticated = computed(() => state.user !== null)
  const nickname = computed(() => state.user?.nickname ?? '')
  const avatarText = computed(() => (state.user?.nickname ?? 'A').slice(0, 1).toUpperCase())

  function signIn(user: AuthUser) {
    state.user = user
    state.loginAt = Date.now()
    state.locked = false
    sessionStorage.removeItem(LOCK_KEY)
    persist()
  }

  function signOut() {
    state.user = null
    state.loginAt = null
    state.locked = false
    sessionStorage.removeItem(LOCK_KEY)
    persist()
  }

  function lock() {
    if (!state.user)
      return
    state.locked = true
    sessionStorage.setItem(LOCK_KEY, '1')
  }

  function unlock() {
    state.locked = false
    sessionStorage.removeItem(LOCK_KEY)
  }

  return { state, isAuthenticated, nickname, avatarText, signIn, signOut, lock, unlock }
}

import type { AuthUser } from '../types'
import { computed, reactive } from 'vue'
import { AUTH_ONLY_PATHS, permissionsForRoleCode } from '../utils/permission'

const AUTH_KEY = 'morya-admin-auth'
const AUTH_SESSION_KEY = 'morya-admin-auth-session'
const LOCK_KEY = 'morya-admin-lock'

interface AuthState {
  user: AuthUser | null
  /** 登录时刻（ms） */
  loginAt: number | null
  locked: boolean
  /** 是否使用 localStorage 持久化（记住我） */
  remember: boolean
}

interface StoredAuth {
  user: AuthUser
  loginAt: number
  remember: boolean
}

function normalizeUser(raw: AuthUser): AuthUser {
  const roleCode = raw.roleCode
    || (raw.role === '超级管理员'
      ? 'admin'
      : raw.role === '运营专员'
        ? 'ops'
        : raw.role === '市场经理'
          ? 'market'
          : raw.role === '财务专员'
            ? 'finance'
            : 'dev')
  const permissions = Array.isArray(raw.permissions) && raw.permissions.length
    ? raw.permissions
    : permissionsForRoleCode(roleCode)
  return { ...raw, roleCode, permissions }
}

function readStored(): StoredAuth | null {
  try {
    const localRaw = localStorage.getItem(AUTH_KEY)
    if (localRaw) {
      const parsed = JSON.parse(localRaw) as StoredAuth
      if (parsed?.user)
        return { ...parsed, user: normalizeUser(parsed.user), remember: true }
    }
    const sessionRaw = sessionStorage.getItem(AUTH_SESSION_KEY)
    if (sessionRaw) {
      const parsed = JSON.parse(sessionRaw) as StoredAuth
      if (parsed?.user)
        return { ...parsed, user: normalizeUser(parsed.user), remember: false }
    }
    return null
  }
  catch {
    return null
  }
}

const stored = readStored()

const state = reactive<AuthState>({
  user: stored?.user ?? null,
  loginAt: stored?.loginAt ?? null,
  locked: sessionStorage.getItem(LOCK_KEY) === '1',
  remember: stored?.remember ?? true,
})

function persist() {
  localStorage.removeItem(AUTH_KEY)
  sessionStorage.removeItem(AUTH_SESSION_KEY)

  if (!state.user)
    return

  const payload = JSON.stringify({
    user: state.user,
    loginAt: state.loginAt ?? Date.now(),
    remember: state.remember,
  } satisfies StoredAuth)

  if (state.remember)
    localStorage.setItem(AUTH_KEY, payload)
  else
    sessionStorage.setItem(AUTH_SESSION_KEY, payload)
}

export function useAuthStore() {
  const isAuthenticated = computed(() => state.user !== null)
  const nickname = computed(() => state.user?.nickname ?? '')
  const avatarText = computed(() => (state.user?.nickname ?? 'A').slice(0, 1).toUpperCase())
  const permissions = computed(() => state.user?.permissions ?? [])

  function signIn(user: AuthUser, options?: { remember?: boolean }) {
    state.user = user
    state.loginAt = Date.now()
    state.locked = false
    state.remember = options?.remember ?? true
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

  function hasPermission(code: string) {
    if (!code)
      return true
    return permissions.value.includes(code)
  }

  function canAccessPath(path: string) {
    if (AUTH_ONLY_PATHS.has(path))
      return true
    return permissions.value.includes(path)
  }

  /** 角色授权后刷新当前用户权限（同 roleCode） */
  function refreshPermissions(next: string[]) {
    if (!state.user)
      return
    state.user = { ...state.user, permissions: next }
    persist()
  }

  /** 个人中心资料局部更新并持久化 */
  function updateProfile(patch: Partial<Pick<AuthUser, 'nickname' | 'email' | 'bio' | 'location'>>) {
    if (!state.user)
      return
    state.user = { ...state.user, ...patch }
    persist()
  }

  return {
    state,
    isAuthenticated,
    nickname,
    avatarText,
    permissions,
    signIn,
    signOut,
    lock,
    unlock,
    hasPermission,
    canAccessPath,
    refreshPermissions,
    updateProfile,
  }
}

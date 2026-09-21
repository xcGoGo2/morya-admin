import { delay } from '@/api/mock'
import {
  AuthError,
  type AuthSession,
  type AuthUser,
  type LoginPayload,
  type RegisterPayload,
} from '@/types/auth'

const USERS_KEY = 'morya-admin:mock-users'
const SESSION_KEY = 'morya-admin:auth-session'

interface StoredUser extends AuthUser {
  password: string
}

const seedUsers: StoredUser[] = [
  {
    id: 'u-admin',
    name: '模板管理员',
    email: 'admin@morya.dev',
    password: 'admin123',
  },
]

function readUsers(): StoredUser[] {
  const raw = localStorage.getItem(USERS_KEY)
  if (!raw) {
    localStorage.setItem(USERS_KEY, JSON.stringify(seedUsers))
    return [...seedUsers]
  }
  try {
    const parsed = JSON.parse(raw) as StoredUser[]
    return Array.isArray(parsed) && parsed.length ? parsed : [...seedUsers]
  } catch {
    return [...seedUsers]
  }
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function toPublicUser(user: StoredUser): AuthUser {
  return { id: user.id, name: user.name, email: user.email }
}

function createToken(userId: string): string {
  return `mock.${userId}.${Date.now()}`
}

export function readStoredSession(): AuthSession | null {
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthSession
  } catch {
    return null
  }
}

export function clearStoredSession() {
  localStorage.removeItem(SESSION_KEY)
}

function persistSession(session: AuthSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export async function loginApi(payload: LoginPayload): Promise<AuthSession> {
  await delay()
  const email = payload.email.trim().toLowerCase()
  const user = readUsers().find((item) => item.email.toLowerCase() === email)

  if (!user || user.password !== payload.password) {
    throw new AuthError('邮箱或密码不正确，请核对后重试。')
  }

  const session: AuthSession = {
    token: createToken(user.id),
    user: toPublicUser(user),
  }
  persistSession(session)
  return session
}

export async function registerApi(payload: RegisterPayload): Promise<AuthSession> {
  await delay()
  const email = payload.email.trim().toLowerCase()
  const name = payload.name.trim()
  const users = readUsers()

  if (users.some((item) => item.email.toLowerCase() === email)) {
    throw new AuthError('该邮箱已注册，请直接登录或更换邮箱。')
  }

  const user: StoredUser = {
    id: `u-${Date.now()}`,
    name,
    email,
    password: payload.password,
  }
  writeUsers([...users, user])

  const session: AuthSession = {
    token: createToken(user.id),
    user: toPublicUser(user),
  }
  persistSession(session)
  return session
}

export async function logoutApi(): Promise<void> {
  await delay(180)
  clearStoredSession()
}

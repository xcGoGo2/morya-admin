import type { AuthUser } from '../types'
import { findRoleByCode, permissionsForRoleCode } from '../utils/permission'
import { users } from './system'

function delay(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

function roleCodeForUsername(username: string): string {
  const key = username.trim().toLowerCase()
  if (key === 'admin')
    return 'admin'
  if (key === 'ops' || key === 'zhouran')
    return 'ops'
  if (key === 'wangwu')
    return 'market'
  if (key === 'zhaosi')
    return 'finance'
  const matched = users.find(u => u.username.toLowerCase() === key)
  if (matched) {
    const byName = findRoleByCode(
      matched.role === '超级管理员'
        ? 'admin'
        : matched.role === '运营专员'
          ? 'ops'
          : matched.role === '市场经理'
            ? 'market'
            : matched.role === '财务专员'
              ? 'finance'
              : 'dev',
    )
    return byName?.code ?? 'dev'
  }
  return 'dev'
}

function buildAuthUser(username: string): AuthUser {
  const roleCode = roleCodeForUsername(username)
  const role = findRoleByCode(roleCode)
  const seed = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase())

  return {
    username: seed?.username ?? username.trim(),
    nickname: seed?.nickname ?? (roleCode === 'admin' ? 'Admin' : username.trim()),
    role: role?.name ?? '研发工程师',
    roleCode,
    permissions: permissionsForRoleCode(roleCode),
    email: seed?.email ?? `${username.trim()}@morya.dev`,
    dept: seed?.dept ?? '前端开发部',
    location: '武汉 · 中国',
    bio: '这个人很懒，什么都没留下～ 专注于中后台前端解决方案。',
  }
}

/** Mock 登录：任意非空账号密码均可通过；按用户名映射角色权限 */
export async function loginApi(payload: { username: string, password: string }): Promise<AuthUser> {
  await delay(600)
  return buildAuthUser(payload.username)
}

/** Mock 解锁：任意非空密码均可解锁 */
export async function unlockApi(_password: string): Promise<void> {
  await delay(300)
}

/** Mock 退出登录 */
export async function logoutApi(): Promise<void> {
  await delay(200)
}

/** Mock 忘记密码：发送重置邮件 */
export async function forgotPasswordApi(email: string): Promise<void> {
  await delay(500)
  if (!email.trim())
    throw new Error('email required')
}

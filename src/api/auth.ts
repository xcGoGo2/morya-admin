import type { AuthUser } from '../types'

function delay(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

/** Mock 登录：任意非空账号密码均可通过 */
export async function loginApi(payload: { username: string, password: string }): Promise<AuthUser> {
  await delay(600)
  return {
    username: payload.username,
    nickname: 'Admin',
    role: '超级管理员',
    email: 'admin@morya.dev',
    dept: '前端开发部',
    location: '武汉 · 中国',
    bio: '这个人很懒，什么都没留下～ 专注于中后台前端解决方案。',
  }
}

/** Mock 解锁：任意非空密码均可解锁 */
export async function unlockApi(_password: string): Promise<void> {
  await delay(300)
}

/** Mock 退出登录 */
export async function logoutApi(): Promise<void> {
  await delay(200)
}

import type { MenuRecord, RoleRecord } from '../types'
import { menus, roles } from '../api/system'

/** 已登录即可访问、不参与菜单裁剪的路径 */
export const AUTH_ONLY_PATHS = new Set([
  '/profile',
  '/lock',
  '/403',
  '/500',
  '/404',
])

export function findRoleByCode(code: string): RoleRecord | undefined {
  return roles.find(r => r.code === code)
}

export function resolvePermissions(menuIds: string[]): string[] {
  const idSet = new Set(menuIds)
  const perms = new Set<string>()

  for (const menu of menus) {
    if (!idSet.has(menu.id) || menu.status !== 'active')
      continue
    if (menu.path)
      perms.add(menu.path)
    if (menu.permission)
      perms.add(menu.permission)
  }

  return [...perms]
}

export function permissionsForRoleCode(roleCode: string): string[] {
  const role = findRoleByCode(roleCode)
  if (!role)
    return resolvePermissions([])
  return resolvePermissions(role.menuIds)
}

export function menuById(id: string): MenuRecord | undefined {
  return menus.find(m => m.id === id)
}

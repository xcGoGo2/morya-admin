import type { IconName, MenuItem } from 'morya-ui'
import type { MenuRecord } from '../types'
import { menus as seedMenus } from '../api/system'

function sortMenus(items: MenuRecord[]) {
  return [...items].sort((a, b) => a.sort - b.sort)
}

function toIcon(name: string): IconName | undefined {
  return name ? (name as IconName) : undefined
}

/**
 * 将扁平菜单种子转为侧栏 / 命令面板模型。
 * 仅包含 directory + menu；按 permissions（path）裁剪。
 */
export function buildMenuModel(
  permissions: string[],
  source: MenuRecord[] = seedMenus,
): MenuItem[] {
  const allowed = new Set(permissions)
  const active = source.filter(m => m.status === 'active' && m.type !== 'button')

  function childrenOf(parentId: string | null): MenuItem[] {
    const result: MenuItem[] = []
    for (const node of sortMenus(active.filter(m => m.parentId === parentId))) {
      if (node.type === 'directory') {
        const kids = childrenOf(node.id)
        if (!kids.length)
          continue
        result.push({
          key: node.id,
          label: node.name,
          icon: toIcon(node.icon),
          items: kids,
        })
        continue
      }

      if (!node.path || !allowed.has(node.path))
        continue

      result.push({
        key: node.path,
        label: node.name,
        icon: toIcon(node.icon),
        to: node.path,
      })
    }
    return result
  }

  return childrenOf(null)
}

/** 按路由 path 查菜单叶子图标（供顶部页签复用） */
export function findMenuIcon(permissions: string[], path: string): IconName | undefined {
  function walk(nodes: MenuItem[]): IconName | undefined {
    for (const node of nodes) {
      if (node.to === path && node.icon)
        return node.icon as IconName
      const found = node.items ? walk(node.items) : undefined
      if (found)
        return found
    }
    return undefined
  }
  return walk(buildMenuModel(permissions))
}

export interface PermissionTreeNode {
  key: string
  label: string
  children?: PermissionTreeNode[]
}

/** 权限树（含按钮）——角色授权抽屉 */
export function buildPermissionTree(source: MenuRecord[] = seedMenus): PermissionTreeNode[] {
  const active = source.filter(m => m.status === 'active')

  function childrenOf(parentId: string | null): PermissionTreeNode[] {
    return sortMenus(active.filter(m => m.parentId === parentId)).map((node) => {
      const kids = childrenOf(node.id)
      const label = node.type === 'button'
        ? `${node.name}${node.permission ? `（${node.permission}）` : ''}`
        : node.name
      return {
        key: node.id,
        label,
        ...(kids.length ? { children: kids } : {}),
      }
    })
  }

  return childrenOf(null)
}

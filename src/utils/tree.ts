/** 将扁平父子结构按深度优先展开，便于表格缩进展示 */
export function flattenTree<T extends { id: string, parentId: string | null }>(
  items: T[],
  parentId: string | null = null,
  depth = 0,
): Array<T & { depth: number }> {
  const result: Array<T & { depth: number }> = []
  for (const item of items.filter(i => i.parentId === parentId).sort((a, b) => {
    const as = 'sort' in a ? Number((a as { sort?: number }).sort ?? 0) : 0
    const bs = 'sort' in b ? Number((b as { sort?: number }).sort ?? 0) : 0
    return as - bs
  })) {
    result.push({ ...item, depth })
    result.push(...flattenTree(items, item.id, depth + 1))
  }
  return result
}

export function nextId(prefix: string) {
  return `${prefix}${Date.now().toString(36)}`
}

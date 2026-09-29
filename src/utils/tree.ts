/** 将扁平父子结构按深度优先展开（调试 / 非树表场景） */
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

/**
 * 筛选扁平树：命中节点 + 其祖先一并保留，便于 `MTable tree-config.transform`。
 */
export function filterTreeFlat<T extends { id: string, parentId: string | null }>(
  items: T[],
  predicate: (item: T) => boolean,
): T[] {
  const byId = new Map(items.map(i => [i.id, i]))
  const keep = new Set<string>()
  for (const item of items) {
    if (!predicate(item))
      continue
    let cur: T | undefined = item
    while (cur) {
      if (keep.has(cur.id))
        break
      keep.add(cur.id)
      cur = cur.parentId ? byId.get(cur.parentId) : undefined
    }
  }
  return items.filter(i => keep.has(i.id))
}

export function nextId(prefix: string) {
  return `${prefix}${Date.now().toString(36)}`
}

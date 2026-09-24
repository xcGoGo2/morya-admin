import type { IconName } from 'morya-ui'
import { ref } from 'vue'

export interface AppTab {
  label: string
  /** 路由路径，同时作为标签的 value */
  value: string
  icon?: IconName
  closable?: boolean
}

const HOME: AppTab = { label: '工作台', value: '/dashboard', icon: 'layout-dashboard', closable: false }

const tabs = ref<AppTab[]>([{ ...HOME }])
const active = ref(HOME.value)

export function useTabsStore() {
  function open(tab: { label: string, value: string }) {
    if (!tabs.value.some(t => t.value === tab.value)) {
      tabs.value.push({ label: tab.label, value: tab.value, closable: tab.value !== HOME.value })
    }
    active.value = tab.value
  }

  /**
   * 关闭页签，返回需要跳转的路径（null 表示无需跳转）。
   * 至少保留一个页签：全关时回到工作台。
   */
  function close(value: string): string | null {
    const index = tabs.value.findIndex(t => t.value === value)
    if (index === -1 || tabs.value[index].closable === false)
      return null
    tabs.value.splice(index, 1)

    if (tabs.value.length === 0) {
      tabs.value.push({ ...HOME })
      active.value = HOME.value
      return HOME.value
    }
    if (active.value === value) {
      const next = tabs.value[Math.max(0, index - 1)]
      active.value = next.value
      return next.value
    }
    return null
  }

  function reset() {
    tabs.value = [{ ...HOME }]
    active.value = HOME.value
  }

  return { tabs, active, open, close, reset }
}

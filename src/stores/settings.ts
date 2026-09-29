import { computed, reactive } from 'vue'

const SETTINGS_KEY = 'morya-admin-settings'

export type ContentWidth = 'fluid' | 'fixed'

export interface LayoutSettings {
  /** 是否显示多页签 */
  showTabs: boolean
  /** 内容区宽度 */
  contentWidth: ContentWidth
  /** 密度：由 useDensity 同步，此处仅持久化偏好 */
  density: 'compact' | 'comfortable' | 'spacious'
}

const defaults: LayoutSettings = {
  showTabs: true,
  contentWidth: 'fluid',
  density: 'comfortable',
}

function read(): LayoutSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw)
      return { ...defaults }
    return { ...defaults, ...JSON.parse(raw) as Partial<LayoutSettings> }
  }
  catch {
    return { ...defaults }
  }
}

const state = reactive<LayoutSettings>(read())

function persist() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({
    showTabs: state.showTabs,
    contentWidth: state.contentWidth,
    density: state.density,
  }))
}

export function useSettingsStore() {
  const showTabs = computed(() => state.showTabs)
  const contentWidth = computed(() => state.contentWidth)
  const density = computed(() => state.density)

  function patch(partial: Partial<LayoutSettings>) {
    Object.assign(state, partial)
    persist()
  }

  function setShowTabs(value: boolean) {
    state.showTabs = value
    persist()
  }

  function setContentWidth(value: ContentWidth) {
    state.contentWidth = value
    persist()
  }

  function setDensity(value: LayoutSettings['density']) {
    state.density = value
    persist()
  }

  function reset() {
    Object.assign(state, defaults)
    persist()
  }

  return {
    state,
    showTabs,
    contentWidth,
    density,
    patch,
    setShowTabs,
    setContentWidth,
    setDensity,
    reset,
  }
}

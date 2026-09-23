import type { IconName } from 'morya-ui'

/** 共享业务类型 */
export interface AuthUser {
  username: string
  nickname: string
  role: string
  email: string
  dept: string
  location: string
  bio: string
}

export type NotifyKind = 'notice' | 'message' | 'todo'
export type Tone = 'primary' | 'success' | 'warn' | 'help' | 'info'

export interface NotifyItem {
  id: number
  kind: NotifyKind
  title: string
  desc: string
  time: string
  icon: IconName
  tone: Tone
  unread: boolean
}

export interface StatItem {
  label: string
  value: string
  trend: string
  /** 较周期比较文案 */
  hint: string
  up: boolean
  icon: IconName
  severity: 'primary' | 'success' | 'warn' | 'danger'
}

export interface TodoItem {
  id: number
  title: string
  priority: 'high' | 'mid' | 'low'
  time: string
  done: boolean
}

export interface ActivityItem {
  id: number
  content: string
  time: string
  icon: IconName
  severity: 'success' | 'info' | 'warn' | 'danger'
}

export interface DeviceItem {
  id: number
  name: string
  client: string
  location: string
  time: string
  current?: boolean
}

export interface TrafficSource {
  name: string
  percent: number
  /** 对应 --m-color-* 语义色 */
  color: Tone
}

export interface VisitPoint {
  date: string
  visits: number
  visitors: number
}

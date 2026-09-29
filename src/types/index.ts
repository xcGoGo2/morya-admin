import type { IconName } from 'morya-ui'

/** 共享业务类型 */
export interface AuthUser {
  username: string
  nickname: string
  role: string
  /** 角色编码，用于权限解析 */
  roleCode: string
  /** 已展开的权限码：菜单 path + 按钮 permission */
  permissions: string[]
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

export type EnableStatus = 'active' | 'inactive'

export interface UserRecord {
  id: string
  username: string
  nickname: string
  email: string
  phone: string
  dept: string
  role: string
  status: EnableStatus
  updatedAt: string
}

export interface RoleRecord {
  id: string
  name: string
  code: string
  remark: string
  userCount: number
  status: EnableStatus
  updatedAt: string
  /** 授权的菜单 / 按钮 id */
  menuIds: string[]
}

export type MenuType = 'directory' | 'menu' | 'button'

export interface MenuRecord {
  id: string
  parentId: string | null
  name: string
  type: MenuType
  path: string
  icon: string
  sort: number
  status: EnableStatus
  /** 按钮权限码，如 user:create */
  permission?: string
}

export interface DictTypeRecord {
  id: string
  name: string
  code: string
  remark: string
  status: EnableStatus
  updatedAt: string
}

export interface DictItemRecord {
  id: string
  typeCode: string
  label: string
  value: string
  sort: number
  status: EnableStatus
}

export interface ConfigRecord {
  id: string
  name: string
  key: string
  value: string
  remark: string
  updatedAt: string
}

export interface DeptRecord {
  id: string
  parentId: string | null
  name: string
  leader: string
  phone: string
  sort: number
  status: EnableStatus
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled'

export interface OrderRecord {
  id: string
  orderNo: string
  customer: string
  product: string
  amount: number
  status: OrderStatus
  createdAt: string
}

export type ProductStatus = 'on' | 'off'

export interface ProductRecord {
  id: string
  name: string
  sku: string
  category: string
  price: number
  stock: number
  status: ProductStatus
  updatedAt: string
}

export interface OperationLogRecord {
  id: string
  module: string
  action: string
  operator: string
  ip: string
  result: 'success' | 'fail'
  createdAt: string
}

export interface LoginLogRecord {
  id: string
  username: string
  ip: string
  location: string
  client: string
  result: 'success' | 'fail'
  createdAt: string
}

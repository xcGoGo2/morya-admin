import type {
  ActivityItem,
  DeviceItem,
  NotifyItem,
  StatItem,
  TodoItem,
  TrafficSource,
  VisitPoint,
} from '../types'

/** 通知中心数据 */
export const notifications: NotifyItem[] = [
  {
    id: 1,
    kind: 'notice',
    title: '系统版本升级通知',
    desc: 'Morya Admin v2.4.0 已发布，新增动态菜单与按钮级权限演示。',
    time: '10 分钟前',
    icon: 'bell',
    tone: 'primary',
    unread: true,
  },
  {
    id: 2,
    kind: 'notice',
    title: '安全提醒',
    desc: '检测到你的账号在新设备上登录，如非本人操作请立即修改密码。',
    time: '1 小时前',
    icon: 'alert-circle',
    tone: 'warn',
    unread: true,
  },
  {
    id: 3,
    kind: 'notice',
    title: '数据备份完成',
    desc: '今日 03:00 的自动数据备份已成功完成，共 128.6 MB。',
    time: '今天 03:00',
    icon: 'check',
    tone: 'success',
    unread: true,
  },
  {
    id: 4,
    kind: 'notice',
    title: '欢迎使用 Morya Admin',
    desc: '点击右上角头像可以进入个人中心、切换主题或锁定屏幕。',
    time: '昨天',
    icon: 'info-circle',
    tone: 'help',
    unread: false,
  },
  {
    id: 5,
    kind: 'message',
    title: '张三 评论了你的任务',
    desc: '「这个交互细节可以再调整一下，建议做成抽屉而不是弹窗。」',
    time: '20 分钟前',
    icon: 'message',
    tone: 'primary',
    unread: true,
  },
  {
    id: 6,
    kind: 'message',
    title: '李四 邀请你加入项目',
    desc: '你被邀请加入「电商后台重构」项目，点击查看项目详情。',
    time: '2 小时前',
    icon: 'users',
    tone: 'success',
    unread: true,
  },
  {
    id: 7,
    kind: 'todo',
    title: '审核新用户注册申请',
    desc: '共 12 条待审核，请尽快处理。',
    time: '今天 14:00 前',
    icon: 'clock',
    tone: 'warn',
    unread: false,
  },
  {
    id: 8,
    kind: 'todo',
    title: '完善角色权限配置',
    desc: '「运营专员」角色还有 4 个菜单未配置权限。',
    time: '今天 18:00 前',
    icon: 'file-text',
    tone: 'help',
    unread: false,
  },
]

/** 工作台 KPI */
export const stats: StatItem[] = [
  { label: '总用户数', value: '12,846', trend: '12.5%', hint: '较上周', up: true, icon: 'users', severity: 'primary' },
  { label: '今日订单', value: '1,024', trend: '8.2%', hint: '较昨日', up: true, icon: 'shopping-cart', severity: 'success' },
  { label: '本月销售额', value: '¥ 386,920', trend: '23.1%', hint: '较上月', up: true, icon: 'currency-yuan', severity: 'primary' },
  { label: '转化率', value: '3.86%', trend: '1.4%', hint: '较上周', up: false, icon: 'trending-up', severity: 'danger' },
]

/** 访问趋势（近 7 日） */
export const visitTrend: VisitPoint[] = [
  { date: '9/17', visits: 62, visitors: 41 },
  { date: '9/18', visits: 81, visitors: 49 },
  { date: '9/19', visits: 58, visitors: 37 },
  { date: '9/20', visits: 96, visitors: 58 },
  { date: '9/21', visits: 77, visitors: 47 },
  { date: '9/22', visits: 110, visitors: 66 },
  { date: '9/23', visits: 90, visitors: 55 },
]

/** 流量来源 */
export const trafficSources: TrafficSource[] = [
  { name: '直接访问', percent: 42, color: 'primary' },
  { name: '搜索引擎', percent: 26, color: 'help' },
  { name: '社交媒体', percent: 18, color: 'info' },
  { name: '其他渠道', percent: 14, color: 'warn' },
]

/** 待办事项 */
export const todos: TodoItem[] = [
  { id: 1, title: '审核新用户注册申请', priority: 'high', time: '10 分钟前', done: false },
  { id: 2, title: '处理 3 条待退款订单', priority: 'high', time: '1 小时前', done: false },
  { id: 3, title: '完善「运营专员」角色权限配置', priority: 'mid', time: '3 小时前', done: false },
  { id: 4, title: '更新系统安全策略文档', priority: 'low', time: '昨天 18:20', done: false },
]

/** 最近动态 */
export const activities: ActivityItem[] = [
  { id: 1, content: '张三 创建了新用户「lisi」', time: '10 分钟前', icon: 'user-plus', severity: 'info' },
  { id: 2, content: '系统完成每日数据备份', time: '1 小时前', icon: 'database', severity: 'success' },
  { id: 3, content: '李四 修改了角色「运营专员」的权限', time: '3 小时前', icon: 'shield-check', severity: 'info' },
  { id: 4, content: '王五 登录了系统', time: '昨天 18:20', icon: 'login', severity: 'warn' },
]

/** 登录设备 */
export const devices: DeviceItem[] = [
  { id: 1, name: 'MacBook Pro', client: 'Chrome 128', location: '武汉', time: '2 小时前', current: true },
  { id: 2, name: 'iPhone 15', client: 'Safari', location: '武汉', time: '昨天 20:30' },
  { id: 3, name: 'Windows PC', client: 'Edge 127', location: '上海', time: '9 月 20 日 11:20' },
]

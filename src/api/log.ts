import type { LoginLogRecord, OperationLogRecord } from '../types'

export const operationLogs: OperationLogRecord[] = [
  { id: 'op1', module: '用户管理', action: '新建用户「chenliu」', operator: 'admin', ip: '10.0.12.8', result: 'success', createdAt: '2026-09-23 10:21:08' },
  { id: 'op2', module: '角色管理', action: '修改角色「运营专员」权限', operator: 'admin', ip: '10.0.12.8', result: 'success', createdAt: '2026-09-23 09:58:41' },
  { id: 'op3', module: '商品管理', action: '下架商品「旧版试用套餐」', operator: 'zhouran', ip: '10.0.18.22', result: 'success', createdAt: '2026-09-22 17:12:03' },
  { id: 'op4', module: '订单管理', action: '导出订单明细', operator: 'zhouran', ip: '10.0.18.22', result: 'success', createdAt: '2026-09-22 16:05:19' },
  { id: 'op5', module: '部门管理', action: '调整「前端组」负责人', operator: 'linxiao', ip: '10.0.15.4', result: 'success', createdAt: '2026-09-22 11:40:55' },
  { id: 'op6', module: '菜单管理', action: '删除菜单「临时入口」', operator: 'admin', ip: '10.0.12.8', result: 'fail', createdAt: '2026-09-21 19:03:27' },
  { id: 'op7', module: '用户管理', action: '重置密码「wangwu」', operator: 'admin', ip: '10.0.12.8', result: 'success', createdAt: '2026-09-21 14:18:02' },
  { id: 'op8', module: '系统设置', action: '切换主题配置', operator: 'linxiao', ip: '10.0.15.4', result: 'success', createdAt: '2026-09-20 08:32:11' },
]

export const loginLogs: LoginLogRecord[] = [
  { id: 'lg1', username: 'admin', ip: '10.0.12.8', location: '武汉', client: 'Chrome 128 / macOS', result: 'success', createdAt: '2026-09-23 09:01:12' },
  { id: 'lg2', username: 'zhouran', ip: '10.0.18.22', location: '上海', client: 'Edge 127 / Windows', result: 'success', createdAt: '2026-09-23 08:46:33' },
  { id: 'lg3', username: 'linxiao', ip: '10.0.15.4', location: '武汉', client: 'Chrome 128 / macOS', result: 'success', createdAt: '2026-09-22 19:20:08' },
  { id: 'lg4', username: 'wangwu', ip: '120.55.8.19', location: '未知', client: 'Safari / iOS', result: 'fail', createdAt: '2026-09-22 18:11:44' },
  { id: 'lg5', username: 'chenliu', ip: '10.0.15.9', location: '武汉', client: 'Chrome 128 / Windows', result: 'success', createdAt: '2026-09-22 09:05:21' },
  { id: 'lg6', username: 'zhaosi', ip: '10.0.20.3', location: '杭州', client: 'Firefox 130 / Windows', result: 'success', createdAt: '2026-09-21 14:55:07' },
  { id: 'lg7', username: 'guest', ip: '203.0.113.66', location: '境外', client: 'Unknown', result: 'fail', createdAt: '2026-09-21 03:18:59' },
  { id: 'lg8', username: 'admin', ip: '10.0.12.8', location: '武汉', client: 'Chrome 128 / macOS', result: 'success', createdAt: '2026-09-20 21:40:15' },
]

import type { DeptRecord, MenuRecord, RoleRecord, UserRecord } from '../types'

export const users: UserRecord[] = [
  { id: 'u1', username: 'admin', nickname: '超级管理员', email: 'admin@morya.dev', phone: '138-0000-0001', dept: '总部', role: '超级管理员', status: 'active', updatedAt: '2026-09-22 10:20' },
  { id: 'u2', username: 'linxiao', nickname: '林晓', email: 'linxiao@morya.dev', phone: '138-0000-0002', dept: '研发中心', role: '研发工程师', status: 'active', updatedAt: '2026-09-21 16:40' },
  { id: 'u3', username: 'zhouran', nickname: '周然', email: 'zhouran@morya.dev', phone: '138-0000-0003', dept: '运营部', role: '运营专员', status: 'active', updatedAt: '2026-09-20 09:12' },
  { id: 'u4', username: 'wangwu', nickname: '王五', email: 'wangwu@morya.dev', phone: '138-0000-0004', dept: '市场部', role: '市场经理', status: 'inactive', updatedAt: '2026-09-18 14:05' },
  { id: 'u5', username: 'chenliu', nickname: '陈六', email: 'chenliu@morya.dev', phone: '138-0000-0005', dept: '研发中心', role: '研发工程师', status: 'active', updatedAt: '2026-09-17 11:33' },
  { id: 'u6', username: 'zhaosi', nickname: '赵四', email: 'zhaosi@morya.dev', phone: '138-0000-0006', dept: '财务部', role: '财务专员', status: 'active', updatedAt: '2026-09-15 08:50' },
]

export const roles: RoleRecord[] = [
  { id: 'r1', name: '超级管理员', code: 'admin', remark: '拥有全部菜单与按钮权限', userCount: 1, status: 'active', updatedAt: '2026-09-01' },
  { id: 'r2', name: '研发工程师', code: 'dev', remark: '可访问业务模块与个人中心', userCount: 8, status: 'active', updatedAt: '2026-09-10' },
  { id: 'r3', name: '运营专员', code: 'ops', remark: '订单与商品管理，不含系统配置', userCount: 5, status: 'active', updatedAt: '2026-09-12' },
  { id: 'r4', name: '市场经理', code: 'market', remark: '查看仪表盘与营销相关数据', userCount: 3, status: 'active', updatedAt: '2026-09-08' },
  { id: 'r5', name: '财务专员', code: 'finance', remark: '只读订单金额与结算报表', userCount: 2, status: 'inactive', updatedAt: '2026-08-28' },
]

export const menus: MenuRecord[] = [
  { id: 'm1', parentId: null, name: '工作台', type: 'menu', path: '/dashboard', icon: 'layout-dashboard', sort: 1, status: 'active' },
  { id: 'm2', parentId: null, name: '系统管理', type: 'directory', path: '/system', icon: 'settings', sort: 2, status: 'active' },
  { id: 'm21', parentId: 'm2', name: '用户管理', type: 'menu', path: '/system/user', icon: 'users', sort: 1, status: 'active' },
  { id: 'm211', parentId: 'm21', name: '新建用户', type: 'button', path: '', icon: '', sort: 1, status: 'active' },
  { id: 'm212', parentId: 'm21', name: '删除用户', type: 'button', path: '', icon: '', sort: 2, status: 'active' },
  { id: 'm22', parentId: 'm2', name: '角色管理', type: 'menu', path: '/system/role', icon: 'shield-check', sort: 2, status: 'active' },
  { id: 'm23', parentId: 'm2', name: '菜单管理', type: 'menu', path: '/system/menu', icon: 'list', sort: 3, status: 'active' },
  { id: 'm24', parentId: 'm2', name: '部门管理', type: 'menu', path: '/system/dept', icon: 'sitemap', sort: 4, status: 'active' },
  { id: 'm3', parentId: null, name: '业务管理', type: 'directory', path: '/business', icon: 'shopping-cart', sort: 3, status: 'active' },
  { id: 'm31', parentId: 'm3', name: '订单管理', type: 'menu', path: '/business/order', icon: 'file-invoice', sort: 1, status: 'active' },
  { id: 'm32', parentId: 'm3', name: '商品管理', type: 'menu', path: '/business/product', icon: 'box', sort: 2, status: 'active' },
  { id: 'm4', parentId: null, name: '日志管理', type: 'directory', path: '/log', icon: 'file-text', sort: 4, status: 'active' },
  { id: 'm41', parentId: 'm4', name: '操作日志', type: 'menu', path: '/log/operation', icon: 'file-analytics', sort: 1, status: 'active' },
  { id: 'm42', parentId: 'm4', name: '登录日志', type: 'menu', path: '/log/login', icon: 'history', sort: 2, status: 'active' },
]

export const depts: DeptRecord[] = [
  { id: 'd1', parentId: null, name: '总部', leader: '张总', phone: '027-8888-0001', sort: 1, status: 'active' },
  { id: 'd2', parentId: 'd1', name: '研发中心', leader: '林晓', phone: '027-8888-1001', sort: 1, status: 'active' },
  { id: 'd21', parentId: 'd2', name: '前端组', leader: '陈六', phone: '027-8888-1101', sort: 1, status: 'active' },
  { id: 'd22', parentId: 'd2', name: '后端组', leader: '刘七', phone: '027-8888-1201', sort: 2, status: 'active' },
  { id: 'd3', parentId: 'd1', name: '运营部', leader: '周然', phone: '027-8888-2001', sort: 2, status: 'active' },
  { id: 'd4', parentId: 'd1', name: '市场部', leader: '王五', phone: '027-8888-3001', sort: 3, status: 'active' },
  { id: 'd5', parentId: 'd1', name: '财务部', leader: '赵四', phone: '027-8888-4001', sort: 4, status: 'inactive' },
]

export const deptOptions = [
  { label: '总部', value: '总部' },
  { label: '研发中心', value: '研发中心' },
  { label: '运营部', value: '运营部' },
  { label: '市场部', value: '市场部' },
  { label: '财务部', value: '财务部' },
]

export const roleOptions = roles.map(r => ({ label: r.name, value: r.name }))

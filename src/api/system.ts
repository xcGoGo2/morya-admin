import type {
  ConfigRecord,
  DeptRecord,
  DictItemRecord,
  DictTypeRecord,
  MenuRecord,
  RoleRecord,
  UserRecord,
} from '../types'

export const users: UserRecord[] = [
  { id: 'u1', username: 'admin', nickname: '超级管理员', email: 'admin@morya.dev', phone: '138-0000-0001', dept: '总部', role: '超级管理员', status: 'active', updatedAt: '2026-09-22 10:20' },
  { id: 'u2', username: 'linxiao', nickname: '林晓', email: 'linxiao@morya.dev', phone: '138-0000-0002', dept: '研发中心', role: '研发工程师', status: 'active', updatedAt: '2026-09-21 16:40' },
  { id: 'u3', username: 'ops', nickname: '周然', email: 'ops@morya.dev', phone: '138-0000-0003', dept: '运营部', role: '运营专员', status: 'active', updatedAt: '2026-09-20 09:12' },
  { id: 'u4', username: 'wangwu', nickname: '王五', email: 'wangwu@morya.dev', phone: '138-0000-0004', dept: '市场部', role: '市场经理', status: 'inactive', updatedAt: '2026-09-18 14:05' },
  { id: 'u5', username: 'chenliu', nickname: '陈六', email: 'chenliu@morya.dev', phone: '138-0000-0005', dept: '研发中心', role: '研发工程师', status: 'active', updatedAt: '2026-09-17 11:33' },
  { id: 'u6', username: 'zhaosi', nickname: '赵四', email: 'zhaosi@morya.dev', phone: '138-0000-0006', dept: '财务部', role: '财务专员', status: 'active', updatedAt: '2026-09-15 08:50' },
]

/** 全量菜单 id（含按钮），超管默认拥有 */
export const ALL_MENU_IDS = [
  'm1',
  'm2', 'm21', 'm211', 'm212', 'm22', 'm23', 'm24', 'm25', 'm26',
  'm3', 'm31', 'm311', 'm312', 'm32',
  'm4', 'm41', 'm42',
  'm5', 'm51', 'm52', 'm53',
  'm6',
] as const

const OPS_MENU_IDS = [
  'm1',
  'm3', 'm31', 'm311', 'm312', 'm32',
  'm4', 'm41', 'm42',
  'm5', 'm51', 'm52', 'm53',
  'm6',
]

const DEV_MENU_IDS = [
  'm1',
  'm2', 'm21', 'm211', 'm212', 'm22', 'm23', 'm24',
  'm3', 'm31', 'm311', 'm312', 'm32',
  'm4', 'm41', 'm42',
  'm5', 'm51', 'm52', 'm53',
  'm6',
]

const MARKET_MENU_IDS = [
  'm1',
  'm3', 'm32',
  'm5', 'm51', 'm52', 'm53',
  'm6',
]

const FINANCE_MENU_IDS = [
  'm1',
  'm3', 'm31',
  'm4', 'm41',
  'm6',
]

export const roles: RoleRecord[] = [
  { id: 'r1', name: '超级管理员', code: 'admin', remark: '拥有全部菜单与按钮权限', userCount: 1, status: 'active', updatedAt: '2026-09-01', menuIds: [...ALL_MENU_IDS] },
  { id: 'r2', name: '研发工程师', code: 'dev', remark: '可访问业务模块与系统基础配置', userCount: 8, status: 'active', updatedAt: '2026-09-10', menuIds: [...DEV_MENU_IDS] },
  { id: 'r3', name: '运营专员', code: 'ops', remark: '订单与商品管理，不含系统配置', userCount: 5, status: 'active', updatedAt: '2026-09-12', menuIds: [...OPS_MENU_IDS] },
  { id: 'r4', name: '市场经理', code: 'market', remark: '查看仪表盘与商品相关数据', userCount: 3, status: 'active', updatedAt: '2026-09-08', menuIds: [...MARKET_MENU_IDS] },
  { id: 'r5', name: '财务专员', code: 'finance', remark: '只读订单与操作日志', userCount: 2, status: 'inactive', updatedAt: '2026-08-28', menuIds: [...FINANCE_MENU_IDS] },
]

export const menus: MenuRecord[] = [
  { id: 'm1', parentId: null, name: '工作台', type: 'menu', path: '/dashboard', icon: 'layout-dashboard', sort: 1, status: 'active' },
  { id: 'm2', parentId: null, name: '系统管理', type: 'directory', path: '/system', icon: 'settings', sort: 2, status: 'active' },
  { id: 'm21', parentId: 'm2', name: '用户管理', type: 'menu', path: '/system/user', icon: 'users', sort: 1, status: 'active' },
  { id: 'm211', parentId: 'm21', name: '新建用户', type: 'button', path: '', icon: '', sort: 1, status: 'active', permission: 'user:create' },
  { id: 'm212', parentId: 'm21', name: '删除用户', type: 'button', path: '', icon: '', sort: 2, status: 'active', permission: 'user:delete' },
  { id: 'm22', parentId: 'm2', name: '角色管理', type: 'menu', path: '/system/role', icon: 'shield-check', sort: 2, status: 'active' },
  { id: 'm23', parentId: 'm2', name: '菜单管理', type: 'menu', path: '/system/menu', icon: 'list', sort: 3, status: 'active' },
  { id: 'm24', parentId: 'm2', name: '部门管理', type: 'menu', path: '/system/dept', icon: 'sitemap', sort: 4, status: 'active' },
  { id: 'm25', parentId: 'm2', name: '字典管理', type: 'menu', path: '/system/dict', icon: 'list', sort: 5, status: 'active' },
  { id: 'm26', parentId: 'm2', name: '参数配置', type: 'menu', path: '/system/config', icon: 'settings', sort: 6, status: 'active' },
  { id: 'm3', parentId: null, name: '业务管理', type: 'directory', path: '/business', icon: 'shopping-cart', sort: 3, status: 'active' },
  { id: 'm31', parentId: 'm3', name: '订单管理', type: 'menu', path: '/business/order', icon: 'file-invoice', sort: 1, status: 'active' },
  { id: 'm311', parentId: 'm31', name: '确认发货', type: 'button', path: '', icon: '', sort: 1, status: 'active', permission: 'order:ship' },
  { id: 'm312', parentId: 'm31', name: '取消订单', type: 'button', path: '', icon: '', sort: 2, status: 'active', permission: 'order:cancel' },
  { id: 'm32', parentId: 'm3', name: '商品管理', type: 'menu', path: '/business/product', icon: 'box', sort: 2, status: 'active' },
  { id: 'm4', parentId: null, name: '日志管理', type: 'directory', path: '/log', icon: 'file-text', sort: 4, status: 'active' },
  { id: 'm41', parentId: 'm4', name: '操作日志', type: 'menu', path: '/log/operation', icon: 'file-analytics', sort: 1, status: 'active' },
  { id: 'm42', parentId: 'm4', name: '登录日志', type: 'menu', path: '/log/login', icon: 'history', sort: 2, status: 'active' },
  { id: 'm5', parentId: null, name: '异常页面', type: 'directory', path: '/error', icon: 'alert-circle', sort: 5, status: 'active' },
  { id: 'm51', parentId: 'm5', name: '403 页面', type: 'menu', path: '/403', icon: 'ban', sort: 1, status: 'active' },
  { id: 'm52', parentId: 'm5', name: '404 页面', type: 'menu', path: '/404', icon: 'ban', sort: 2, status: 'active' },
  { id: 'm53', parentId: 'm5', name: '500 页面', type: 'menu', path: '/500', icon: 'alert-circle', sort: 3, status: 'active' },
  { id: 'm6', parentId: null, name: '消息中心', type: 'menu', path: '/notify', icon: 'bell', sort: 6, status: 'active' },
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

export const dictTypes: DictTypeRecord[] = [
  { id: 'dt1', name: '用户状态', code: 'sys_user_status', remark: '账号启用停用', status: 'active', updatedAt: '2026-09-01' },
  { id: 'dt2', name: '订单状态', code: 'biz_order_status', remark: '订单流转状态', status: 'active', updatedAt: '2026-09-10' },
  { id: 'dt3', name: '商品分类', code: 'biz_product_category', remark: '商品类目', status: 'active', updatedAt: '2026-09-12' },
  { id: 'dt4', name: '通知类型', code: 'sys_notify_kind', remark: '消息中心分类', status: 'inactive', updatedAt: '2026-08-20' },
]

export const dictItems: DictItemRecord[] = [
  { id: 'di1', typeCode: 'sys_user_status', label: '启用', value: 'active', sort: 1, status: 'active' },
  { id: 'di2', typeCode: 'sys_user_status', label: '停用', value: 'inactive', sort: 2, status: 'active' },
  { id: 'di3', typeCode: 'biz_order_status', label: '待支付', value: 'pending', sort: 1, status: 'active' },
  { id: 'di4', typeCode: 'biz_order_status', label: '已支付', value: 'paid', sort: 2, status: 'active' },
  { id: 'di5', typeCode: 'biz_order_status', label: '已发货', value: 'shipped', sort: 3, status: 'active' },
  { id: 'di6', typeCode: 'biz_product_category', label: '数码', value: 'digital', sort: 1, status: 'active' },
  { id: 'di7', typeCode: 'biz_product_category', label: '家居', value: 'home', sort: 2, status: 'active' },
]

export const configs: ConfigRecord[] = [
  { id: 'c1', name: '系统名称', key: 'sys.name', value: 'Morya Admin', remark: '浏览器标题与品牌文案', updatedAt: '2026-09-01' },
  { id: 'c2', name: '默认首页', key: 'sys.home', value: '/dashboard', remark: '登录后默认跳转', updatedAt: '2026-09-05' },
  { id: 'c3', name: '会话超时（分钟）', key: 'sys.session.timeout', value: '120', remark: '演示用，未接真实计时', updatedAt: '2026-09-08' },
  { id: 'c4', name: '允许注册', key: 'sys.account.register', value: 'false', remark: '是否开放自助注册', updatedAt: '2026-09-12' },
]

export const deptOptions = [
  { label: '总部', value: '总部' },
  { label: '研发中心', value: '研发中心' },
  { label: '运营部', value: '运营部' },
  { label: '市场部', value: '市场部' },
  { label: '财务部', value: '财务部' },
]

export const roleOptions = roles.map(r => ({ label: r.name, value: r.name }))

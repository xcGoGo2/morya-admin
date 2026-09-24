import type { OrderRecord, ProductRecord } from '../types'

export const orders: OrderRecord[] = [
  { id: 'o1', orderNo: 'MO20260923001', customer: '武汉星河科技', product: 'Morya Pro 年订阅', amount: 12800, status: 'paid', createdAt: '2026-09-23 09:12' },
  { id: 'o2', orderNo: 'MO20260922018', customer: '上海云启网络', product: '企业席位扩容包', amount: 3600, status: 'shipped', createdAt: '2026-09-22 16:40' },
  { id: 'o3', orderNo: 'MO20260922007', customer: '深圳蓝湾贸易', product: 'Morya 标准版', amount: 1999, status: 'pending', createdAt: '2026-09-22 11:05' },
  { id: 'o4', orderNo: 'MO20260921033', customer: '北京启航咨询', product: '私有化部署服务', amount: 68000, status: 'completed', createdAt: '2026-09-21 14:28' },
  { id: 'o5', orderNo: 'MO20260920012', customer: '成都青禾文创', product: 'Morya 标准版', amount: 1999, status: 'cancelled', createdAt: '2026-09-20 10:16' },
  { id: 'o6', orderNo: 'MO20260919009', customer: '杭州墨白设计', product: '设计资源扩展包', amount: 680, status: 'completed', createdAt: '2026-09-19 18:02' },
  { id: 'o7', orderNo: 'MO20260918021', customer: '南京智造工场', product: 'Morya Pro 年订阅', amount: 12800, status: 'paid', createdAt: '2026-09-18 09:44' },
  { id: 'o8', orderNo: 'MO20260917004', customer: '广州南岸电商', product: '企业席位扩容包', amount: 3600, status: 'shipped', createdAt: '2026-09-17 15:30' },
]

export const products: ProductRecord[] = [
  { id: 'p1', name: 'Morya Pro 年订阅', sku: 'MY-PRO-Y', category: '订阅', price: 12800, stock: 999, status: 'on', updatedAt: '2026-09-20' },
  { id: 'p2', name: 'Morya 标准版', sku: 'MY-STD-Y', category: '订阅', price: 1999, stock: 999, status: 'on', updatedAt: '2026-09-18' },
  { id: 'p3', name: '企业席位扩容包', sku: 'MY-SEAT-10', category: '增值', price: 3600, stock: 200, status: 'on', updatedAt: '2026-09-15' },
  { id: 'p4', name: '私有化部署服务', sku: 'MY-PRIV', category: '服务', price: 68000, stock: 20, status: 'on', updatedAt: '2026-09-12' },
  { id: 'p5', name: '设计资源扩展包', sku: 'MY-ASSET', category: '增值', price: 680, stock: 500, status: 'on', updatedAt: '2026-09-10' },
  { id: 'p6', name: '旧版试用套餐', sku: 'MY-TRIAL-L', category: '订阅', price: 0, stock: 0, status: 'off', updatedAt: '2026-08-01' },
]

export const productCategoryOptions = [
  { label: '订阅', value: '订阅' },
  { label: '增值', value: '增值' },
  { label: '服务', value: '服务' },
]

export const orderStatusOptions = [
  { label: '全部', value: '' },
  { label: '待支付', value: 'pending' },
  { label: '已支付', value: 'paid' },
  { label: '已发货', value: 'shipped' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' },
]

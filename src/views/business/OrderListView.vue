<script setup lang="ts">
import type { OrderRecord, OrderStatus } from '../../types'
import {
  MButton,
  MDrawer,
  MEmpty,
  MInput,
  MPageContent,
  MPageFilterChips,
  MPageFilters,
  MPageHeader,
  MSelect,
  MSpace,
  MStatus,
  MTable,
  MTag,
  message,
} from 'morya-ui'
import { computed, reactive, ref } from 'vue'
import { orderStatusOptions, orders as seedOrders } from '../../api/business'

const rows = ref<OrderRecord[]>(seedOrders.map(o => ({ ...o })))
const keyword = ref('')
const status = ref<string | undefined>()
const applied = reactive({ keyword: '', status: undefined as string | undefined })
const detailOpen = ref(false)
const current = ref<OrderRecord | null>(null)

const statusMeta: Record<OrderStatus, { label: string, severity: 'warn' | 'primary' | 'info' | 'success' | 'secondary' }> = {
  pending: { label: '待支付', severity: 'warn' },
  paid: { label: '已支付', severity: 'primary' },
  shipped: { label: '已发货', severity: 'info' },
  completed: { label: '已完成', severity: 'success' },
  cancelled: { label: '已取消', severity: 'secondary' },
}

const columns = [
  { key: 'orderNo', label: '订单号', width: 160 },
  { key: 'customer', label: '客户' },
  { key: 'product', label: '商品' },
  { key: 'amount', label: '金额', width: 110 },
  { key: 'status', label: '状态', width: 110 },
  { key: 'createdAt', label: '下单时间', width: 160 },
  { key: 'actions', label: '操作', width: 160 },
]

const filteredRows = computed(() => {
  const kw = applied.keyword.trim().toLowerCase()
  return rows.value.filter((row) => {
    if (kw && ![row.orderNo, row.customer, row.product].some(v => v.toLowerCase().includes(kw)))
      return false
    if (applied.status && row.status !== applied.status)
      return false
    return true
  })
})

const activeFilters = computed(() => {
  const items: Array<{ key: string, label: string }> = []
  if (applied.keyword.trim())
    items.push({ key: 'keyword', label: `关键词：${applied.keyword.trim()}` })
  if (applied.status) {
    const label = orderStatusOptions.find(o => o.value === applied.status)?.label ?? applied.status
    items.push({ key: 'status', label: `状态：${label}` })
  }
  return items
})

function applyFilters() {
  applied.keyword = keyword.value
  applied.status = status.value || undefined
}

function resetFilters() {
  keyword.value = ''
  status.value = undefined
  applyFilters()
}

function clearFilter(key: string) {
  if (key === 'keyword')
    keyword.value = ''
  if (key === 'status')
    status.value = undefined
  applyFilters()
}

function openDetailById(id: unknown) {
  current.value = rows.value.find(r => r.id === String(id)) ?? null
  detailOpen.value = !!current.value
}

function markShipped() {
  if (!current.value || current.value.status !== 'paid')
    return
  current.value.status = 'shipped'
  message.success(`订单 ${current.value.orderNo} 已发货`)
}

function cancelOrderById(id: unknown) {
  const row = rows.value.find(r => r.id === String(id))
  if (!row)
    return
  if (row.status === 'completed' || row.status === 'cancelled') {
    message.info('该订单不可取消')
    return
  }
  row.status = 'cancelled'
  message.success(`订单 ${row.orderNo} 已取消`)
}

function formatAmount(value: number) {
  return `¥ ${value.toLocaleString('zh-CN')}`
}

function canCancel(statusValue: unknown) {
  return statusValue !== 'cancelled' && statusValue !== 'completed'
}
</script>

<template>
  <MPageContent aria-label="订单管理">
    <MPageHeader title="订单管理" description="查看支付进度，处理发货与取消。">
      <template #actions>
        <MButton
          label="导出明细"
          icon="download"
          severity="secondary"
          @click="message.success('已开始导出当前筛选结果')"
        />
      </template>
    </MPageHeader>

    <MPageFilters aria-label="筛选" variant="filled">
      <MSpace wrap>
        <MInput v-model="keyword" placeholder="订单号 / 客户 / 商品" clearable style="width: 16rem" />
        <MSelect
          v-model="status"
          :options="orderStatusOptions"
          placeholder="订单状态"
          clearable
          style="width: 10rem"
        />
        <MButton label="查询" severity="secondary" @click="applyFilters" />
        <MButton label="重置" severity="secondary" text @click="resetFilters" />
      </MSpace>
    </MPageFilters>

    <MPageFilterChips v-if="activeFilters.length" label="已选" aria-label="已选筛选">
      <MTag
        v-for="item in activeFilters"
        :key="item.key"
        :value="item.label"
        size="small"
        bordered
        closable
        @close="clearFilter(item.key)"
      />
    </MPageFilterChips>

    <MTable
      :columns="columns"
      :rows="filteredRows"
      :rows-per-page="8"
      paginator
      striped
      bordered
      row-key="id"
      aria-label="订单列表"
    >
      <template #cell-amount="{ value }">
        {{ formatAmount(Number(value)) }}
      </template>
      <template #cell-status="{ value }">
        <MStatus
          :label="statusMeta[value as OrderStatus].label"
          :severity="statusMeta[value as OrderStatus].severity"
        />
      </template>
      <template #cell-actions="{ row }">
        <MSpace>
          <MButton label="详情" severity="secondary" size="small" text @click="openDetailById(row.id)" />
          <MButton
            v-if="canCancel(row.status)"
            label="取消"
            severity="danger"
            size="small"
            text
            @click="cancelOrderById(row.id)"
          />
        </MSpace>
      </template>
      <template #empty>
        <MEmpty title="没有匹配的订单" description="调整筛选条件后再试。" icon="file-invoice" />
      </template>
    </MTable>

    <MDrawer v-model="detailOpen" header="订单详情" position="right" width="28rem">
      <template v-if="current">
        <dl class="detail">
          <div><dt>订单号</dt><dd>{{ current.orderNo }}</dd></div>
          <div><dt>客户</dt><dd>{{ current.customer }}</dd></div>
          <div><dt>商品</dt><dd>{{ current.product }}</dd></div>
          <div><dt>金额</dt><dd>{{ formatAmount(current.amount) }}</dd></div>
          <div>
            <dt>状态</dt>
            <dd>
              <MStatus
                :label="statusMeta[current.status].label"
                :severity="statusMeta[current.status].severity"
              />
            </dd>
          </div>
          <div><dt>下单时间</dt><dd>{{ current.createdAt }}</dd></div>
        </dl>
        <MSpace style="margin-top: var(--m-space-6)">
          <MButton
            v-if="current.status === 'paid'"
            label="确认发货"
            severity="primary"
            @click="markShipped"
          />
          <MButton label="关闭" severity="secondary" text @click="detailOpen = false" />
        </MSpace>
      </template>
    </MDrawer>
  </MPageContent>
</template>

<style scoped>
.detail {
  margin: 0;
  display: grid;
  gap: var(--m-space-4);
}

.detail > div {
  display: grid;
  gap: var(--m-space-1);
}

.detail dt {
  color: var(--m-color-text-muted);
  font-size: var(--m-font-size-sm);
}

.detail dd {
  margin: 0;
  color: var(--m-color-text);
}
</style>

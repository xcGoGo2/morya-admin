<script setup lang="ts">
import type { LoginLogRecord } from '../../types'
import {
  MButton,
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
import { loginLogs as seedLogs } from '../../api/log'

const rows = ref<LoginLogRecord[]>(seedLogs.map(l => ({ ...l })))
const keyword = ref('')
const result = ref<string | undefined>()
const applied = reactive({ keyword: '', result: undefined as string | undefined })

const resultOptions = [
  { label: '全部结果', value: '' },
  { label: '成功', value: 'success' },
  { label: '失败', value: 'fail' },
]

const columns = [
  { key: 'createdAt', label: '时间', width: 170 },
  { key: 'username', label: '账号', width: 120 },
  { key: 'ip', label: 'IP', width: 130 },
  { key: 'location', label: '地点', width: 100 },
  { key: 'client', label: '客户端' },
  { key: 'result', label: '结果', width: 100 },
]

const filteredRows = computed(() => {
  const kw = applied.keyword.trim().toLowerCase()
  return rows.value.filter((row) => {
    if (kw && ![row.username, row.ip, row.location, row.client].some(v => v.toLowerCase().includes(kw)))
      return false
    if (applied.result && row.result !== applied.result)
      return false
    return true
  })
})

const activeFilters = computed(() => {
  const items: Array<{ key: string, label: string }> = []
  if (applied.keyword.trim())
    items.push({ key: 'keyword', label: `关键词：${applied.keyword.trim()}` })
  if (applied.result) {
    const label = resultOptions.find(o => o.value === applied.result)?.label ?? applied.result
    items.push({ key: 'result', label: `结果：${label}` })
  }
  return items
})

function applyFilters() {
  applied.keyword = keyword.value
  applied.result = result.value || undefined
}

function resetFilters() {
  keyword.value = ''
  result.value = undefined
  applyFilters()
}

function clearFilter(key: string) {
  if (key === 'keyword')
    keyword.value = ''
  if (key === 'result')
    result.value = undefined
  applyFilters()
}
</script>

<template>
  <MPageContent fill aria-label="登录日志">
    <MPageHeader title="登录日志" description="记录账号登录成功与失败，辅助排查异常访问。">
      <template #actions>
        <MButton
          label="刷新"
          icon="refresh"
          severity="secondary"
          @click="message.success('已刷新登录日志')"
        />
      </template>
    </MPageHeader>

    <MPageFilters aria-label="筛选" variant="filled">
      <MSpace wrap>
        <MInput v-model="keyword" placeholder="账号 / IP / 地点 / 客户端" clearable style="width: 18rem" />
        <MSelect
          v-model="result"
          :options="resultOptions"
          placeholder="结果"
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
      :rows-per-page="10"
      fill
      paginator
      striped
      bordered
      row-key="id"
      aria-label="登录日志列表"
    >
      <template #cell-result="{ value }">
        <MStatus
          :label="value === 'success' ? '成功' : '失败'"
          :severity="value === 'success' ? 'success' : 'danger'"
        />
      </template>
      <template #empty>
        <MEmpty title="暂无登录日志" description="有登录尝试后会在此出现。" icon="history" />
      </template>
    </MTable>
  </MPageContent>
</template>

<script setup lang="ts">
import type { OperationLogRecord } from '../../types'
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
import { operationLogs as seedLogs } from '../../api/log'

const rows = ref<OperationLogRecord[]>(seedLogs.map(l => ({ ...l })))
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
  { key: 'module', label: '模块', width: 120 },
  { key: 'action', label: '操作内容' },
  { key: 'operator', label: '操作人', width: 100 },
  { key: 'ip', label: 'IP', width: 120 },
  { key: 'result', label: '结果', width: 100 },
]

const filteredRows = computed(() => {
  const kw = applied.keyword.trim().toLowerCase()
  return rows.value.filter((row) => {
    if (kw && ![row.module, row.action, row.operator, row.ip].some(v => v.toLowerCase().includes(kw)))
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
  <MPageContent aria-label="操作日志">
    <MPageHeader title="操作日志" description="审计后台关键写操作，便于追溯变更来源。">
      <template #actions>
        <MButton
          label="清空筛选"
          icon="refresh"
          severity="secondary"
          @click="resetFilters(); message.info('已重置筛选')"
        />
      </template>
    </MPageHeader>

    <MPageFilters aria-label="筛选" variant="filled">
      <MSpace wrap>
        <MInput v-model="keyword" placeholder="模块 / 内容 / 操作人 / IP" clearable style="width: 18rem" />
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
      paginator
      striped
      bordered
      row-key="id"
      aria-label="操作日志列表"
    >
      <template #cell-result="{ value }">
        <MStatus
          :label="value === 'success' ? '成功' : '失败'"
          :severity="value === 'success' ? 'success' : 'danger'"
        />
      </template>
      <template #empty>
        <MEmpty title="暂无操作日志" description="有写操作发生后会在此出现。" icon="file-analytics" />
      </template>
    </MTable>
  </MPageContent>
</template>

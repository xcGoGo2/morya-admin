<script setup lang="ts">
import type { NotifyItem, NotifyKind } from '../../types'
import {
  MButton,
  MEmpty,
  message,
  MPageContent,
  MPageHeader,
  MSelectButton,
  MStatus,
  MTable,
  MTag,
} from 'morya-ui'
import { computed, ref } from 'vue'
import { notifications } from '../../api/mock'

const kind = ref<NotifyKind | 'all'>('all')
const kindModel = computed<string>({
  get: () => kind.value,
  set: v => (kind.value = v as NotifyKind | 'all'),
})
const items = ref<NotifyItem[]>(notifications.map(n => ({ ...n })))

const kindMeta: Record<NotifyKind, { label: string, severity: 'primary' | 'info' | 'warning' }> = {
  notice: { label: '通知', severity: 'primary' },
  message: { label: '消息', severity: 'info' },
  todo: { label: '待办', severity: 'warning' },
}

const kindOptions = [
  { label: '全部', value: 'all' },
  { label: '通知', value: 'notice' },
  { label: '消息', value: 'message' },
  { label: '待办', value: 'todo' },
]

const columns = [
  { key: 'kind', label: '类型', width: 100 },
  { key: 'title', label: '标题' },
  { key: 'desc', label: '内容' },
  { key: 'time', label: '时间', width: 140 },
  { key: 'unread', label: '状态', width: 100 },
  { key: 'actions', label: '操作', width: 100 },
]

const filtered = computed(() =>
  items.value.filter(i => kind.value === 'all' || i.kind === kind.value),
)

const unreadTotal = computed(() => items.value.filter(i => i.unread).length)

function readAll() {
  items.value.forEach(i => (i.unread = false))
  message.success('已全部标为已读')
}

function readOne(id: unknown) {
  const item = items.value.find(i => i.id === Number(id))
  if (item) {
    item.unread = false
    message.success('已标为已读')
  }
}
</script>

<template>
  <MPageContent fill aria-label="消息中心">
    <MPageHeader title="消息中心" description="汇总通知、消息与待办，可从顶栏铃铛「查看全部」进入。">
      <template #actions>
        <MButton
          label="全部已读"
          icon="check"
          severity="secondary"
          :disabled="!unreadTotal"
          @click="readAll"
        />
      </template>
    </MPageHeader>

    <MSelectButton
      v-model="kindModel"
      class="notify-filters"
      :options="kindOptions"
      aria-label="消息分类"
    />

    <MTable
      :columns="columns"
      :rows="filtered"
      :rows-per-page="10"
      fill
      paginator
      striped
      bordered
      row-key="id"
      aria-label="消息列表"
    >
      <template #cell-kind="{ value }">
        <MTag
          :value="kindMeta[value as NotifyKind].label"
          :severity="kindMeta[value as NotifyKind].severity"
          size="small"
        />
      </template>
      <template #cell-unread="{ value }">
        <MStatus
          :label="value ? '未读' : '已读'"
          :severity="value ? 'warning' : 'secondary'"
        />
      </template>
      <template #cell-actions="{ row }">
        <MButton
          v-if="row.unread"
          label="标已读"
          severity="secondary"
          size="small"
          text
          @click="readOne(row.id)"
        />
      </template>
      <template #empty>
        <MEmpty title="暂无消息" description="切换分类或稍后再来查看。" icon="bell" />
      </template>
    </MTable>
  </MPageContent>
</template>

<style scoped>
.notify-filters {
  margin-bottom: var(--m-space-2);
}
</style>

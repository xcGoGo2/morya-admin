<script setup lang="ts">
import type { NotifyItem, NotifyKind } from '../../types'
import {
  MButton,
  MEmpty,
  message,
  MPageContent,
  MPageHeader,
  MSpace,
  MStatus,
  MTable,
  MTag,
} from 'morya-ui'
import { computed, ref } from 'vue'
import { notifications } from '../../api/mock'

const kind = ref<NotifyKind | 'all'>('all')
const items = ref<NotifyItem[]>(notifications.map(n => ({ ...n })))

const kindMeta: Record<NotifyKind, { label: string, severity: 'primary' | 'info' | 'warn' }> = {
  notice: { label: '通知', severity: 'primary' },
  message: { label: '消息', severity: 'info' },
  todo: { label: '待办', severity: 'warn' },
}

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

function setKind(next: NotifyKind | 'all') {
  kind.value = next
}

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

    <MSpace wrap class="notify-filters">
      <MTag
        value="全部"
        :severity="kind === 'all' ? 'primary' : 'secondary'"
        class="notify-filters__chip"
        @click="setKind('all')"
      />
      <MTag
        value="通知"
        :severity="kind === 'notice' ? 'primary' : 'secondary'"
        class="notify-filters__chip"
        @click="setKind('notice')"
      />
      <MTag
        value="消息"
        :severity="kind === 'message' ? 'primary' : 'secondary'"
        class="notify-filters__chip"
        @click="setKind('message')"
      />
      <MTag
        value="待办"
        :severity="kind === 'todo' ? 'primary' : 'secondary'"
        class="notify-filters__chip"
        @click="setKind('todo')"
      />
    </MSpace>

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
          :severity="value ? 'warn' : 'secondary'"
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

.notify-filters__chip {
  cursor: pointer;
  user-select: none;
}
</style>

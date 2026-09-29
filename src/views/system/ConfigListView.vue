<script setup lang="ts">
import type { FormInstance, FormRules } from 'morya-ui'
import type { ConfigRecord } from '../../types'
import {
  MButton,
  MDialog,
  MEmpty,
  message,
  MForm,
  MFormItem,
  MInput,
  MPageContent,
  MPageFilterChips,
  MPageFilters,
  MPageHeader,
  MSpace,
  MTable,
  MTag,
  MTextarea,
} from 'morya-ui'
import { computed, reactive, ref } from 'vue'
import { configs as seedConfigs } from '../../api/system'
import { nextId } from '../../utils/tree'

const rows = ref<ConfigRecord[]>(seedConfigs.map(c => ({ ...c })))
const keyword = ref('')
const applied = reactive({ keyword: '' })
const dialogOpen = ref(false)
const submitting = ref(false)
const editingId = ref<string | null>(null)
const formRef = ref<FormInstance | null>(null)

const model = reactive({
  name: '',
  key: '',
  value: '',
  remark: '',
})

const rules: FormRules = {
  name: { required: true, message: '请输入参数名称' },
  key: { required: true, message: '请输入参数键' },
  value: { required: true, message: '请输入参数值' },
}

const columns = [
  { key: 'name', label: '参数名称', width: 160 },
  { key: 'key', label: '参数键', width: 200 },
  { key: 'value', label: '参数值' },
  { key: 'remark', label: '说明' },
  { key: 'updatedAt', label: '更新时间', width: 140 },
  { key: 'actions', label: '操作', width: 100 },
]

const filteredRows = computed(() => {
  const kw = applied.keyword.trim().toLowerCase()
  return rows.value.filter((row) => {
    if (kw && ![row.name, row.key, row.value, row.remark].some(v => v.toLowerCase().includes(kw)))
      return false
    return true
  })
})

const activeFilters = computed(() => {
  const items: Array<{ key: string, label: string }> = []
  if (applied.keyword.trim())
    items.push({ key: 'keyword', label: `关键词：${applied.keyword.trim()}` })
  return items
})

function applyFilters() {
  applied.keyword = keyword.value
}

function resetFilters() {
  keyword.value = ''
  applyFilters()
}

function clearFilter(key: string) {
  if (key === 'keyword')
    keyword.value = ''
  applyFilters()
}

function resetModel() {
  model.name = ''
  model.key = ''
  model.value = ''
  model.remark = ''
  editingId.value = null
  formRef.value?.clearValidate()
}

function openCreate() {
  resetModel()
  dialogOpen.value = true
}

function openEditById(id: unknown) {
  const row = rows.value.find(r => r.id === String(id))
  if (!row)
    return
  editingId.value = row.id
  model.name = row.name
  model.key = row.key
  model.value = row.value
  model.remark = row.remark
  dialogOpen.value = true
}

async function onSave() {
  const { valid } = await formRef.value!.validate()
  if (!valid)
    return
  submitting.value = true
  try {
    const now = new Date().toISOString().slice(0, 10)
    if (editingId.value) {
      const target = rows.value.find(r => r.id === editingId.value)
      if (target) {
        Object.assign(target, {
          name: model.name,
          key: model.key,
          value: model.value,
          remark: model.remark,
          updatedAt: now,
        })
      }
      message.success('参数已更新')
    }
    else {
      rows.value.unshift({
        id: nextId('c'),
        name: model.name,
        key: model.key,
        value: model.value,
        remark: model.remark,
        updatedAt: now,
      })
      message.success('参数已创建')
    }
    dialogOpen.value = false
    resetModel()
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <MPageContent fill aria-label="参数配置">
    <MPageHeader title="参数配置" description="维护系统级键值参数，演示环境仅保存在内存中。">
      <template #actions>
        <MButton label="新建参数" icon="plus" severity="primary" @click="openCreate" />
      </template>
    </MPageHeader>

    <MPageFilters aria-label="筛选">
      <MSpace wrap>
        <MInput v-model="keyword" placeholder="搜索名称 / 键 / 值" clearable style="width: 16rem" />
      </MSpace>
      <template #actions>
        <MButton label="查询" severity="secondary" @click="applyFilters" />
        <MButton label="重置" severity="secondary" text @click="resetFilters" />
      </template>
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
      fill
      paginator
      striped
      bordered
      row-key="id"
      aria-label="参数列表"
    >
      <template #cell-actions="{ row }">
        <MButton label="编辑" severity="secondary" size="small" text @click="openEditById(row.id)" />
      </template>
      <template #empty>
        <MEmpty title="还没有参数" description="新建参数以配置系统行为。" icon="settings">
          <template #extra>
            <MButton label="新建参数" severity="primary" @click="openCreate" />
          </template>
        </MEmpty>
      </template>
    </MTable>

    <MDialog
      v-model="dialogOpen"
      :header="editingId ? '编辑参数' : '新建参数'"
      width="32rem"
      @close="resetModel"
    >
      <MForm ref="formRef" :model="model" :rules="rules" label-position="top" validate-on="submit" @submit="onSave">
        <MFormItem label="参数名称" name="name" required>
          <template #default="{ id, invalid }">
            <MInput :id="id" v-model="model.name" fluid :invalid="invalid" />
          </template>
        </MFormItem>
        <MFormItem label="参数键" name="key" required>
          <template #default="{ id, invalid }">
            <MInput :id="id" v-model="model.key" fluid :invalid="invalid" :disabled="!!editingId" />
          </template>
        </MFormItem>
        <MFormItem label="参数值" name="value" required>
          <template #default="{ id, invalid }">
            <MInput :id="id" v-model="model.value" fluid :invalid="invalid" />
          </template>
        </MFormItem>
        <MFormItem label="说明" name="remark">
          <template #default="{ id }">
            <MTextarea :id="id" v-model="model.remark" fluid :rows="3" />
          </template>
        </MFormItem>
        <MSpace style="justify-content: flex-end; margin-top: var(--m-space-4)">
          <MButton label="取消" severity="secondary" text @click="dialogOpen = false" />
          <MButton label="保存" severity="primary" native-type="submit" :loading="submitting" />
        </MSpace>
      </MForm>
    </MDialog>
  </MPageContent>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'morya-ui'
import type { RoleRecord } from '../../types'
import {
  MButton,
  MConfirmDialog,
  MDialog,
  MEmpty,
  MForm,
  MFormItem,
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
  MTextarea,
  message,
} from 'morya-ui'
import { computed, reactive, ref } from 'vue'
import { roles as seedRoles } from '../../api/system'
import { nextId } from '../../utils/tree'

const rows = ref<RoleRecord[]>(seedRoles.map(r => ({ ...r })))
const keyword = ref('')
const status = ref<string | undefined>()
const applied = reactive({ keyword: '', status: undefined as string | undefined })
const dialogOpen = ref(false)
const submitting = ref(false)
const editingId = ref<string | null>(null)
const pendingDelete = ref<RoleRecord | null>(null)
const formRef = ref<FormInstance | null>(null)

const statusOptions = [
  { label: '全部', value: '' },
  { label: '启用', value: 'active' },
  { label: '停用', value: 'inactive' },
]

const model = reactive({
  name: '',
  code: '',
  remark: '',
  status: 'active' as RoleRecord['status'],
})

const rules: FormRules = {
  name: { required: true, message: '请输入角色名称' },
  code: { required: true, message: '请输入角色标识' },
}

const columns = [
  { key: 'name', label: '角色名称' },
  { key: 'code', label: '标识', width: 120 },
  { key: 'userCount', label: '人数', width: 88 },
  { key: 'remark', label: '说明' },
  { key: 'status', label: '状态', width: 100 },
  { key: 'updatedAt', label: '更新时间', width: 140 },
  { key: 'actions', label: '操作', width: 148 },
]

const filteredRows = computed(() => {
  const kw = applied.keyword.trim().toLowerCase()
  return rows.value.filter((row) => {
    if (kw && ![row.name, row.code, row.remark].some(v => v.toLowerCase().includes(kw)))
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
    const label = statusOptions.find(o => o.value === applied.status)?.label ?? applied.status
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

function resetModel() {
  model.name = ''
  model.code = ''
  model.remark = ''
  model.status = 'active'
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
  model.code = row.code
  model.remark = row.remark
  model.status = row.status
  dialogOpen.value = true
}

function askDeleteById(id: unknown) {
  pendingDelete.value = rows.value.find(r => r.id === String(id)) ?? null
}

function closeDialog() {
  dialogOpen.value = false
  resetModel()
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
          code: model.code,
          remark: model.remark,
          status: model.status,
          updatedAt: now,
        })
      }
      message.success('角色已更新')
    }
    else {
      rows.value.unshift({
        id: nextId('r'),
        name: model.name,
        code: model.code,
        remark: model.remark,
        userCount: 0,
        status: model.status,
        updatedAt: now,
      })
      message.success('角色已创建')
    }
    closeDialog()
  }
  finally {
    submitting.value = false
  }
}

function confirmDelete() {
  if (!pendingDelete.value)
    return
  if (pendingDelete.value.code === 'admin') {
    message.error('超级管理员角色不可删除')
    pendingDelete.value = null
    return
  }
  rows.value = rows.value.filter(r => r.id !== pendingDelete.value!.id)
  message.success(`已删除角色「${pendingDelete.value.name}」`)
  pendingDelete.value = null
}
</script>

<template>
  <MPageContent aria-label="角色管理">
    <MPageHeader title="角色管理" description="配置角色标识与业务说明，再在用户管理中分配。">
      <template #actions>
        <MButton label="新建角色" icon="plus" severity="primary" @click="openCreate" />
      </template>
    </MPageHeader>

    <MPageFilters aria-label="筛选" variant="filled">
      <MSpace wrap>
        <MInput v-model="keyword" placeholder="搜索角色名称 / 标识" clearable style="width: 16rem" />
        <MSelect
          v-model="status"
          :options="statusOptions"
          placeholder="状态"
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
      aria-label="角色列表"
    >
      <template #cell-status="{ value }">
        <MStatus
          :label="value === 'active' ? '启用' : '停用'"
          :severity="value === 'active' ? 'success' : 'secondary'"
        />
      </template>
      <template #cell-actions="{ row }">
        <MSpace>
          <MButton label="编辑" severity="secondary" size="small" text @click="openEditById(row.id)" />
          <MButton label="删除" severity="danger" size="small" text @click="askDeleteById(row.id)" />
        </MSpace>
      </template>
      <template #empty>
        <MEmpty title="还没有角色" description="创建角色后即可在用户管理中分配。" icon="shield-check">
          <template #extra>
            <MButton label="新建角色" severity="primary" @click="openCreate" />
          </template>
        </MEmpty>
      </template>
    </MTable>

    <MDialog
      v-model="dialogOpen"
      :header="editingId ? '编辑角色' : '新建角色'"
      width="32rem"
      @close="resetModel"
    >
      <MForm ref="formRef" :model="model" :rules="rules" label-position="top">
        <MFormItem label="角色名称" name="name" required>
          <template #default="{ id, invalid }">
            <MInput :id="id" v-model="model.name" placeholder="例如：运营专员" fluid :invalid="invalid" />
          </template>
        </MFormItem>
        <MFormItem label="角色标识" name="code" required help="用于权限判断的唯一编码">
          <template #default="{ id, invalid }">
            <MInput :id="id" v-model="model.code" placeholder="例如：ops" fluid :invalid="invalid" :disabled="!!editingId" />
          </template>
        </MFormItem>
        <MFormItem label="说明" name="remark">
          <template #default="{ id }">
            <MTextarea :id="id" v-model="model.remark" :rows="3" fluid />
          </template>
        </MFormItem>
        <MFormItem label="状态" name="status">
          <template #default="{ id }">
            <MSelect
              :id="id"
              v-model="model.status"
              :options="[
                { label: '启用', value: 'active' },
                { label: '停用', value: 'inactive' },
              ]"
              fluid
            />
          </template>
        </MFormItem>
      </MForm>
      <template #footer>
        <MSpace style="justify-content: flex-end; width: 100%">
          <MButton label="取消" severity="secondary" text :disabled="submitting" @click="closeDialog" />
          <MButton label="保存" severity="primary" :loading="submitting" @click="onSave" />
        </MSpace>
      </template>
    </MDialog>

    <MConfirmDialog
      :model-value="pendingDelete !== null"
      header="删除角色"
      :message="pendingDelete ? `确定删除角色「${pendingDelete.name}」？` : ''"
      accept-label="删除"
      reject-label="取消"
      accept-severity="danger"
      type="warning"
      @accept="confirmDelete"
      @update:model-value="(open) => { if (!open) pendingDelete = null }"
    />
  </MPageContent>
</template>

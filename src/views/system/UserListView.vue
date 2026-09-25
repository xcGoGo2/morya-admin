<script setup lang="ts">
import type { FormInstance, FormRules } from 'morya-ui'
import type { UserRecord } from '../../types'
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
  MPageToolbar,
  MSelect,
  MSpace,
  MStatus,
  MTable,
  MTag,
  message,
} from 'morya-ui'
import { computed, reactive, ref } from 'vue'
import { deptOptions, roleOptions, users as seedUsers } from '../../api/system'
import { nextId } from '../../utils/tree'

const rows = ref<UserRecord[]>(seedUsers.map(u => ({ ...u })))
const keyword = ref('')
const status = ref<string | undefined>()
const department = ref<string | undefined>()
const applied = reactive({ keyword: '', status: undefined as string | undefined, department: undefined as string | undefined })
const filtersExpanded = ref(false)
const selection = ref<UserRecord[]>([])
const dialogOpen = ref(false)
const submitting = ref(false)
const editingId = ref<string | null>(null)
const pendingDelete = ref<UserRecord | null>(null)
const batchDeleteOpen = ref(false)
const formRef = ref<FormInstance | null>(null)

const statusOptions = [
  { label: '全部', value: '' },
  { label: '启用', value: 'active' },
  { label: '停用', value: 'inactive' },
]

const model = reactive({
  username: '',
  nickname: '',
  email: '',
  phone: '',
  dept: undefined as string | undefined,
  role: undefined as string | undefined,
  status: 'active' as UserRecord['status'],
})

const rules: FormRules = {
  username: { required: true, message: '请输入用户名' },
  nickname: { required: true, message: '请输入昵称' },
  email: { required: true, message: '请输入邮箱' },
  dept: { required: true, message: '请选择部门' },
  role: { required: true, message: '请选择角色' },
}

const columns = [
  { key: 'username', label: '用户名', width: 120 },
  { key: 'nickname', label: '昵称', width: 120 },
  { key: 'email', label: '邮箱' },
  { key: 'dept', label: '部门', width: 120 },
  { key: 'role', label: '角色', width: 120 },
  { key: 'status', label: '状态', width: 100 },
  { key: 'updatedAt', label: '更新时间', width: 160 },
  { key: 'actions', label: '操作', width: 148 },
]

const filteredRows = computed(() => {
  const kw = applied.keyword.trim().toLowerCase()
  return rows.value.filter((row) => {
    if (kw && ![row.username, row.nickname, row.email].some(v => v.toLowerCase().includes(kw)))
      return false
    if (applied.status && row.status !== applied.status)
      return false
    if (applied.department && row.dept !== applied.department)
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
  if (applied.department)
    items.push({ key: 'department', label: `部门：${applied.department}` })
  return items
})

function applyFilters() {
  applied.keyword = keyword.value
  applied.status = status.value || undefined
  applied.department = department.value
}

function resetFilters() {
  keyword.value = ''
  status.value = undefined
  department.value = undefined
  applyFilters()
}

function clearFilter(key: string) {
  if (key === 'keyword')
    keyword.value = ''
  if (key === 'status')
    status.value = undefined
  if (key === 'department')
    department.value = undefined
  applyFilters()
}

function resetModel() {
  model.username = ''
  model.nickname = ''
  model.email = ''
  model.phone = ''
  model.dept = undefined
  model.role = undefined
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
  model.username = row.username
  model.nickname = row.nickname
  model.email = row.email
  model.phone = row.phone
  model.dept = row.dept
  model.role = row.role
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
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ')
    if (editingId.value) {
      const target = rows.value.find(r => r.id === editingId.value)
      if (target) {
        Object.assign(target, {
          username: model.username,
          nickname: model.nickname,
          email: model.email,
          phone: model.phone,
          dept: model.dept!,
          role: model.role!,
          status: model.status,
          updatedAt: now,
        })
      }
      message.success('用户已更新')
    }
    else {
      rows.value.unshift({
        id: nextId('u'),
        username: model.username,
        nickname: model.nickname,
        email: model.email,
        phone: model.phone,
        dept: model.dept!,
        role: model.role!,
        status: model.status,
        updatedAt: now,
      })
      message.success('用户已创建')
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
  rows.value = rows.value.filter(r => r.id !== pendingDelete.value!.id)
  selection.value = selection.value.filter(r => r.id !== pendingDelete.value!.id)
  message.success(`已删除用户「${pendingDelete.value.nickname}」`)
  pendingDelete.value = null
}

function confirmBatchDelete() {
  const ids = new Set(selection.value.map(r => r.id))
  rows.value = rows.value.filter(r => !ids.has(r.id))
  message.success(`已删除 ${ids.size} 个用户`)
  selection.value = []
  batchDeleteOpen.value = false
}
</script>

<template>
  <MPageContent fill aria-label="用户管理">
    <MPageHeader title="用户管理" description="维护后台账号、所属部门与角色分配。">
      <template #actions>
        <MButton label="新建用户" icon="plus" severity="primary" @click="openCreate" />
      </template>
    </MPageHeader>

    <MPageFilters
      v-model:expanded="filtersExpanded"
      aria-label="筛选"
      variant="filled"
      collapsible
    >
      <MSpace wrap>
        <MInput v-model="keyword" placeholder="搜索用户名 / 昵称 / 邮箱" clearable style="width: 16rem" />
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
      <template #advanced>
        <MSpace wrap>
          <MSelect
            v-model="department"
            :options="deptOptions"
            placeholder="部门"
            clearable
            style="width: 10rem"
          />
        </MSpace>
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

    <MPageToolbar v-if="selection.length">
      <MSpace>
        <span class="toolbar-hint">已选 {{ selection.length }} 项</span>
        <MButton label="批量删除" icon="trash" severity="danger" text @click="batchDeleteOpen = true" />
      </MSpace>
    </MPageToolbar>

    <MTable
      v-model:selection="selection"
      :columns="columns"
      :rows="filteredRows"
      :rows-per-page="8"
      selection-mode="multiple"
      fill
      paginator
      striped
      bordered
      row-key="id"
      aria-label="用户列表"
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
        <MEmpty
          title="还没有匹配的用户"
          description="调整筛选条件，或新建第一个后台账号。"
          icon="users"
        >
          <template #extra>
            <MButton label="新建用户" severity="primary" @click="openCreate" />
          </template>
        </MEmpty>
      </template>
    </MTable>

    <MDialog
      v-model="dialogOpen"
      :header="editingId ? '编辑用户' : '新建用户'"
      width="32rem"
      @close="resetModel"
    >
      <MForm ref="formRef" :model="model" :rules="rules" label-position="top" validate-on="submit">
        <MFormItem label="用户名" name="username" required>
          <template #default="{ id, invalid }">
            <MInput :id="id" v-model="model.username" placeholder="登录账号" fluid :invalid="invalid" :disabled="!!editingId" />
          </template>
        </MFormItem>
        <MFormItem label="昵称" name="nickname" required>
          <template #default="{ id, invalid }">
            <MInput :id="id" v-model="model.nickname" placeholder="显示名称" fluid :invalid="invalid" />
          </template>
        </MFormItem>
        <MFormItem label="邮箱" name="email" required>
          <template #default="{ id, invalid }">
            <MInput :id="id" v-model="model.email" type="email" placeholder="name@morya.dev" fluid :invalid="invalid" />
          </template>
        </MFormItem>
        <MFormItem label="手机" name="phone">
          <template #default="{ id }">
            <MInput :id="id" v-model="model.phone" placeholder="可选" fluid />
          </template>
        </MFormItem>
        <MFormItem label="部门" name="dept" required>
          <template #default="{ id, invalid }">
            <MSelect :id="id" v-model="model.dept" :options="deptOptions" placeholder="请选择部门" fluid :invalid="invalid" />
          </template>
        </MFormItem>
        <MFormItem label="角色" name="role" required>
          <template #default="{ id, invalid }">
            <MSelect :id="id" v-model="model.role" :options="roleOptions" placeholder="请选择角色" fluid :invalid="invalid" />
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
      header="删除用户"
      :message="pendingDelete ? `确定删除用户「${pendingDelete.nickname}」？此操作不可恢复。` : ''"
      accept-label="删除"
      reject-label="取消"
      accept-severity="danger"
      type="warning"
      @accept="confirmDelete"
      @update:model-value="(open) => { if (!open) pendingDelete = null }"
    />

    <MConfirmDialog
      v-model="batchDeleteOpen"
      header="批量删除"
      :message="`确定删除选中的 ${selection.length} 个用户？此操作不可恢复。`"
      accept-label="删除"
      reject-label="取消"
      accept-severity="danger"
      type="warning"
      @accept="confirmBatchDelete"
    />
  </MPageContent>
</template>

<style scoped>
.toolbar-hint {
  color: var(--m-color-text-muted);
  font-size: var(--m-font-size-sm);
}
</style>

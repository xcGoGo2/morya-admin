<script setup lang="ts">
import type { FormInstance, FormRules } from 'morya-ui'
import type { DeptRecord } from '../../types'
import {
  MButton,
  MConfirmDialog,
  MDialog,
  MEmpty,
  MForm,
  MFormItem,
  MInput,
  MPageContent,
  MPageFilters,
  MPageHeader,
  MSelect,
  MSpace,
  MStatus,
  MTable,
  message,
} from 'morya-ui'
import { computed, reactive, ref } from 'vue'
import { depts as seedDepts } from '../../api/system'
import { flattenTree, nextId } from '../../utils/tree'

const rows = ref<DeptRecord[]>(seedDepts.map(d => ({ ...d })))
const keyword = ref('')
const appliedKeyword = ref('')
const dialogOpen = ref(false)
const submitting = ref(false)
const editingId = ref<string | null>(null)
const pendingDelete = ref<DeptRecord | null>(null)
const formRef = ref<FormInstance | null>(null)

const model = reactive({
  parentId: null as string | null,
  name: '',
  leader: '',
  phone: '',
  sort: '1',
  status: 'active' as DeptRecord['status'],
})

const rules: FormRules = {
  name: { required: true, message: '请输入部门名称' },
  leader: { required: true, message: '请输入负责人' },
}

const parentOptions = computed(() => [
  { label: '顶级部门', value: '' },
  ...rows.value
    .filter(d => d.id !== editingId.value)
    .map(d => ({ label: d.name, value: d.id })),
])

const columns = [
  { key: 'name', label: '部门名称' },
  { key: 'leader', label: '负责人', width: 120 },
  { key: 'phone', label: '联系电话', width: 150 },
  { key: 'sort', label: '排序', width: 72 },
  { key: 'status', label: '状态', width: 100 },
  { key: 'actions', label: '操作', width: 180 },
]

const displayRows = computed(() => {
  const flat = flattenTree(rows.value)
  const kw = appliedKeyword.value.trim().toLowerCase()
  if (!kw)
    return flat
  return flat.filter(row =>
    [row.name, row.leader, row.phone].some(v => v.toLowerCase().includes(kw)),
  )
})

function applyFilters() {
  appliedKeyword.value = keyword.value
}

function resetFilters() {
  keyword.value = ''
  applyFilters()
}

function resetModel() {
  model.parentId = null
  model.name = ''
  model.leader = ''
  model.phone = ''
  model.sort = '1'
  model.status = 'active'
  editingId.value = null
  formRef.value?.clearValidate()
}

function openCreate(parentId: string | null = null) {
  resetModel()
  model.parentId = parentId
  dialogOpen.value = true
}

function openEditById(id: unknown) {
  const row = rows.value.find(r => r.id === String(id))
  if (!row)
    return
  editingId.value = row.id
  model.parentId = row.parentId
  model.name = row.name
  model.leader = row.leader
  model.phone = row.phone
  model.sort = String(row.sort)
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
    const parentId = model.parentId || null
    const sort = Number.parseInt(model.sort, 10) || 1
    if (editingId.value) {
      const target = rows.value.find(r => r.id === editingId.value)
      if (target) {
        Object.assign(target, {
          parentId,
          name: model.name,
          leader: model.leader,
          phone: model.phone,
          sort,
          status: model.status,
        })
      }
      message.success('部门已更新')
    }
    else {
      rows.value.push({
        id: nextId('d'),
        parentId,
        name: model.name,
        leader: model.leader,
        phone: model.phone,
        sort,
        status: model.status,
      })
      message.success('部门已创建')
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
  const id = pendingDelete.value.id
  if (rows.value.some(r => r.parentId === id)) {
    message.error('请先删除下级部门')
    pendingDelete.value = null
    return
  }
  rows.value = rows.value.filter(r => r.id !== id)
  message.success(`已删除部门「${pendingDelete.value.name}」`)
  pendingDelete.value = null
}
</script>

<template>
  <MPageContent fill aria-label="部门管理">
    <MPageHeader title="部门管理" description="维护组织架构与各部门负责人信息。">
      <template #actions>
        <MButton label="新建部门" icon="plus" severity="primary" @click="openCreate()" />
      </template>
    </MPageHeader>

    <MPageFilters aria-label="筛选" variant="filled">
      <MSpace wrap>
        <MInput v-model="keyword" placeholder="搜索部门 / 负责人" clearable style="width: 16rem" />
        <MButton label="查询" severity="secondary" @click="applyFilters" />
        <MButton label="重置" severity="secondary" text @click="resetFilters" />
      </MSpace>
    </MPageFilters>

    <MTable
      :columns="columns"
      :rows="displayRows"
      fill
      striped
      bordered
      row-key="id"
      aria-label="部门列表"
    >
      <template #cell-name="{ row }">
        <span :style="{ paddingLeft: `${Number(row.depth) * 1.25}rem` }">{{ row.name }}</span>
      </template>
      <template #cell-status="{ value }">
        <MStatus
          :label="value === 'active' ? '启用' : '停用'"
          :severity="value === 'active' ? 'success' : 'secondary'"
        />
      </template>
      <template #cell-actions="{ row }">
        <MSpace>
          <MButton label="新增" severity="secondary" size="small" text @click="openCreate(String(row.id))" />
          <MButton label="编辑" severity="secondary" size="small" text @click="openEditById(row.id)" />
          <MButton label="删除" severity="danger" size="small" text @click="askDeleteById(row.id)" />
        </MSpace>
      </template>
      <template #empty>
        <MEmpty title="还没有部门" description="先创建总部，再挂载下级组织。" icon="sitemap">
          <template #extra>
            <MButton label="新建部门" severity="primary" @click="openCreate()" />
          </template>
        </MEmpty>
      </template>
    </MTable>

    <MDialog
      v-model="dialogOpen"
      :header="editingId ? '编辑部门' : '新建部门'"
      width="32rem"
      @close="resetModel"
    >
      <MForm ref="formRef" :model="model" :rules="rules" label-position="top">
        <MFormItem label="上级部门" name="parentId">
          <template #default="{ id }">
            <MSelect
              :id="id"
              :model-value="model.parentId ?? ''"
              :options="parentOptions"
              placeholder="顶级部门"
              fluid
              @update:model-value="(v) => model.parentId = v ? String(v) : null"
            />
          </template>
        </MFormItem>
        <MFormItem label="部门名称" name="name" required>
          <template #default="{ id, invalid }">
            <MInput :id="id" v-model="model.name" placeholder="例如：研发中心" fluid :invalid="invalid" />
          </template>
        </MFormItem>
        <MFormItem label="负责人" name="leader" required>
          <template #default="{ id, invalid }">
            <MInput :id="id" v-model="model.leader" fluid :invalid="invalid" />
          </template>
        </MFormItem>
        <MFormItem label="联系电话" name="phone">
          <template #default="{ id }">
            <MInput :id="id" v-model="model.phone" fluid />
          </template>
        </MFormItem>
        <MFormItem label="排序" name="sort">
          <template #default="{ id }">
            <MInput :id="id" v-model="model.sort" placeholder="数字越小越靠前" fluid />
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
      header="删除部门"
      :message="pendingDelete ? `确定删除部门「${pendingDelete.name}」？` : ''"
      accept-label="删除"
      reject-label="取消"
      accept-severity="danger"
      type="warning"
      @accept="confirmDelete"
      @update:model-value="(open) => { if (!open) pendingDelete = null }"
    />
  </MPageContent>
</template>

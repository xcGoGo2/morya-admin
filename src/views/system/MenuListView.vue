<script setup lang="ts">
import type { FormInstance, FormRules } from 'morya-ui'
import type { MenuRecord, MenuType } from '../../types'
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
  MTag,
  message,
} from 'morya-ui'
import { computed, reactive, ref } from 'vue'
import { menus as seedMenus } from '../../api/system'
import { flattenTree, nextId } from '../../utils/tree'

const rows = ref<MenuRecord[]>(seedMenus.map(m => ({ ...m })))
const keyword = ref('')
const typeFilter = ref<string | undefined>()
const applied = reactive({ keyword: '', type: undefined as string | undefined })
const dialogOpen = ref(false)
const submitting = ref(false)
const editingId = ref<string | null>(null)
const pendingDelete = ref<MenuRecord | null>(null)
const formRef = ref<FormInstance | null>(null)

const typeOptions = [
  { label: '全部类型', value: '' },
  { label: '目录', value: 'directory' },
  { label: '菜单', value: 'menu' },
  { label: '按钮', value: 'button' },
]

const typeLabel: Record<MenuType, string> = {
  directory: '目录',
  menu: '菜单',
  button: '按钮',
}

const model = reactive({
  parentId: null as string | null,
  name: '',
  type: 'menu' as MenuType,
  path: '',
  icon: '',
  sort: '1',
  status: 'active' as MenuRecord['status'],
})

const rules: FormRules = {
  name: { required: true, message: '请输入菜单名称' },
  type: { required: true, message: '请选择类型' },
}

const parentOptions = computed(() => [
  { label: '顶级菜单', value: '' },
  ...rows.value
    .filter(m => m.type !== 'button' && m.id !== editingId.value)
    .map(m => ({ label: m.name, value: m.id })),
])

const columns = [
  { key: 'name', label: '菜单名称' },
  { key: 'type', label: '类型', width: 100 },
  { key: 'path', label: '路由路径', width: 180 },
  { key: 'icon', label: '图标', width: 140 },
  { key: 'sort', label: '排序', width: 72 },
  { key: 'status', label: '状态', width: 100 },
  { key: 'actions', label: '操作', width: 180 },
]

const displayRows = computed(() => {
  const flat = flattenTree(rows.value)
  const kw = applied.keyword.trim().toLowerCase()
  return flat.filter((row) => {
    if (kw && !row.name.toLowerCase().includes(kw) && !row.path.toLowerCase().includes(kw))
      return false
    if (applied.type && row.type !== applied.type)
      return false
    return true
  })
})

function applyFilters() {
  applied.keyword = keyword.value
  applied.type = typeFilter.value || undefined
}

function resetFilters() {
  keyword.value = ''
  typeFilter.value = undefined
  applyFilters()
}

function resetModel() {
  model.parentId = null
  model.name = ''
  model.type = 'menu'
  model.path = ''
  model.icon = ''
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
  model.type = row.type
  model.path = row.path
  model.icon = row.icon
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
          type: model.type,
          path: model.path,
          icon: model.icon,
          sort,
          status: model.status,
        })
      }
      message.success('菜单已更新')
    }
    else {
      rows.value.push({
        id: nextId('m'),
        parentId,
        name: model.name,
        type: model.type,
        path: model.path,
        icon: model.icon,
        sort,
        status: model.status,
      })
      message.success('菜单已创建')
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
    message.error('请先删除子菜单')
    pendingDelete.value = null
    return
  }
  rows.value = rows.value.filter(r => r.id !== id)
  message.success(`已删除「${pendingDelete.value.name}」`)
  pendingDelete.value = null
}
</script>

<template>
  <MPageContent aria-label="菜单管理">
    <MPageHeader title="菜单管理" description="维护侧栏目录、页面路由与按钮级权限节点。">
      <template #actions>
        <MButton label="新建菜单" icon="plus" severity="primary" @click="openCreate()" />
      </template>
    </MPageHeader>

    <MPageFilters aria-label="筛选" variant="filled">
      <MSpace wrap>
        <MInput v-model="keyword" placeholder="搜索菜单名称 / 路径" clearable style="width: 16rem" />
        <MSelect
          v-model="typeFilter"
          :options="typeOptions"
          placeholder="类型"
          clearable
          style="width: 10rem"
        />
        <MButton label="查询" severity="secondary" @click="applyFilters" />
        <MButton label="重置" severity="secondary" text @click="resetFilters" />
      </MSpace>
    </MPageFilters>

    <MTable
      :columns="columns"
      :rows="displayRows"
      striped
      bordered
      row-key="id"
      aria-label="菜单列表"
    >
      <template #cell-name="{ row }">
        <span class="tree-name" :style="{ paddingLeft: `${Number(row.depth) * 1.25}rem` }">
          {{ row.name }}
        </span>
      </template>
      <template #cell-type="{ value }">
        <MTag
          :value="typeLabel[value as MenuType]"
          size="small"
          :severity="value === 'directory' ? 'help' : value === 'menu' ? 'primary' : 'secondary'"
        />
      </template>
      <template #cell-status="{ value }">
        <MStatus
          :label="value === 'active' ? '启用' : '停用'"
          :severity="value === 'active' ? 'success' : 'secondary'"
        />
      </template>
      <template #cell-actions="{ row }">
        <MSpace>
          <MButton
            v-if="row.type !== 'button'"
            label="新增"
            severity="secondary"
            size="small"
            text
            @click="openCreate(String(row.id))"
          />
          <MButton label="编辑" severity="secondary" size="small" text @click="openEditById(row.id)" />
          <MButton label="删除" severity="danger" size="small" text @click="askDeleteById(row.id)" />
        </MSpace>
      </template>
      <template #empty>
        <MEmpty title="还没有菜单" description="先创建目录，再挂载页面与按钮权限。" icon="list">
          <template #extra>
            <MButton label="新建菜单" severity="primary" @click="openCreate()" />
          </template>
        </MEmpty>
      </template>
    </MTable>

    <MDialog
      v-model="dialogOpen"
      :header="editingId ? '编辑菜单' : '新建菜单'"
      width="32rem"
      @close="resetModel"
    >
      <MForm ref="formRef" :model="model" :rules="rules" label-position="top">
        <MFormItem label="上级菜单" name="parentId">
          <template #default="{ id }">
            <MSelect
              :id="id"
              :model-value="model.parentId ?? ''"
              :options="parentOptions"
              placeholder="顶级菜单"
              fluid
              @update:model-value="(v) => model.parentId = v ? String(v) : null"
            />
          </template>
        </MFormItem>
        <MFormItem label="名称" name="name" required>
          <template #default="{ id, invalid }">
            <MInput :id="id" v-model="model.name" placeholder="菜单显示名" fluid :invalid="invalid" />
          </template>
        </MFormItem>
        <MFormItem label="类型" name="type" required>
          <template #default="{ id }">
            <MSelect
              :id="id"
              v-model="model.type"
              :options="typeOptions.filter(o => o.value)"
              fluid
            />
          </template>
        </MFormItem>
        <MFormItem v-if="model.type !== 'button'" label="路由路径" name="path">
          <template #default="{ id }">
            <MInput :id="id" v-model="model.path" placeholder="/system/user" fluid />
          </template>
        </MFormItem>
        <MFormItem v-if="model.type !== 'button'" label="图标" name="icon">
          <template #default="{ id }">
            <MInput :id="id" v-model="model.icon" placeholder="例如：users" fluid />
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
      header="删除菜单"
      :message="pendingDelete ? `确定删除「${pendingDelete.name}」？` : ''"
      accept-label="删除"
      reject-label="取消"
      accept-severity="danger"
      type="warning"
      @accept="confirmDelete"
      @update:model-value="(open) => { if (!open) pendingDelete = null }"
    />
  </MPageContent>
</template>

<style scoped>
.tree-name {
  display: inline-block;
}
</style>

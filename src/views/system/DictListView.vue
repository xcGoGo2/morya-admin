<script setup lang="ts">
import type { FormInstance, FormRules } from 'morya-ui'
import type { DictItemRecord, DictTypeRecord } from '../../types'
import {
  MButton,
  MConfirmDialog,
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
  MSelect,
  MSpace,
  MStatus,
  MTable,
  MTag,
} from 'morya-ui'
import { computed, reactive, ref } from 'vue'
import { dictItems as seedItems, dictTypes as seedTypes } from '../../api/system'
import { nextId } from '../../utils/tree'

const types = ref<DictTypeRecord[]>(seedTypes.map(t => ({ ...t })))
const items = ref<DictItemRecord[]>(seedItems.map(i => ({ ...i })))
const keyword = ref('')
const status = ref<string | undefined>()
const applied = reactive({ keyword: '', status: undefined as string | undefined })
const selectedType = ref<DictTypeRecord | null>(types.value[0] ?? null)
const dialogOpen = ref(false)
const itemDialogOpen = ref(false)
const submitting = ref(false)
const editingId = ref<string | null>(null)
const pendingDelete = ref<DictTypeRecord | null>(null)
const formRef = ref<FormInstance | null>(null)
const itemFormRef = ref<FormInstance | null>(null)

const statusOptions = [
  { label: '全部', value: '' },
  { label: '启用', value: 'active' },
  { label: '停用', value: 'inactive' },
]

const model = reactive({
  name: '',
  code: '',
  remark: '',
  status: 'active' as DictTypeRecord['status'],
})

const itemModel = reactive({
  label: '',
  value: '',
  sort: 1,
  status: 'active' as DictItemRecord['status'],
})

const rules: FormRules = {
  name: { required: true, message: '请输入字典名称' },
  code: { required: true, message: '请输入字典编码' },
}

const itemRules: FormRules = {
  label: { required: true, message: '请输入标签' },
  value: { required: true, message: '请输入值' },
}

const typeColumns = [
  { key: 'name', label: '字典名称' },
  { key: 'code', label: '编码', width: 160 },
  { key: 'status', label: '状态', width: 100 },
  { key: 'updatedAt', label: '更新时间', width: 140 },
  { key: 'actions', label: '操作', width: 160 },
]

const itemColumns = [
  { key: 'label', label: '标签' },
  { key: 'value', label: '值', width: 120 },
  { key: 'sort', label: '排序', width: 80 },
  { key: 'status', label: '状态', width: 100 },
  { key: 'actions', label: '操作', width: 100 },
]

const filteredTypes = computed(() => {
  const kw = applied.keyword.trim().toLowerCase()
  return types.value.filter((row) => {
    if (kw && ![row.name, row.code, row.remark].some(v => v.toLowerCase().includes(kw)))
      return false
    if (applied.status && row.status !== applied.status)
      return false
    return true
  })
})

const filteredItems = computed(() => {
  if (!selectedType.value)
    return []
  return items.value
    .filter(i => i.typeCode === selectedType.value!.code)
    .sort((a, b) => a.sort - b.sort)
})

const activeFilters = computed(() => {
  const list: Array<{ key: string, label: string }> = []
  if (applied.keyword.trim())
    list.push({ key: 'keyword', label: `关键词：${applied.keyword.trim()}` })
  if (applied.status) {
    const label = statusOptions.find(o => o.value === applied.status)?.label ?? applied.status
    list.push({ key: 'status', label: `状态：${label}` })
  }
  return list
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

function selectType(payload: { row: { id?: string } }) {
  const row = types.value.find(t => t.id === String(payload.row.id))
  if (row)
    selectedType.value = row
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

function openEdit(row: DictTypeRecord) {
  editingId.value = row.id
  model.name = row.name
  model.code = row.code
  model.remark = row.remark
  model.status = row.status
  dialogOpen.value = true
}

function openEditById(id: unknown) {
  const row = types.value.find(t => t.id === String(id))
  if (row)
    openEdit(row)
}

function askDelete(row: DictTypeRecord) {
  pendingDelete.value = row
}

function askDeleteById(id: unknown) {
  const row = types.value.find(t => t.id === String(id))
  if (row)
    askDelete(row)
}

async function onSaveType() {
  const { valid } = await formRef.value!.validate()
  if (!valid)
    return
  submitting.value = true
  try {
    const now = new Date().toISOString().slice(0, 10)
    if (editingId.value) {
      const target = types.value.find(t => t.id === editingId.value)
      if (target) {
        Object.assign(target, { ...model, updatedAt: now })
        if (selectedType.value?.id === target.id)
          selectedType.value = { ...target }
      }
      message.success('字典类型已更新')
    }
    else {
      const row: DictTypeRecord = {
        id: nextId('dt'),
        ...model,
        updatedAt: now,
      }
      types.value.unshift(row)
      message.success('字典类型已创建')
    }
    dialogOpen.value = false
    resetModel()
  }
  finally {
    submitting.value = false
  }
}

function confirmDelete() {
  if (!pendingDelete.value)
    return
  const code = pendingDelete.value.code
  types.value = types.value.filter(t => t.id !== pendingDelete.value!.id)
  items.value = items.value.filter(i => i.typeCode !== code)
  if (selectedType.value?.id === pendingDelete.value.id)
    selectedType.value = types.value[0] ?? null
  message.success(`已删除字典「${pendingDelete.value.name}」`)
  pendingDelete.value = null
}

function openCreateItem() {
  if (!selectedType.value) {
    message.warn('请先选择字典类型')
    return
  }
  itemModel.label = ''
  itemModel.value = ''
  itemModel.sort = filteredItems.value.length + 1
  itemModel.status = 'active'
  itemFormRef.value?.clearValidate()
  itemDialogOpen.value = true
}

async function onSaveItem() {
  const { valid } = await itemFormRef.value!.validate()
  if (!valid || !selectedType.value)
    return
  items.value.push({
    id: nextId('di'),
    typeCode: selectedType.value.code,
    label: itemModel.label,
    value: itemModel.value,
    sort: itemModel.sort,
    status: itemModel.status,
  })
  itemDialogOpen.value = false
  message.success('字典项已添加')
}

function removeItem(id: unknown) {
  items.value = items.value.filter(i => i.id !== String(id))
  message.success('字典项已删除')
}
</script>

<template>
  <MPageContent fill aria-label="字典管理">
    <MPageHeader title="字典管理" description="维护枚举字典类型与字典项，供业务下拉复用。">
      <template #actions>
        <MButton label="新建字典" icon="plus" severity="primary" @click="openCreate" />
      </template>
    </MPageHeader>

    <MPageFilters aria-label="筛选" variant="filled">
      <MSpace wrap>
        <MInput v-model="keyword" placeholder="搜索名称 / 编码" clearable style="width: 16rem" />
        <MSelect
          v-model="status"
          :options="statusOptions"
          placeholder="状态"
          clearable
          style="width: 10rem"
        />
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

    <div class="dict-split">
      <MTable
        class="dict-split__types"
        :columns="typeColumns"
        :rows="filteredTypes"
        :rows-per-page="8"
        :current-row-key="selectedType?.id ?? null"
        highlight-current
        fill
        paginator
        bordered
        row-key="id"
        aria-label="字典类型"
        @row-click="selectType"
      >
        <template #cell-status="{ value }">
          <MStatus
            :label="value === 'active' ? '启用' : '停用'"
            :severity="value === 'active' ? 'success' : 'secondary'"
          />
        </template>
        <template #cell-actions="{ row }">
          <MSpace>
            <MButton label="编辑" severity="secondary" size="small" text @click.stop="openEditById(row.id)" />
            <MButton label="删除" severity="danger" size="small" text @click.stop="askDeleteById(row.id)" />
          </MSpace>
        </template>
        <template #empty>
          <MEmpty title="还没有字典" description="新建字典类型后可维护字典项。" icon="list">
            <template #extra>
              <MButton label="新建字典" severity="primary" @click="openCreate" />
            </template>
          </MEmpty>
        </template>
      </MTable>

      <section class="dict-split__items" aria-label="字典项">
        <header class="dict-split__head">
          <div>
            <h3>{{ selectedType?.name ?? '未选择' }}</h3>
            <p>{{ selectedType ? selectedType.code : '点击左侧字典类型查看字典项' }}</p>
          </div>
          <MButton
            label="添加项"
            icon="plus"
            size="small"
            :disabled="!selectedType"
            @click="openCreateItem"
          />
        </header>
        <MTable
          :columns="itemColumns"
          :rows="filteredItems"
          :rows-per-page="8"
          fill
          paginator
          striped
          bordered
          row-key="id"
          aria-label="字典项列表"
        >
          <template #cell-status="{ value }">
            <MStatus
              :label="value === 'active' ? '启用' : '停用'"
              :severity="value === 'active' ? 'success' : 'secondary'"
            />
          </template>
          <template #cell-actions="{ row }">
            <MButton label="删除" severity="danger" size="small" text @click="removeItem(row.id)" />
          </template>
          <template #empty>
            <MEmpty simple title="" description="暂无字典项" />
          </template>
        </MTable>
      </section>
    </div>

    <MDialog v-model="dialogOpen" :header="editingId ? '编辑字典' : '新建字典'" width="32rem" @close="resetModel">
      <MForm ref="formRef" :model="model" :rules="rules" label-position="top" validate-on="submit" @submit="onSaveType">
        <MFormItem label="字典名称" name="name" required>
          <template #default="{ id, invalid }">
            <MInput :id="id" v-model="model.name" fluid :invalid="invalid" />
          </template>
        </MFormItem>
        <MFormItem label="字典编码" name="code" required>
          <template #default="{ id, invalid }">
            <MInput :id="id" v-model="model.code" fluid :invalid="invalid" :disabled="!!editingId" />
          </template>
        </MFormItem>
        <MFormItem label="备注" name="remark">
          <template #default="{ id }">
            <MInput :id="id" v-model="model.remark" fluid />
          </template>
        </MFormItem>
        <MFormItem label="状态" name="status">
          <template #default="{ id }">
            <MSelect
              :id="id"
              v-model="model.status"
              :options="[{ label: '启用', value: 'active' }, { label: '停用', value: 'inactive' }]"
              fluid
            />
          </template>
        </MFormItem>
        <MSpace style="justify-content: flex-end; margin-top: var(--m-space-4)">
          <MButton label="取消" severity="secondary" text @click="dialogOpen = false" />
          <MButton label="保存" severity="primary" native-type="submit" :loading="submitting" />
        </MSpace>
      </MForm>
    </MDialog>

    <MDialog v-model="itemDialogOpen" header="添加字典项" width="28rem">
      <MForm ref="itemFormRef" :model="itemModel" :rules="itemRules" label-position="top" validate-on="submit" @submit="onSaveItem">
        <MFormItem label="标签" name="label" required>
          <template #default="{ id, invalid }">
            <MInput :id="id" v-model="itemModel.label" fluid :invalid="invalid" />
          </template>
        </MFormItem>
        <MFormItem label="值" name="value" required>
          <template #default="{ id, invalid }">
            <MInput :id="id" v-model="itemModel.value" fluid :invalid="invalid" />
          </template>
        </MFormItem>
        <MSpace style="justify-content: flex-end; margin-top: var(--m-space-4)">
          <MButton label="取消" severity="secondary" text @click="itemDialogOpen = false" />
          <MButton label="添加" severity="primary" native-type="submit" />
        </MSpace>
      </MForm>
    </MDialog>

    <MConfirmDialog
      :model-value="pendingDelete !== null"
      header="删除字典"
      :message="pendingDelete ? `确定删除字典「${pendingDelete.name}」及其全部字典项？` : ''"
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
.dict-split {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  gap: var(--m-space-4);
  min-height: 0;
  flex: 1;
}

.dict-split__types,
.dict-split__items {
  min-height: 0;
}

.dict-split__items {
  display: flex;
  flex-direction: column;
  gap: var(--m-space-3);
  min-height: 0;
  padding: var(--m-space-3);
  border-left: 1px solid var(--m-color-border);
}

.dict-split__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--m-space-3);
}

.dict-split__head h3 {
  margin: 0 0 var(--m-space-1);
  font-size: var(--m-font-size-md);
  font-weight: 650;
}

.dict-split__head p {
  margin: 0;
  color: var(--m-color-text-muted);
  font-size: var(--m-font-size-xs);
}

@media (max-width: 960px) {
  .dict-split {
    grid-template-columns: 1fr;
  }

  .dict-split__items {
    border-left: none;
    border-top: 1px solid var(--m-color-border);
    padding-left: 0;
    padding-right: 0;
  }
}
</style>

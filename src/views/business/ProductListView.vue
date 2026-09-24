<script setup lang="ts">
import type { FormInstance, FormRules } from 'morya-ui'
import type { ProductRecord } from '../../types'
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
  message,
} from 'morya-ui'
import { computed, reactive, ref } from 'vue'
import { productCategoryOptions, products as seedProducts } from '../../api/business'
import { nextId } from '../../utils/tree'

const rows = ref<ProductRecord[]>(seedProducts.map(p => ({ ...p })))
const keyword = ref('')
const status = ref<string | undefined>()
const category = ref<string | undefined>()
const applied = reactive({
  keyword: '',
  status: undefined as string | undefined,
  category: undefined as string | undefined,
})
const dialogOpen = ref(false)
const submitting = ref(false)
const editingId = ref<string | null>(null)
const pendingDelete = ref<ProductRecord | null>(null)
const formRef = ref<FormInstance | null>(null)

const statusOptions = [
  { label: '全部', value: '' },
  { label: '上架', value: 'on' },
  { label: '下架', value: 'off' },
]

const model = reactive({
  name: '',
  sku: '',
  category: undefined as string | undefined,
  price: '',
  stock: '',
  status: 'on' as ProductRecord['status'],
})

const rules: FormRules = {
  name: { required: true, message: '请输入商品名称' },
  sku: { required: true, message: '请输入 SKU' },
  category: { required: true, message: '请选择分类' },
}

const columns = [
  { key: 'name', label: '商品名称' },
  { key: 'sku', label: 'SKU', width: 130 },
  { key: 'category', label: '分类', width: 100 },
  { key: 'price', label: '价格', width: 110 },
  { key: 'stock', label: '库存', width: 88 },
  { key: 'status', label: '状态', width: 100 },
  { key: 'updatedAt', label: '更新时间', width: 120 },
  { key: 'actions', label: '操作', width: 180 },
]

const filteredRows = computed(() => {
  const kw = applied.keyword.trim().toLowerCase()
  return rows.value.filter((row) => {
    if (kw && ![row.name, row.sku].some(v => v.toLowerCase().includes(kw)))
      return false
    if (applied.status && row.status !== applied.status)
      return false
    if (applied.category && row.category !== applied.category)
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
  if (applied.category)
    items.push({ key: 'category', label: `分类：${applied.category}` })
  return items
})

function applyFilters() {
  applied.keyword = keyword.value
  applied.status = status.value || undefined
  applied.category = category.value
}

function resetFilters() {
  keyword.value = ''
  status.value = undefined
  category.value = undefined
  applyFilters()
}

function clearFilter(key: string) {
  if (key === 'keyword')
    keyword.value = ''
  if (key === 'status')
    status.value = undefined
  if (key === 'category')
    category.value = undefined
  applyFilters()
}

function resetModel() {
  model.name = ''
  model.sku = ''
  model.category = undefined
  model.price = ''
  model.stock = ''
  model.status = 'on'
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
  model.sku = row.sku
  model.category = row.category
  model.price = String(row.price)
  model.stock = String(row.stock)
  model.status = row.status
  dialogOpen.value = true
}

function toggleStatusById(id: unknown) {
  const row = rows.value.find(r => r.id === String(id))
  if (!row)
    return
  row.status = row.status === 'on' ? 'off' : 'on'
  row.updatedAt = new Date().toISOString().slice(0, 10)
  message.success(row.status === 'on' ? `「${row.name}」已上架` : `「${row.name}」已下架`)
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
    const price = Number(model.price) || 0
    const stock = Number(model.stock) || 0
    if (editingId.value) {
      const target = rows.value.find(r => r.id === editingId.value)
      if (target) {
        Object.assign(target, {
          name: model.name,
          sku: model.sku,
          category: model.category!,
          price,
          stock,
          status: model.status,
          updatedAt: now,
        })
      }
      message.success('商品已更新')
    }
    else {
      rows.value.unshift({
        id: nextId('p'),
        name: model.name,
        sku: model.sku,
        category: model.category!,
        price,
        stock,
        status: model.status,
        updatedAt: now,
      })
      message.success('商品已创建')
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
  message.success(`已删除商品「${pendingDelete.value.name}」`)
  pendingDelete.value = null
}

function formatPrice(value: number) {
  return `¥ ${value.toLocaleString('zh-CN')}`
}

function isOnShelf(statusValue: unknown) {
  return statusValue === 'on'
}
</script>

<template>
  <MPageContent aria-label="商品管理">
    <MPageHeader title="商品管理" description="维护订阅套餐、增值包与服务类商品。">
      <template #actions>
        <MButton label="新建商品" icon="plus" severity="primary" @click="openCreate" />
      </template>
    </MPageHeader>

    <MPageFilters aria-label="筛选" variant="filled">
      <MSpace wrap>
        <MInput v-model="keyword" placeholder="搜索名称 / SKU" clearable style="width: 14rem" />
        <MSelect
          v-model="status"
          :options="statusOptions"
          placeholder="状态"
          clearable
          style="width: 9rem"
        />
        <MSelect
          v-model="category"
          :options="productCategoryOptions"
          placeholder="分类"
          clearable
          style="width: 9rem"
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
      aria-label="商品列表"
    >
      <template #cell-price="{ value }">
        {{ formatPrice(Number(value)) }}
      </template>
      <template #cell-status="{ value }">
        <MStatus
          :label="value === 'on' ? '上架' : '下架'"
          :severity="value === 'on' ? 'success' : 'secondary'"
        />
      </template>
      <template #cell-actions="{ row }">
        <MSpace>
          <MButton label="编辑" severity="secondary" size="small" text @click="openEditById(row.id)" />
          <MButton
            :label="isOnShelf(row.status) ? '下架' : '上架'"
            severity="secondary"
            size="small"
            text
            @click="toggleStatusById(row.id)"
          />
          <MButton label="删除" severity="danger" size="small" text @click="askDeleteById(row.id)" />
        </MSpace>
      </template>
      <template #empty>
        <MEmpty title="还没有商品" description="创建第一个套餐或增值包后即可上架销售。" icon="box">
          <template #extra>
            <MButton label="新建商品" severity="primary" @click="openCreate" />
          </template>
        </MEmpty>
      </template>
    </MTable>

    <MDialog
      v-model="dialogOpen"
      :header="editingId ? '编辑商品' : '新建商品'"
      width="32rem"
      @close="resetModel"
    >
      <MForm ref="formRef" :model="model" :rules="rules" label-position="top">
        <MFormItem label="商品名称" name="name" required>
          <template #default="{ id, invalid }">
            <MInput :id="id" v-model="model.name" fluid :invalid="invalid" />
          </template>
        </MFormItem>
        <MFormItem label="SKU" name="sku" required>
          <template #default="{ id, invalid }">
            <MInput :id="id" v-model="model.sku" fluid :invalid="invalid" :disabled="!!editingId" />
          </template>
        </MFormItem>
        <MFormItem label="分类" name="category" required>
          <template #default="{ id, invalid }">
            <MSelect :id="id" v-model="model.category" :options="productCategoryOptions" fluid :invalid="invalid" />
          </template>
        </MFormItem>
        <MFormItem label="价格" name="price">
          <template #default="{ id }">
            <MInput :id="id" v-model="model.price" placeholder="0" fluid />
          </template>
        </MFormItem>
        <MFormItem label="库存" name="stock">
          <template #default="{ id }">
            <MInput :id="id" v-model="model.stock" placeholder="0" fluid />
          </template>
        </MFormItem>
        <MFormItem label="状态" name="status">
          <template #default="{ id }">
            <MSelect
              :id="id"
              v-model="model.status"
              :options="[
                { label: '上架', value: 'on' },
                { label: '下架', value: 'off' },
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
      header="删除商品"
      :message="pendingDelete ? `确定删除商品「${pendingDelete.name}」？` : ''"
      accept-label="删除"
      reject-label="取消"
      accept-severity="danger"
      type="warning"
      @accept="confirmDelete"
      @update:model-value="(open) => { if (!open) pendingDelete = null }"
    />
  </MPageContent>
</template>

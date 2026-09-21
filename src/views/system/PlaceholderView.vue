<script setup lang="ts">
import { MButton, MEmpty, MPageContent, MPageHeader } from 'morya-ui'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const placeholder = computed(() => ({
  title: route.meta.placeholder?.title ?? route.meta.title ?? '页面占位',
  description:
    route.meta.placeholder?.description ?? '该模块尚未实现，可作为后续业务页入口。',
}))
</script>

<template>
  <MPageContent>
    <MPageHeader
      :title="placeholder.title"
      :description="placeholder.description"
    />
    <MEmpty
      :title="`${placeholder.title}尚未接入`"
      description="可继续用 morya-ui-pages 的 list-page / form-page 黄金样例扩展此模块。"
    >
      <template #extra>
        <MButton label="返回工作台" severity="primary" @click="router.push('/dashboard')" />
      </template>
    </MEmpty>
  </MPageContent>
</template>

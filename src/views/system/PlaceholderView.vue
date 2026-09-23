<script setup lang="ts">
import { MButton, MEmpty, MPageContent } from 'morya-ui'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const title = computed(() => `${route.meta.title ?? '页面'} · 开发中`)
</script>

<template>
  <MPageContent density="spacious" aria-label="占位页面">
    <MEmpty
      :title="title"
      description="该模块的原型页面正在建设中，演示环境可先浏览工作台与个人中心。"
      icon="briefcase"
    >
      <template #extra>
        <div class="placeholder-actions">
          <MButton label="返回工作台" icon="layout-dashboard" severity="primary" @click="router.push('/dashboard')" />
          <MButton label="预览 404 页" icon="alert-circle" text @click="router.push('/404')" />
        </div>
      </template>
    </MEmpty>
  </MPageContent>
</template>

<style scoped>
.placeholder-actions {
  display: flex;
  justify-content: center;
  gap: var(--m-space-3);
  flex-wrap: wrap;
}
</style>

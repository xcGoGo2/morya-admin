<script setup lang="ts">
import { MButton, MLayout, MResult, MSpace } from 'morya-ui'
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  void router.push('/')
}

function reload() {
  window.location.reload()
}
</script>

<template>
  <MLayout fill-viewport class="error-page">
    <MResult
      status="500"
      title="服务暂时不可用"
      description="这是演示用的 500 页面。真实环境里可在此引导用户重试或联系支持。"
      size="large"
    >
      <template #footer>
        <MSpace>
          <MButton label="刷新页面" icon="refresh" @click="reload" />
          <MButton label="返回首页" icon="layout-dashboard" @click="goHome" variant="outlined" />
        </MSpace>
      </template>
    </MResult>
  </MLayout>
</template>

<style scoped>
.error-page {
  display: grid;
  place-items: center;
  background: var(--m-color-surface);
}
</style>

<script setup lang="ts">
import { MButton, MLayout, MResult, MSpace } from 'morya-ui'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const route = useRoute()
const { state, signOut } = useAuthStore()

function goHome() {
  void router.push('/')
}

function goBack() {
  const from = typeof route.query.from === 'string' ? route.query.from : ''
  if (from && from !== '/403')
    void router.back()
  else
    void router.push('/')
}

function reLogin() {
  signOut()
  void router.push('/login')
}
</script>

<template>
  <MLayout fill-viewport class="error-page">
    <MResult
      status="403"
      title="无权访问"
      description="当前角色没有访问该页面的权限。可返回上一页，或使用 admin 账号体验完整权限。"
      size="large"
    >
      <template #footer>
        <MSpace>
          <MButton label="返回上一页" icon="arrow-left" @click="goBack" />
          <MButton label="回到工作台" icon="layout-dashboard" @click="goHome" variant="outlined" />
          <MButton v-if="!state.user" label="去登录" icon="login" @click="reLogin" variant="outlined" />
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

<script setup lang="ts">
import { MButton, MLayout, MResult, MSpace } from 'morya-ui'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const { state, signOut } = useAuthStore()

function goHome() {
  void router.push('/')
}

function reLogin() {
  signOut()
  void router.push('/login')
}
</script>

<template>
  <MLayout fill-viewport class="notfound">
    <MResult
      status="404"
      title="页面不存在"
      description="你访问的页面可能已被移除、更名或暂时不可用。"
      size="large"
    >
      <template #footer>
        <MSpace>
          <MButton label="返回首页" icon="layout-dashboard" @click="goHome" />
          <MButton v-if="!state.user" label="去登录" icon="login" @click="reLogin" variant="outlined" />
        </MSpace>
      </template>
    </MResult>
  </MLayout>
</template>

<style scoped>
.notfound {
  display: grid;
  place-items: center;
  background: var(--m-color-surface);
}
</style>

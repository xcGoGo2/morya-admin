<script setup lang="ts">
import { MConfigProvider, zhCN } from 'morya-ui'
import { useSettingsStore } from './stores/settings'

const { density } = useSettingsStore()
</script>

<template>
  <MConfigProvider :locale="zhCN" :density="density">
    <RouterView />
  </MConfigProvider>
</template>

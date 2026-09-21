<script setup lang="ts">
import { MConfigProvider, MMessage, zhCN } from 'morya-ui'
</script>

<template>
  <MConfigProvider :locale="zhCN">
    <RouterView />
    <MMessage />
  </MConfigProvider>
</template>

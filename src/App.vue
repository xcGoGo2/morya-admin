<script setup lang="ts">
import { MConfigProvider, zhCN } from 'morya-ui'
</script>

<template>
  <MConfigProvider :locale="zhCN">
    <RouterView />
  </MConfigProvider>
</template>

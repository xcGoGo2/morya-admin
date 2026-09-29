<script setup lang="ts">
/**
 * Optional elevated surface for rare in-page panels.
 * Admin main chrome is the single content-shell MCard in AdminLayout —
 * prefer MPageContent fill + MTable fill for lists; do not wrap them again.
 */
import { MCard } from 'morya-ui'

withDefaults(defineProps<{
  fill?: boolean
  title?: string
  subtitle?: string
  ariaLabel?: string
}>(), {
  fill: false,
})
</script>

<template>
  <MCard
    class="page-card"
    :class="{ 'page-card--fill': fill }"
    :title="title"
    :subtitle="subtitle"
    :aria-label="ariaLabel"
    bordered
    shadow="always"
  >
    <slot />
  </MCard>
</template>

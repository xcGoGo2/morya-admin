<script setup lang="ts">
import type { DensityPreference } from 'morya-ui'
import type { ContentWidth } from '../stores/settings'
import {
  MButton,
  MDrawer,
  message,
  MRadio,
  MSpace,
  MSwitch,
  useDensity,
} from 'morya-ui'
import { onMounted, watch } from 'vue'
import { useSettingsStore } from '../stores/settings'

const open = defineModel<boolean>({ default: false })
const settings = useSettingsStore()
const { setDensity, preference } = useDensity()

onMounted(() => {
  setDensity(settings.density.value)
})

watch(
  () => settings.density.value,
  (d) => {
    if (preference.value !== d)
      setDensity(d)
  },
)

function onDensity(value: DensityPreference) {
  settings.setDensity(value)
  setDensity(value)
}

function onContentWidth(value: ContentWidth) {
  settings.setContentWidth(value)
}

function onReset() {
  settings.reset()
  setDensity(settings.density.value)
  message.success('已恢复默认布局设置')
}
</script>

<template>
  <MDrawer v-model="open" header="布局设置" position="right" width="22rem">
    <div class="settings">
      <section class="settings__block">
        <h3 class="settings__title">
          显示
        </h3>
        <MSwitch
          :model-value="settings.showTabs.value"
          label="多页签栏"
          @update:model-value="settings.setShowTabs"
        />
      </section>

      <section class="settings__block">
        <h3 class="settings__title">
          内容宽度
        </h3>
        <MSpace wrap>
          <MRadio
            name="content-width"
            value="fluid"
            label="流式"
            :model-value="settings.contentWidth.value"
            @update:model-value="onContentWidth($event as ContentWidth)"
          />
          <MRadio
            name="content-width"
            value="fixed"
            label="定宽"
            :model-value="settings.contentWidth.value"
            @update:model-value="onContentWidth($event as ContentWidth)"
          />
        </MSpace>
      </section>

      <section class="settings__block">
        <h3 class="settings__title">
          内容密度
        </h3>
        <MSpace wrap>
          <MRadio
            name="density"
            value="compact"
            label="紧凑"
            :model-value="settings.density.value"
            @update:model-value="onDensity($event as DensityPreference)"
          />
          <MRadio
            name="density"
            value="comfortable"
            label="适中"
            :model-value="settings.density.value"
            @update:model-value="onDensity($event as DensityPreference)"
          />
          <MRadio
            name="density"
            value="spacious"
            label="宽松"
            :model-value="settings.density.value"
            @update:model-value="onDensity($event as DensityPreference)"
          />
        </MSpace>
      </section>

      <MButton label="恢复默认" @click="onReset" block type="text" />
    </div>
  </MDrawer>
</template>

<style scoped>
.settings {
  display: grid;
  gap: var(--m-space-6);
}

.settings__block {
  display: grid;
  gap: var(--m-space-3);
}

.settings__title {
  margin: 0;
  font-size: var(--m-font-size-sm);
  font-weight: 650;
  color: var(--m-color-text);
}
</style>

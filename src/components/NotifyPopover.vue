<script setup lang="ts">
import { MBadge, MButton, MEmpty, MIcon, MPopover, MScrollbar, MTabs } from 'morya-ui'
import { computed, ref } from 'vue'
import { notifications } from '../api/mock'
import type { NotifyItem, NotifyKind } from '../types'

const open = ref(false)
const kind = ref<NotifyKind>('notice')
const items = ref<NotifyItem[]>(notifications.map((n) => ({ ...n })))

const kinds: { key: NotifyKind; label: string }[] = [
  { key: 'notice', label: '通知' },
  { key: 'message', label: '消息' },
  { key: 'todo', label: '待办' },
]

const filtered = computed(() => items.value.filter((i) => i.kind === kind.value))
const unreadTotal = computed(() => items.value.filter((i) => i.unread).length)
const bellLabel = computed(() => (unreadTotal.value ? `通知，${unreadTotal.value} 条未读` : '通知'))

const kindTabs = computed(() =>
  kinds.map((k) => {
    const unread = items.value.filter((i) => i.kind === k.key && i.unread).length
    return { label: unread ? `${k.label} ${unread}` : k.label, value: k.key }
  }),
)

function readAll() {
  items.value.forEach((i) => (i.unread = false))
}

function readOne(item: NotifyItem) {
  item.unread = false
}
</script>

<template>
  <MPopover v-model="open" placement="bottom-end" :pt="{ root: { style: 'padding:0' } }">
    <MBadge v-if="unreadTotal" :value="unreadTotal" :max="99" severity="danger" size="small">
      <MButton
        class="notify-trigger"
        icon="bell"
        icon-only
        quaternary
        :aria-label="bellLabel"
        @click="open = !open"
      />
    </MBadge>
    <MButton
      v-else
      class="notify-trigger"
      icon="bell"
      icon-only
      quaternary
      :aria-label="bellLabel"
      @click="open = !open"
    />

    <template #content>
      <div class="notify">
        <MTabs v-model="kind" :tabs="kindTabs" aria-label="通知分类">
          <template #extra>
            <MButton label="全部已读" text size="small" :disabled="!unreadTotal" @click="readAll" />
          </template>

          <MScrollbar class="notify__scroll" max-height="22rem">
            <template v-if="filtered.length">
              <button
                v-for="item in filtered"
                :key="item.id"
                type="button"
                class="notify__item"
                :class="{ unread: item.unread }"
                @click="readOne(item)"
              >
                <span class="notify__ico" :data-tone="item.tone">
                  <MIcon :name="item.icon" size="sm" />
                </span>
                <span class="notify__main">
                  <span class="notify__title">{{ item.title }}</span>
                  <span class="notify__desc">{{ item.desc }}</span>
                  <span class="notify__time">{{ item.time }}</span>
                </span>
              </button>
            </template>
            <MEmpty v-else simple title="" description="暂无内容" />
          </MScrollbar>
        </MTabs>

        <MButton class="notify__foot" label="查看全部" text fluid @click="open = false" />
      </div>
    </template>
  </MPopover>
</template>

<style scoped>
[data-m-motion='full'] .notify-trigger:hover :deep(svg) {
  animation: notify-bell-swing 0.6s ease;
  transform-origin: top center;
}

@keyframes notify-bell-swing {
  0%,
  100% {
    transform: rotate(0deg);
  }

  20% {
    transform: rotate(12deg);
  }

  40% {
    transform: rotate(-10deg);
  }

  60% {
    transform: rotate(6deg);
  }

  80% {
    transform: rotate(-4deg);
  }
}

.notify {
  width: 22rem;
  max-width: calc(100vw - 2rem);
}

.notify__scroll {
  width: 100%;
}

.notify__foot {
  border-top: 1px solid var(--m-color-border);
  border-radius: 0;
}

.notify__item {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: var(--m-space-3);
  width: 100%;
  padding: var(--m-space-3);
  border: none;
  border-radius: var(--m-radius-md);
  background: transparent;
  color: var(--m-color-text);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: background var(--m-motion-fast);
}

.notify__item:hover {
  background: var(--m-color-fill-lighter);
}

.notify__item.unread::after {
  content: '';
  position: absolute;
  top: var(--m-space-4);
  right: var(--m-space-3);
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 50%;
  background: var(--m-color-danger);
}

.notify__ico {
  flex: none;
  display: grid;
  place-items: center;
  width: 2.125rem;
  height: 2.125rem;
  border-radius: var(--m-radius-md);
}

.notify__ico[data-tone='primary'] {
  background: color-mix(in srgb, var(--m-color-primary) 12%, transparent);
  color: var(--m-color-primary);
}

.notify__ico[data-tone='success'] {
  background: color-mix(in srgb, var(--m-color-success) 12%, transparent);
  color: var(--m-color-success);
}

.notify__ico[data-tone='warn'] {
  background: color-mix(in srgb, var(--m-color-warn) 13%, transparent);
  color: var(--m-color-warn);
}

.notify__ico[data-tone='help'] {
  background: color-mix(in srgb, var(--m-color-help) 12%, transparent);
  color: var(--m-color-help);
}

.notify__main {
  flex: 1;
  min-width: 0;
  display: grid;
  gap: 0.15rem;
  padding-right: var(--m-space-3);
}

.notify__title {
  font-size: var(--m-font-size-sm);
  font-weight: 600;
}

.notify__desc {
  font-size: var(--m-font-size-xs);
  color: var(--m-color-text-muted);
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notify__time {
  font-size: var(--m-font-size-xs);
  color: var(--m-color-text-muted);
}
</style>

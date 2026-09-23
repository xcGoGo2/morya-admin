<script setup lang="ts">
import { MButton, MEmpty, MIcon, MPopover } from 'morya-ui'
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

function unreadOf(k: NotifyKind) {
  return items.value.filter((i) => i.kind === k && i.unread).length
}

function readAll() {
  items.value.forEach((i) => (i.unread = false))
}

function readOne(item: NotifyItem) {
  item.unread = false
}
</script>

<template>
  <MPopover v-model="open" placement="bottom-end" :pt="{ root: { style: 'padding:0' } }">
    <button
      type="button"
      class="notify-trigger"
      :class="{ open }"
      :aria-label="unreadTotal ? `通知，${unreadTotal} 条未读` : '通知'"
      @click="open = !open"
    >
      <MIcon name="bell" class="notify-trigger__bell" />
      <span v-if="unreadTotal" class="notify-trigger__badge">
        {{ unreadTotal > 99 ? '99+' : unreadTotal }}
      </span>
    </button>

    <template #content>
      <div class="notify">
        <div class="notify__head">
          <div class="notify__tabs" role="tablist" aria-label="通知分类">
            <button
              v-for="k in kinds"
              :key="k.key"
              type="button"
              role="tab"
              class="notify__tab"
              :class="{ on: kind === k.key }"
              :aria-selected="kind === k.key"
              @click="kind = k.key"
            >
              {{ k.label }}
              <span v-if="unreadOf(k.key)" class="notify__count">{{ unreadOf(k.key) }}</span>
            </button>
          </div>
          <MButton label="全部已读" text size="small" :disabled="!unreadTotal" @click="readAll" />
        </div>

        <div class="notify__body">
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
        </div>

        <button type="button" class="notify__foot" @click="open = false">查看全部</button>
      </div>
    </template>
  </MPopover>
</template>

<style scoped>
.notify-trigger {
  position: relative;
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border: none;
  border-radius: var(--m-radius-md);
  background: transparent;
  color: var(--m-color-text-muted);
  font: inherit;
  cursor: pointer;
  transition:
    background var(--m-motion-fast),
    color var(--m-motion-fast);
}

.notify-trigger:hover,
.notify-trigger.open {
  background: var(--m-color-fill-lighter);
  color: var(--m-color-text);
}

.notify-trigger:focus-visible {
  outline: 2px solid var(--m-color-focus-ring);
  outline-offset: 1px;
}

.notify-trigger__badge {
  position: absolute;
  top: 0.125rem;
  right: 0.0625rem;
  min-width: 1rem;
  height: 1rem;
  padding: 0 var(--m-space-1);
  border-radius: var(--m-radius-full, 999px);
  border: 2px solid var(--m-color-surface);
  background: var(--m-color-danger);
  color: var(--m-color-on-emphasis);
  font-size: var(--m-font-size-xs);
  font-weight: 600;
  line-height: 0.75rem;
  text-align: center;
  transform: scale(0.85);
  transform-origin: top right;
  pointer-events: none;
}

@media (prefers-reduced-motion: no-preference) {
  .notify-trigger:hover .notify-trigger__bell {
    animation: notify-bell-swing 0.6s ease;
    transform-origin: top center;
  }
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
  display: flex;
  flex-direction: column;
}

.notify__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--m-space-2);
  padding: var(--m-space-3) var(--m-space-3) 0;
}

.notify__tabs {
  display: flex;
  gap: var(--m-space-1);
}

.notify__tab {
  display: inline-flex;
  align-items: center;
  gap: var(--m-space-1);
  height: 1.875rem;
  padding: 0 var(--m-space-3);
  border: none;
  border-radius: var(--m-radius-sm);
  background: transparent;
  color: var(--m-color-text-muted);
  font: inherit;
  font-size: var(--m-font-size-sm);
  cursor: pointer;
  transition:
    background var(--m-motion-fast),
    color var(--m-motion-fast);
}

.notify__tab:hover {
  background: var(--m-color-fill-lighter);
  color: var(--m-color-text);
}

.notify__tab.on {
  background: color-mix(in srgb, var(--m-color-primary) 12%, transparent);
  color: var(--m-color-primary);
  font-weight: 600;
}

.notify__count {
  min-width: 1rem;
  height: 1rem;
  padding: 0 var(--m-space-1);
  border-radius: var(--m-radius-full, 999px);
  background: var(--m-color-danger);
  color: var(--m-color-on-emphasis);
  font-size: var(--m-font-size-xs);
  line-height: 1rem;
  text-align: center;
}

.notify__tab.on .notify__count {
  background: var(--m-color-primary);
}

.notify__body {
  max-height: 22rem;
  overflow-y: auto;
  padding: var(--m-space-2);
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

.notify__foot {
  padding: var(--m-space-3);
  border: none;
  border-top: 1px solid var(--m-color-border);
  background: transparent;
  color: var(--m-color-primary);
  font: inherit;
  font-size: var(--m-font-size-sm);
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  transition: background var(--m-motion-fast);
}

.notify__foot:hover {
  background: var(--m-color-fill-lighter);
}
</style>

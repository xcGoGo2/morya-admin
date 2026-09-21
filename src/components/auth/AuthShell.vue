<script setup lang="ts">
defineProps<{
  brandTitle?: string
  brandLead?: string
}>()
</script>

<template>
  <div class="auth-shell">
    <aside class="auth-brand" aria-label="品牌">
      <p class="auth-brand__mark">Morya Admin</p>
      <h1 class="auth-brand__title">{{ brandTitle ?? '用同一套组件搭后台' }}</h1>
      <p class="auth-brand__lead">
        {{
          brandLead ??
          '基于 morya-ui 的纯前端管理模板。登录后进入工作台，列表与表单可按黄金样例继续扩展。'
        }}
      </p>
    </aside>

    <main class="auth-main">
      <div class="auth-panel">
        <slot />
      </div>
    </main>
  </div>
</template>

<style scoped>
.auth-shell {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  min-height: 100vh;
  background: var(--m-color-surface);
  color: var(--m-color-text);
}

.auth-brand {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: var(--m-space-4);
  padding: clamp(2rem, 6vw, 4.5rem);
  overflow: hidden;
  background:
    radial-gradient(
      80% 60% at 10% 20%,
      color-mix(in srgb, var(--m-color-primary) 22%, transparent),
      transparent 55%
    ),
    linear-gradient(
      165deg,
      color-mix(in srgb, var(--m-color-primary) 16%, var(--m-color-surface)) 0%,
      var(--m-color-surface) 55%,
      color-mix(in srgb, var(--m-color-border) 35%, var(--m-color-surface)) 100%
    );
  border-right: 1px solid var(--m-color-border);
}

.auth-brand::after {
  content: '';
  position: absolute;
  inset: auto -10% -20% 40%;
  height: 55%;
  border-radius: 50%;
  background: color-mix(in srgb, var(--m-color-primary) 12%, transparent);
  pointer-events: none;
}

.auth-brand__mark,
.auth-brand__title,
.auth-brand__lead {
  position: relative;
  z-index: 1;
}

.auth-brand__mark {
  margin: 0;
  font-size: 0.8125rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--m-color-text-muted);
}

.auth-brand__title {
  margin: 0;
  max-width: 12em;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 650;
  line-height: 1.15;
  letter-spacing: -0.03em;
}

.auth-brand__lead {
  margin: 0;
  max-width: 28rem;
  color: var(--m-color-text-muted);
  line-height: 1.6;
}

.auth-main {
  display: grid;
  place-items: center;
  padding: var(--m-space-6);
}

.auth-panel {
  width: min(100%, 22rem);
}

@media (prefers-reduced-motion: no-preference) {
  .auth-panel {
    animation: auth-panel-in 420ms ease both;
  }
}

@keyframes auth-panel-in {
  from {
    opacity: 0;
    transform: translateY(0.5rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .auth-shell {
    grid-template-columns: 1fr;
  }

  .auth-brand {
    border-right: 0;
    border-bottom: 1px solid var(--m-color-border);
    min-height: 12rem;
  }
}
</style>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'morya-ui'
import {
  MButton,
  MForm,
  MFormItem,
  MIcon,
  MInput,
  MResult,
  message,
  useTheme,
} from 'morya-ui'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { forgotPasswordApi } from '../../api/auth'

const router = useRouter()
const { isDark, toggleTheme } = useTheme()

const formRef = ref<FormInstance | null>(null)
const submitting = ref(false)
const sent = ref(false)
const formError = ref('')

const model = reactive({
  email: '',
})

const rules: FormRules = {
  email: [
    { required: true, message: '请输入注册邮箱' },
    {
      validator: (value: unknown) => {
        if (typeof value !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return '邮箱格式不正确'
        return true
      },
    },
  ],
}

async function onSubmit() {
  formError.value = ''
  const { valid } = await formRef.value!.validate()
  if (!valid)
    return

  submitting.value = true
  try {
    await forgotPasswordApi(model.email)
    sent.value = true
    message.success('重置邮件已发送（演示）')
  }
  catch {
    formError.value = '发送失败，请稍后再试。'
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="login-shell">
    <aside class="login-brand" aria-label="品牌介绍">
      <div class="login-brand__top">
        <span class="login-brand__logo" aria-hidden="true">
          <MIcon name="bolt" size="sm" />
        </span>
        <span class="login-brand__mark">Morya Admin</span>
      </div>

      <div class="login-brand__copy">
        <h1 class="login-brand__title">
          找回访问权限
        </h1>
        <p class="login-brand__lead">
          输入账号绑定的邮箱，我们会发送一封重置链接（本页为高保真 Mock 演示）。
        </p>
      </div>

      <p class="login-brand__foot">
        © 2026 Morya Admin · 高保真原型演示
      </p>
    </aside>

    <main class="login-main">
      <MButton
        class="login-theme"
        :icon="isDark ? 'sun' : 'moon'"
        icon-only
        quaternary
        :aria-label="isDark ? '切换到浅色模式' : '切换到深色模式'"
        @click="toggleTheme"
      />

      <div class="login-panel">
        <template v-if="!sent">
          <header class="login-panel__header">
            <p class="login-panel__eyebrow">账号安全</p>
            <h2>忘记密码</h2>
            <p>填写邮箱后即可继续（演示不会真正发信）</p>
          </header>

          <p v-if="formError" class="login-alert" role="alert">
            {{ formError }}
          </p>

          <MForm
            ref="formRef"
            :model="model"
            :rules="rules"
            validate-on="submit"
            @submit="onSubmit"
          >
            <MFormItem label="邮箱" name="email">
              <template #default="{ id, invalid }">
                <MInput
                  :id="id"
                  v-model="model.email"
                  placeholder="name@example.com"
                  autocomplete="email"
                  :invalid="invalid"
                  fluid
                />
              </template>
            </MFormItem>

            <MButton
              native-type="submit"
              label="发送重置链接"
              size="large"
              :loading="submitting"
              fluid
            />
          </MForm>

          <MButton
            class="login-back"
            label="返回登录"
            link
            icon="arrow-left"
            @click="router.push('/login')"
          />
        </template>

        <MResult
          v-else
          status="success"
          title="邮件已发送"
          description="请查收收件箱（演示）。随后可用新密码登录。"
          size="large"
        >
          <template #footer>
            <MButton label="返回登录" icon="login" @click="router.push('/login')" />
          </template>
        </MResult>
      </div>
    </main>
  </div>
</template>

<style scoped>
.login-shell {
  display: grid;
  grid-template-columns: minmax(16rem, 0.95fr) minmax(20rem, 1.05fr);
  min-height: 100vh;
  background: var(--m-color-surface);
  color: var(--m-color-text);
}

.login-brand {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: var(--m-space-4);
  padding: clamp(2rem, 6vw, 4.5rem);
  background: color-mix(in srgb, var(--m-color-primary) 12%, var(--m-color-surface));
  border-right: 1px solid var(--m-color-border);
}

.login-brand__top {
  display: flex;
  align-items: center;
  gap: var(--m-space-3);
  margin-bottom: auto;
}

.login-brand__logo {
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: var(--m-radius-md);
  color: var(--m-color-on-emphasis);
  background: var(--m-color-primary);
}

.login-brand__mark {
  margin: 0;
  font-size: var(--m-font-size-sm);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--m-color-text-muted);
}

.login-brand__copy {
  display: flex;
  flex-direction: column;
  gap: var(--m-space-4);
}

.login-brand__title {
  margin: 0;
  max-width: 12em;
  font-size: clamp(1.75rem, 3vw, 2.25rem);
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--m-color-text);
}

.login-brand__lead {
  margin: 0;
  max-width: 28rem;
  line-height: 1.65;
  color: var(--m-color-text-muted);
  font-size: var(--m-font-size-md);
}

.login-brand__foot {
  margin: var(--m-space-4) 0 0;
  font-size: var(--m-font-size-xs);
  color: var(--m-color-text-muted);
}

.login-main {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--m-space-6);
  background: var(--m-color-surface);
}

.login-theme {
  position: absolute;
  top: var(--m-space-4);
  right: var(--m-space-4);
}

.login-panel {
  width: min(100%, 22rem);
  display: flex;
  flex-direction: column;
  gap: var(--m-space-4);
}

.login-panel__header {
  margin-bottom: 0;
}

.login-panel__eyebrow {
  margin: 0 0 var(--m-space-2);
  font-size: var(--m-font-size-xs);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--m-color-primary);
}

.login-panel__header h2 {
  margin: 0 0 var(--m-space-2);
  font-size: var(--m-font-size-xl);
  font-weight: 650;
  letter-spacing: -0.02em;
}

.login-panel__header p {
  margin: 0;
  color: var(--m-color-text-muted);
  font-size: var(--m-font-size-sm);
  line-height: 1.5;
}

.login-back {
  margin-top: 0;
}

.login-alert {
  margin: 0;
  padding: var(--m-space-3) var(--m-space-4);
  border: 1px solid color-mix(in srgb, var(--m-color-danger) 40%, var(--m-color-border));
  border-radius: var(--m-radius-md);
  background: color-mix(in srgb, var(--m-color-danger) 10%, var(--m-color-surface));
  color: var(--m-color-danger);
  font-size: var(--m-font-size-sm);
}

@media (max-width: 720px) {
  .login-shell {
    grid-template-columns: 1fr;
  }

  .login-brand {
    border-right: none;
    border-bottom: 1px solid var(--m-color-border);
    padding: var(--m-space-5);
    justify-content: flex-start;
  }

  .login-brand__top {
    margin-bottom: 0;
  }

  .login-brand__copy,
  .login-brand__foot {
    display: none;
  }
}
</style>

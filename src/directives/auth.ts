import type { Directive, DirectiveBinding } from 'vue'
import { useAuthStore } from '../stores/auth'

function resolveCodes(value: unknown): string[] {
  if (typeof value === 'string')
    return value ? [value] : []
  if (Array.isArray(value))
    return value.filter((v): v is string => typeof v === 'string' && !!v)
  return []
}

function apply(el: HTMLElement, binding: DirectiveBinding) {
  const codes = resolveCodes(binding.value)
  if (!codes.length)
    return

  const { hasPermission } = useAuthStore()
  const ok = codes.some(code => hasPermission(code))
  el.style.display = ok ? '' : 'none'
  if (!ok)
    el.setAttribute('aria-hidden', 'true')
  else
    el.removeAttribute('aria-hidden')
}

/** 按钮级权限：无任一码时隐藏元素。用法 v-auth="'user:create'" 或 v-auth="['a','b']" */
export const vAuth: Directive<HTMLElement, string | string[]> = {
  mounted: apply,
  updated: apply,
}

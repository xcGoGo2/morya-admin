<script setup lang="ts">
import {
  MCard,
  MEmpty,
  MGrid,
  MGridItem,
  MPageContent,
  MPageHeader,
  MPagePlaceholder,
  MPageStat,
  MStatus,
  MTable,
  MTag,
  type IconName,
} from 'morya-ui'
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const greeting = computed(() => {
  const name = auth.user?.name ?? '同事'
  return `你好，${name}`
})

const stats: Array<{
  label: string
  value: string
  trend: string
  trendSeverity?: 'primary' | 'secondary' | 'warn'
  icon: IconName
}> = [
  { label: '模板模块', value: '3', trend: '已就绪', icon: 'layout-dashboard' },
  { label: 'Mock 接口', value: '登录 / 注册', trend: '本地存储', trendSeverity: 'secondary', icon: 'database' },
  { label: '待扩展列表', value: '用户', trend: '占位中', trendSeverity: 'warn', icon: 'users' },
  { label: '设计契约', value: 'morya-ui', trend: 'Token 优先', icon: 'palette' },
]

const recentColumns = [
  { key: 'id', label: '编号', width: 96 },
  { key: 'title', label: '事项' },
  { key: 'area', label: '区域', width: 110 },
  { key: 'status', label: '状态', width: 110 },
]

const recentRows = [
  { id: 'T-01', title: '完善登录态与路由守卫', area: '账号', status: 'done' },
  { id: 'T-02', title: '接入用户列表黄金样例', area: '用户', status: 'open' },
  { id: 'T-03', title: '补齐系统设置表单页', area: '设置', status: 'progress' },
]

function areaSeverity(area: string) {
  if (area === '账号') return 'info'
  if (area === '用户') return 'warn'
  return 'secondary'
}

function statusLabel(status: string) {
  if (status === 'open') return '待开始'
  if (status === 'progress') return '进行中'
  return '已完成'
}

function statusSeverity(status: string) {
  if (status === 'open') return 'warn'
  if (status === 'progress') return 'info'
  return 'success'
}
</script>

<template>
  <MPageContent density="spacious">
    <MPageHeader
      :title="greeting"
      description="这是登录后的工作台占位。KPI、趋势与待办仅用于演示布局，可按业务替换。"
    />

    <MGrid :cols="4" :x-gap="16" :y-gap="16" responsive="screen">
      <MGridItem v-for="item in stats" :key="item.label" :span="1">
        <MPageStat
          :label="item.label"
          :value="item.value"
          :trend="item.trend"
          :trend-severity="item.trendSeverity ?? 'primary'"
          :icon="item.icon"
        />
      </MGridItem>
    </MGrid>

    <MGrid :cols="2" :x-gap="16" :y-gap="16" responsive="screen">
      <MGridItem :span="1">
        <MCard title="扩展建议">
          <MPagePlaceholder
            aria-label="图表占位"
            description="下一步可接入图表，或用 get_golden_page(list-page) 生成用户列表。"
          />
        </MCard>
      </MGridItem>
      <MGridItem :span="1">
        <MCard title="模板待办">
          <MTable
            :columns="recentColumns"
            :rows="recentRows"
            size="small"
            :paginator="false"
            bordered
            row-key="id"
            aria-label="模板待办"
          >
            <template #cell-area="{ value }">
              <MTag :value="String(value)" :severity="areaSeverity(String(value))" />
            </template>
            <template #cell-status="{ value }">
              <MStatus
                :label="statusLabel(String(value))"
                :severity="statusSeverity(String(value))"
              />
            </template>
            <template #empty>
              <MEmpty title="暂无待办" description="接入真实数据后会显示在这里。" />
            </template>
          </MTable>
        </MCard>
      </MGridItem>
    </MGrid>
  </MPageContent>
</template>

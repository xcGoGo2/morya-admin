<script setup lang="ts">
import type { TimelineEvent } from 'morya-ui'
import {
  MCard,
  MCheckbox,
  MGrid,
  MGridItem,
  MPageContent,
  MPageHeader,
  MPageStat,
  MTag,
  MTimeline,
} from 'morya-ui'
import { computed, ref } from 'vue'
import { activities, stats, todos, trafficSources, visitTrend } from '../../api/mock'
import { useAuthStore } from '../../stores/auth'

const { nickname } = useAuthStore()

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 6)
    return '夜深了'
  if (h < 9)
    return '早上好'
  if (h < 12)
    return '上午好'
  if (h < 14)
    return '中午好'
  if (h < 18)
    return '下午好'
  return '晚上好'
})

const today = new Date()
const week = ['日', '一', '二', '三', '四', '五', '六'][today.getDay()]
const todayText = `${today.getFullYear()} 年 ${today.getMonth() + 1} 月 ${today.getDate()} 日 · 星期${week}`

/* ---------- 访问趋势折线图（SVG） ---------- */
const CHART_W = 640
const CHART_H = 220
const PAD = 12

function buildPoints(key: 'visits' | 'visitors') {
  const max = Math.max(...visitTrend.map(p => p[key]))
  const stepX = (CHART_W - PAD * 2) / (visitTrend.length - 1)
  return visitTrend.map((p, i) => {
    const x = PAD + i * stepX
    const y = CHART_H - PAD - (p[key] / max) * (CHART_H - PAD * 2)
    return { x, y, ...p }
  })
}

const visitPoints = buildPoints('visits')
const visitorPoints = buildPoints('visitors')

const visitLine = visitPoints.map(p => `${p.x},${p.y}`).join(' ')
const visitorLine = visitorPoints.map(p => `${p.x},${p.y}`).join(' ')
const visitArea = `${PAD},${CHART_H - PAD} ${visitLine} ${CHART_W - PAD},${CHART_H - PAD}`

/* ---------- 流量来源甜甜圈 ---------- */
const TONE_COLOR: Record<string, string> = {
  primary: 'var(--m-color-primary)',
  help: 'var(--m-color-help)',
  info: 'var(--m-color-info)',
  warn: 'var(--m-color-warn)',
}

const donutStyle = computed(() => {
  let acc = 0
  const stops = trafficSources.map((s) => {
    const from = acc
    acc += s.percent
    return `${TONE_COLOR[s.color]} ${from}% ${acc}%`
  })
  return { background: `conic-gradient(${stops.join(', ')})` }
})

/* ---------- 待办 ---------- */
const todoList = ref(todos.map(t => ({ ...t })))
const PRIORITY_TAG: Record<string, { label: string, severity: 'danger' | 'warn' | 'success' }> = {
  high: { label: '高', severity: 'danger' },
  mid: { label: '中', severity: 'warn' },
  low: { label: '低', severity: 'success' },
}

/* ---------- 最近动态 ---------- */
const timelineEvents: TimelineEvent[] = activities.map(a => ({
  content: a.content,
  date: a.time,
  icon: a.icon,
  severity: a.severity,
}))
</script>

<template>
  <MPageContent density="spacious" aria-label="工作台">
    <MPageHeader
      :title="`${greeting}，${nickname}`"
      :description="`${todayText}。关注访问、订单和待办。`"
    />

    <MGrid :cols="4" :x-gap="16" :y-gap="16" responsive="screen">
      <MGridItem v-for="s in stats" :key="s.label">
        <MPageStat
          :label="s.label"
          :value="s.value"
          :trend="`${s.up ? '+' : '-'}${s.trend}`"
          :trend-direction="s.up ? 'up' : 'down'"
          :trend-label="s.hint"
          :trend-severity="s.up ? 'success' : 'danger'"
          :icon="s.icon"
        />
      </MGridItem>
    </MGrid>

    <!-- 趋势 + 流量 -->
    <MGrid cols="1 l:2" :x-gap="16" :y-gap="16" responsive="screen">
      <MGridItem>
        <MCard title="访问趋势" subtitle="近 7 日访问量与访客数" shadow="always">
          <div class="chart" role="img" aria-label="近 7 日访问趋势折线图">
            <svg :viewBox="`0 0 ${CHART_W} ${CHART_H}`" preserveAspectRatio="none">
              <polygon
                :points="visitArea"
                fill="var(--m-color-primary)"
                fill-opacity="0.08"
              />
              <polyline
                :points="visitLine"
                fill="none"
                stroke="var(--m-color-primary)"
                stroke-width="2.5"
                stroke-linejoin="round"
                stroke-linecap="round"
              />
              <polyline
                :points="visitorLine"
                fill="none"
                stroke="var(--m-color-success)"
                stroke-width="2.5"
                stroke-dasharray="5 5"
                stroke-linejoin="round"
                stroke-linecap="round"
              />
              <circle
                v-for="p in visitPoints"
                :key="`v-${p.date}`"
                :cx="p.x"
                :cy="p.y"
                r="3.5"
                fill="var(--m-color-surface)"
                stroke="var(--m-color-primary)"
                stroke-width="2"
              />
            </svg>
          </div>
          <div class="chart-meta">
            <span v-for="p in visitTrend" :key="p.date" class="chart-meta__x">{{ p.date }}</span>
          </div>
          <div class="chart-legend">
            <span><i class="dot dot--primary" />访问量</span>
            <span><i class="dot dot--success" />访客数</span>
          </div>
        </MCard>
      </MGridItem>

      <MGridItem>
        <MCard title="流量来源" subtitle="各渠道访问占比" shadow="always">
          <div class="traffic">
            <div class="traffic__donut" :style="donutStyle" role="img" aria-label="流量来源占比图">
              <div class="traffic__donut-hole">
                <b>100%</b>
                <span>总访问</span>
              </div>
            </div>
            <ul class="traffic__legend">
              <li v-for="s in trafficSources" :key="s.name">
                <i class="dot" :style="{ background: TONE_COLOR[s.color] }" />
                <span class="traffic__name">{{ s.name }}</span>
                <b>{{ s.percent }}%</b>
              </li>
            </ul>
          </div>
        </MCard>
      </MGridItem>
    </MGrid>

    <!-- 待办 + 动态 -->
    <MGrid cols="1 l:2" :x-gap="16" :y-gap="16" responsive="screen">
      <MGridItem>
        <MCard title="待办事项" :subtitle="`共 ${todoList.filter((t) => !t.done).length} 项未完成`" shadow="always">
          <ul class="todo">
            <li v-for="t in todoList" :key="t.id" :class="{ 'todo--done': t.done }">
              <MCheckbox v-model="t.done" :aria-label="`完成待办：${t.title}`" />
              <span class="todo__title">{{ t.title }}</span>
              <MTag
                :value="PRIORITY_TAG[t.priority].label"
                :severity="PRIORITY_TAG[t.priority].severity"
                size="small"
                rounded
              />
              <span class="todo__time">{{ t.time }}</span>
            </li>
          </ul>
        </MCard>
      </MGridItem>

      <MGridItem>
        <MCard title="最近动态" subtitle="系统与用户操作记录" shadow="always">
          <MTimeline :value="timelineEvents" />
        </MCard>
      </MGridItem>
    </MGrid>
  </MPageContent>
</template>

<style scoped>
/* ---------- 折线图 ---------- */
.chart {
  width: 100%;
  aspect-ratio: 640 / 220;
}

.chart svg {
  display: block;
  width: 100%;
  height: 100%;
}

.chart-meta {
  display: flex;
  justify-content: space-between;
  padding: 0 var(--m-space-1);
  margin-top: var(--m-space-1);
  color: var(--m-color-text-muted);
  font-size: var(--m-font-size-xs);
}

.chart-legend {
  display: flex;
  gap: var(--m-space-5);
  margin-top: var(--m-space-3);
  color: var(--m-color-text-muted);
  font-size: var(--m-font-size-xs);
}

.chart-legend span {
  display: inline-flex;
  align-items: center;
  gap: var(--m-space-2);
}

.dot {
  display: inline-block;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
}

.dot--primary {
  background: var(--m-color-primary);
}

.dot--success {
  background: var(--m-color-success);
}

/* ---------- 流量来源 ---------- */
.traffic {
  display: flex;
  align-items: center;
  gap: var(--m-space-6);
  flex-wrap: wrap;
}

.traffic__donut {
  position: relative;
  flex: none;
  width: 9.5rem;
  height: 9.5rem;
  border-radius: 50%;
}

.traffic__donut-hole {
  position: absolute;
  inset: 22%;
  display: grid;
  place-content: center;
  text-align: center;
  gap: var(--m-space-1);
  border-radius: 50%;
  background: var(--m-color-surface);
}

.traffic__donut-hole b {
  font-size: var(--m-font-size-lg);
}

.traffic__donut-hole span {
  font-size: var(--m-font-size-xs);
  color: var(--m-color-text-muted);
}

.traffic__legend {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  min-width: 10rem;
  display: grid;
  gap: var(--m-space-3);
}

.traffic__legend li {
  display: flex;
  align-items: center;
  gap: var(--m-space-2);
  font-size: var(--m-font-size-sm);
}

.traffic__name {
  color: var(--m-color-text-muted);
  flex: 1;
}

/* ---------- 待办 ---------- */
.todo {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
}

.todo li {
  display: flex;
  align-items: center;
  gap: var(--m-space-3);
  padding: var(--m-space-3) 0;
  border-bottom: 1px solid var(--m-color-border);
}

.todo li:last-child {
  border-bottom: none;
}

.todo__title {
  flex: 1;
  min-width: 0;
  font-size: var(--m-font-size-sm);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.todo__time {
  flex: none;
  font-size: var(--m-font-size-xs);
  color: var(--m-color-text-muted);
}

.todo--done .todo__title {
  color: var(--m-color-text-muted);
  text-decoration: line-through;
}
</style>

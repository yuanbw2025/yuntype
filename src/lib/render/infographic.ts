// 程序化信息图渲染引擎 — 4种模板，继承当前配色，输出高质量HTML

import type { StyleCombo } from '../atoms'

// ═══════════════════════════════════════
//  类型定义
// ═══════════════════════════════════════

export type InfographicType = 'flow' | 'comparison' | 'card' | 'timeline'

export interface FlowData {
  type: 'flow'
  title?: string
  steps: string[]
}

export interface ComparisonData {
  type: 'comparison'
  title?: string
  columns: { title: string; items: string[] }[]
}

export interface CardData {
  type: 'card'
  title: string
  points: string[]
  icon?: string
}

export interface TimelineData {
  type: 'timeline'
  title?: string
  events: { time: string; content: string }[]
}

export type InfographicData = FlowData | ComparisonData | CardData | TimelineData

export interface InfographicConfig {
  data: InfographicData
  style: StyleCombo
  width: number // 375 for wechat, 1080 for xhs
}

// ═══════════════════════════════════════
//  主入口
// ═══════════════════════════════════════

export function renderInfographic(config: InfographicConfig): string {
  const { data, style, width } = config
  const scale = width / 375 // 以375为基准缩放

  switch (data.type) {
    case 'flow':
      return renderFlowChart(data, style, width, scale)
    case 'comparison':
      return renderComparisonTable(data, style, width, scale)
    case 'card':
      return renderKnowledgeCard(data, style, width, scale)
    case 'timeline':
      return renderTimeline(data, style, width, scale)
  }
}

/** 获取所有可用模板的信息 */
export function getInfographicTemplates(): {
  type: InfographicType
  name: string
  icon: string
  description: string
  sampleData: InfographicData
}[] {
  return [
    {
      type: 'flow',
      name: '流程图',
      icon: '🔄',
      description: '展示步骤流程、操作指南',
      sampleData: {
        type: 'flow',
        title: '项目开发流程',
        steps: ['需求分析', '原型设计', '开发编码', '测试验收', '上线运营'],
      },
    },
    {
      type: 'comparison',
      name: '对比表',
      icon: '⚖️',
      description: '两方案/产品对比分析',
      sampleData: {
        type: 'comparison',
        title: '方案对比',
        columns: [
          { title: '方案A', items: ['速度快', '成本低', '易上手', '功能基础'] },
          { title: '方案B', items: ['精度高', '成本适中', '需学习', '功能丰富'] },
        ],
      },
    },
    {
      type: 'card',
      name: '知识卡片',
      icon: '📌',
      description: '核心要点、知识总结',
      sampleData: {
        type: 'card',
        title: '高效学习的5个方法',
        icon: '💡',
        points: [
          '番茄工作法 — 25分钟专注 + 5分钟休息',
          '费曼技巧 — 用自己的话讲给别人听',
          '间隔重复 — 利用遗忘曲线安排复习',
          '主动回忆 — 合上书本回想关键内容',
          '思维导图 — 构建知识之间的关联',
        ],
      },
    },
    {
      type: 'timeline',
      name: '时间线',
      icon: '📅',
      description: '时间轴、发展历程',
      sampleData: {
        type: 'timeline',
        title: '产品发展历程',
        events: [
          { time: '2024 Q1', content: '项目启动，完成产品设计' },
          { time: '2024 Q2', content: 'MVP上线，获得首批用户' },
          { time: '2024 Q3', content: '功能迭代，用户突破1万' },
          { time: '2024 Q4', content: '商业化探索，实现盈利' },
        ],
      },
    },
  ]
}

// ═══════════════════════════════════════
//  通用样式辅助
// ═══════════════════════════════════════

function px(base: number, scale: number): string {
  return `${Math.round(base * scale)}px`
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function titleSection(
  title: string | undefined,
  c: StyleCombo['color']['colors'],
  scale: number,
  icon?: string
): string {
  if (!title) return ''
  return `
    <div style="
      text-align: center;
      margin-bottom: ${px(24, scale)};
    ">
      ${icon ? `<div style="font-size: ${px(32, scale)}; margin-bottom: ${px(8, scale)};">${icon}</div>` : ''}
      <div style="
        font-size: ${px(22, scale)};
        font-weight: 800;
        color: ${c.text};
        letter-spacing: 1px;
        line-height: 1.4;
      ">${title}</div>
      <div style="
        width: ${px(40, scale)};
        height: ${px(3, scale)};
        background: ${c.primary};
        margin: ${px(10, scale)} auto 0;
        border-radius: ${px(2, scale)};
      "></div>
    </div>
  `
}

function containerWrap(
  inner: string,
  c: StyleCombo['color']['colors'],
  width: number,
  scale: number,
  extraPadBottom = 0
): string {
  return `
    <div style="
      width: ${width}px;
      background: ${c.pageBg};
      padding: ${px(32, scale)} ${px(24, scale)} ${px(32 + extraPadBottom, scale)};
      box-sizing: border-box;
      font-family: 'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', sans-serif;
    ">
      <div style="
        background: ${c.contentBg};
        border-radius: ${px(16, scale)};
        padding: ${px(28, scale)} ${px(24, scale)};
        box-shadow: 0 ${px(2, scale)} ${px(12, scale)} ${hexToRgba(c.text, 0.06)};
      ">
        ${inner}
      </div>
      <div style="
        text-align: center;
        margin-top: ${px(12, scale)};
        font-size: ${px(10, scale)};
        color: ${c.textMuted};
        opacity: 0.5;
      ">云中书 · YunType</div>
    </div>
  `
}

// ═══════════════════════════════════════
//  流程图
// ═══════════════════════════════════════

function renderFlowChart(data: FlowData, style: StyleCombo, width: number, scale: number): string {
  const c = style.color.colors
  const steps = data.steps

  // 使用垂直布局，每步一行
  const stepsHtml = steps.map((step, i) => {
    const isLast = i === steps.length - 1
    const stepNum = String(i + 1).padStart(2, '0')

    return `
      <div style="display: flex; align-items: stretch; min-height: ${px(52, scale)};">
        <!-- 左侧编号圆圈 + 连接线 -->
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          width: ${px(44, scale)};
          flex-shrink: 0;
        ">
          <div style="
            width: ${px(36, scale)};
            height: ${px(36, scale)};
            border-radius: 50%;
            background: ${i === 0 ? c.primary : hexToRgba(c.primary, 0.12)};
            color: ${i === 0 ? c.contentBg : c.primary};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${px(14, scale)};
            font-weight: 800;
            flex-shrink: 0;
          ">${stepNum}</div>
          ${!isLast ? `
            <div style="
              flex: 1;
              width: ${px(2, scale)};
              background: linear-gradient(to bottom, ${c.primary}, ${hexToRgba(c.primary, 0.15)});
              margin: ${px(4, scale)} 0;
              min-height: ${px(16, scale)};
            "></div>
          ` : ''}
        </div>
        <!-- 右侧内容 -->
        <div style="
          flex: 1;
          margin-left: ${px(12, scale)};
          padding: ${px(8, scale)} ${px(16, scale)};
          background: ${hexToRgba(c.primary, i === 0 ? 0.08 : 0.03)};
          border-radius: ${px(10, scale)};
          border-left: ${px(3, scale)} solid ${hexToRgba(c.primary, i === 0 ? 1 : 0.25)};
          display: flex;
          align-items: center;
          margin-bottom: ${!isLast ? px(6, scale) : '0'};
        ">
          <span style="
            font-size: ${px(15, scale)};
            font-weight: 600;
            color: ${c.text};
            line-height: 1.5;
          ">${step}</span>
        </div>
      </div>
    `
  }).join('')

  const inner = titleSection(data.title, c, scale, '🔄') + stepsHtml
  return containerWrap(inner, c, width, scale)
}

// ═══════════════════════════════════════
//  对比表
// ═══════════════════════════════════════

function renderComparisonTable(data: ComparisonData, style: StyleCombo, width: number, scale: number): string {
  const c = style.color.colors
  const cols = data.columns

  if (cols.length < 2) return '<div>需要至少2列数据</div>'

  const maxItems = Math.max(...cols.map(col => col.items.length))

  // 表头
  const headers = cols.map((col, i) => `
    <div style="
      flex: 1;
      padding: ${px(12, scale)} ${px(8, scale)};
      background: ${i === 0 ? c.primary : c.secondary};
      color: ${i === 0 ? c.contentBg : c.text};
      text-align: center;
      font-size: ${px(15, scale)};
      font-weight: 700;
      ${i === 0 ? `border-radius: ${px(10, scale)} 0 0 0;` : ''}
      ${i === cols.length - 1 ? `border-radius: 0 ${px(10, scale)} 0 0;` : ''}
    ">${col.title}</div>
  `).join('')

  // 行数据
  let rowsHtml = ''
  for (let r = 0; r < maxItems; r++) {
    const cells = cols.map((col, i) => {
      const value = col.items[r] || ''
      const isLast = r === maxItems - 1
      return `
        <div style="
          flex: 1;
          padding: ${px(10, scale)} ${px(12, scale)};
          font-size: ${px(13, scale)};
          color: ${c.text};
          text-align: center;
          line-height: 1.5;
          background: ${r % 2 === 0 ? c.contentBg : hexToRgba(c.secondary, 0.2)};
          border-bottom: 1px solid ${hexToRgba(c.secondary, 0.5)};
          ${isLast && i === 0 ? `border-radius: 0 0 0 ${px(10, scale)};` : ''}
          ${isLast && i === cols.length - 1 ? `border-radius: 0 0 ${px(10, scale)} 0;` : ''}
        ">${value ? `<span style="
          display: inline-block;
          padding: ${px(2, scale)} ${px(8, scale)};
          background: ${hexToRgba(c.primary, i === 0 ? 0.08 : 0.04)};
          border-radius: ${px(4, scale)};
        ">${value}</span>` : '—'}</div>
      `
    }).join('')

    rowsHtml += `<div style="display: flex;">${cells}</div>`
  }

  const table = `
    <div style="
      border-radius: ${px(10, scale)};
      overflow: hidden;
      border: 1px solid ${hexToRgba(c.secondary, 0.6)};
    ">
      <div style="display: flex;">${headers}</div>
      ${rowsHtml}
    </div>
  `

  const inner = titleSection(data.title, c, scale, '⚖️') + table
  return containerWrap(inner, c, width, scale)
}

// ═══════════════════════════════════════
//  知识卡片
// ═══════════════════════════════════════

function renderKnowledgeCard(data: CardData, style: StyleCombo, width: number, scale: number): string {
  const c = style.color.colors
  const icon = data.icon || '📌'

  const pointsHtml = data.points.map((point, i) => {
    const num = i + 1
    return `
      <div style="
        display: flex;
        gap: ${px(12, scale)};
        padding: ${px(14, scale)} ${px(16, scale)};
        background: ${i % 2 === 0 ? hexToRgba(c.primary, 0.04) : 'transparent'};
        border-radius: ${px(10, scale)};
        margin-bottom: ${px(6, scale)};
        align-items: flex-start;
      ">
        <div style="
          width: ${px(28, scale)};
          height: ${px(28, scale)};
          border-radius: ${px(8, scale)};
          background: ${hexToRgba(c.primary, 0.12)};
          color: ${c.primary};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${px(13, scale)};
          font-weight: 800;
          flex-shrink: 0;
          margin-top: ${px(1, scale)};
        ">${num}</div>
        <div style="
          flex: 1;
          font-size: ${px(14, scale)};
          color: ${c.text};
          line-height: 1.7;
        ">${point}</div>
      </div>
    `
  }).join('')

  // 顶部带装饰的卡片标题
  const header = `
    <div style="
      background: linear-gradient(135deg, ${c.primary}, ${hexToRgba(c.primary, 0.7)});
      margin: ${px(-28, scale)} ${px(-24, scale)} ${px(20, scale)};
      padding: ${px(24, scale)} ${px(24, scale)};
      border-radius: ${px(16, scale)} ${px(16, scale)} 0 0;
      text-align: center;
    ">
      <div style="font-size: ${px(32, scale)}; margin-bottom: ${px(8, scale)};">${icon}</div>
      <div style="
        font-size: ${px(20, scale)};
        font-weight: 800;
        color: ${c.contentBg};
        letter-spacing: 1px;
        line-height: 1.4;
      ">${data.title}</div>
    </div>
  `

  const inner = header + pointsHtml
  return containerWrap(inner, c, width, scale)
}

// ═══════════════════════════════════════
//  时间线
// ═══════════════════════════════════════

function renderTimeline(data: TimelineData, style: StyleCombo, width: number, scale: number): string {
  const c = style.color.colors

  const eventsHtml = data.events.map((evt, i) => {
    const isFirst = i === 0
    const isLast = i === data.events.length - 1

    return `
      <div style="
        display: flex;
        min-height: ${px(70, scale)};
        position: relative;
      ">
        <!-- 时间标签 -->
        <div style="
          width: ${px(80, scale)};
          flex-shrink: 0;
          text-align: right;
          padding-right: ${px(16, scale)};
          padding-top: ${px(2, scale)};
        ">
          <span style="
            font-size: ${px(12, scale)};
            font-weight: 700;
            color: ${c.primary};
            letter-spacing: 0.5px;
          ">${evt.time}</span>
        </div>

        <!-- 中间轴线 + 圆点 -->
        <div style="
          width: ${px(24, scale)};
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        ">
          <!-- 上方线段 -->
          ${!isFirst ? `
            <div style="
              width: ${px(2, scale)};
              height: ${px(8, scale)};
              background: ${hexToRgba(c.primary, 0.2)};
            "></div>
          ` : `<div style="height: ${px(8, scale)};"></div>`}
          <!-- 圆点 -->
          <div style="
            width: ${px(14, scale)};
            height: ${px(14, scale)};
            border-radius: 50%;
            background: ${isFirst ? c.primary : c.contentBg};
            border: ${px(3, scale)} solid ${c.primary};
            flex-shrink: 0;
            z-index: 1;
          "></div>
          <!-- 下方线段 -->
          ${!isLast ? `
            <div style="
              width: ${px(2, scale)};
              flex: 1;
              background: ${hexToRgba(c.primary, 0.2)};
              min-height: ${px(20, scale)};
            "></div>
          ` : ''}
        </div>

        <!-- 内容 -->
        <div style="
          flex: 1;
          padding-left: ${px(12, scale)};
          padding-bottom: ${px(16, scale)};
        ">
          <div style="
            padding: ${px(10, scale)} ${px(14, scale)};
            background: ${hexToRgba(c.primary, 0.05)};
            border-radius: ${px(10, scale)};
            border-left: ${px(3, scale)} solid ${hexToRgba(c.primary, isFirst ? 1 : 0.3)};
          ">
            <span style="
              font-size: ${px(14, scale)};
              color: ${c.text};
              line-height: 1.6;
            ">${evt.content}</span>
          </div>
        </div>
      </div>
    `
  }).join('')

  const inner = titleSection(data.title, c, scale, '📅') + eventsHtml
  return containerWrap(inner, c, width, scale)
}

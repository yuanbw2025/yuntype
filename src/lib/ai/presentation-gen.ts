// 演示稿生成 — AI 生成交互式 HTML 演示

import { chat, type AIClientConfig } from './client'

export interface PresentationResult {
  success: boolean
  html?: string
  error?: string
  slideCount?: number
}

export interface PresentationPreset {
  id: string
  name: string
  icon: string
  description: string
  examplePrompt: string
}

export const presentationPresets: PresentationPreset[] = [
  {
    id: 'pitch',
    name: '产品介绍',
    icon: '🚀',
    description: '产品发布、功能展示',
    examplePrompt: '介绍一款AI写作助手产品，包含产品定位、核心功能（智能续写、风格改写、多语言翻译）、使用场景、定价方案。风格现代科技感。',
  },
  {
    id: 'report',
    name: '工作汇报',
    icon: '📊',
    description: '周报、月报、季度总结',
    examplePrompt: '2024年Q3产品团队工作汇报：完成了3个大版本迭代，用户增长35%，NPS提升到72分，下季度计划重点是国际化和AI功能。',
  },
  {
    id: 'tutorial',
    name: '教学课件',
    icon: '📚',
    description: '知识讲解、培训课件',
    examplePrompt: '讲解CSS Grid布局的基础知识，从什么是Grid、基本术语、常用属性到实际案例，适合前端初学者。',
  },
  {
    id: 'proposal',
    name: '方案提案',
    icon: '💡',
    description: '商业计划、项目提案',
    examplePrompt: '社区团购小程序项目提案：市场分析、竞品对比、产品方案、技术架构、团队配置、预算和时间表。',
  },
  {
    id: 'story',
    name: '故事叙述',
    icon: '📖',
    description: '品牌故事、个人经历',
    examplePrompt: '讲述一个独立开发者从0到1做出一款月收入过万的产品的故事，包含灵感来源、艰难时刻、关键转折和经验总结。',
  },
  {
    id: 'data',
    name: '数据展示',
    icon: '📈',
    description: '数据报告、趋势分析',
    examplePrompt: '2024年中国移动互联网趋势报告：用户规模、时长分布、热门赛道（短视频、直播电商、AI应用）、未来预测。用图表展示关键数据。',
  },
]

const SYSTEM_PROMPT = `你是一位顶级演示设计师。用户会描述演示主题，你需要生成一个完整的单文件 HTML 演示稿。

## 核心要求

1. **生成完整的 HTML 文件**，包含所有 CSS 和 JS，不依赖任何外部资源
2. **幻灯片结构**：每页用 \`<section class="slide">\` 包裹，默认生成 6-10 页
3. **16:9 比例**：每页 960×540 的设计尺寸，居中显示
4. **键盘/点击导航**：左右箭头键切换，点击也可前进，底部显示页码指示器
5. **过渡动画**：页面切换时有流畅的淡入滑动动画

## 设计原则

- 每页内容精简，大字报风格，一个核心观点
- 善用留白，文字不超过页面 60%
- 标题页要有冲击力
- 数据页用 CSS 绘制简单图表（柱状图、环形图、进度条）
- 配色协调，全局统一，用 CSS 变量管理主题色
- 适当使用 emoji 作为视觉元素
- 最后一页是总结或 CTA

## 动画要求

- 每页进入时元素依次出现（staggered animation）
- 标题、正文、图表分别设置不同的入场延迟
- 使用 CSS @keyframes，不依赖外部库
- 动画要克制优雅，不要花哨

## 交互功能

- 键盘左右箭头切换幻灯片
- 点击页面右半部分前进，左半部分后退
- 底部圆点指示器，可点击跳转
- 按 F 键全屏
- 当前页高亮指示

## HTML 结构模板

\`\`\`html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>演示标题</title>
  <style>
    /* 全局样式、幻灯片容器、动画、导航指示器 */
  </style>
</head>
<body>
  <div class="deck">
    <section class="slide"><!-- 每页内容 --></section>
    ...
  </div>
  <div class="nav-dots"><!-- 页码指示器 --></div>
  <script>
    // 导航逻辑、动画触发、全屏
  </script>
</body>
</html>
\`\`\`

## 输出规则

- 只输出 HTML 代码，不要任何解释
- 代码用 \`\`\`html 包裹
- 确保代码完整可运行`

export async function generatePresentation(
  config: AIClientConfig,
  userPrompt: string,
): Promise<PresentationResult> {
  const result = await chat(config, [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userPrompt },
  ])

  if (!result.success || !result.content) {
    return { success: false, error: result.error || '生成失败' }
  }

  const html = extractHtml(result.content)
  if (!html) {
    return { success: false, error: '未能从 AI 响应中提取 HTML' }
  }

  const slideCount = (html.match(/<section\s+class="slide"/g) || []).length

  return { success: true, html, slideCount }
}

function extractHtml(raw: string): string | null {
  const match = raw.match(/```html\s*([\s\S]*?)```/)
  if (match) return match[1].trim()

  if (raw.includes('<!DOCTYPE') || raw.includes('<html')) {
    const start = raw.indexOf('<!DOCTYPE') >= 0 ? raw.indexOf('<!DOCTYPE') : raw.indexOf('<html')
    return raw.slice(start).trim()
  }

  return null
}

export function downloadPresentation(html: string, filename: string = 'presentation.html') {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

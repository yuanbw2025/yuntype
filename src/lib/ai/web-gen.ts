// 网页生成模块 — 用户描述需求 → AI 生成完整单文件 HTML

import { chat, type AIClientConfig, type ChatMessage } from './client'

export interface WebGenResult {
  success: boolean
  html?: string
  error?: string
}

export interface WebPagePreset {
  id: string
  name: string
  icon: string
  description: string
  examplePrompt: string
}

export const webPagePresets: WebPagePreset[] = [
  {
    id: 'profile',
    name: '个人介绍页',
    icon: '👤',
    description: '简洁的个人主页，展示基本信息和社交链接',
    examplePrompt: '做一个个人介绍页，我是一名前端工程师，擅长 React 和 TypeScript，喜欢摄影和旅行。页面要简洁现代，有头像占位、个人简介、技能标签、社交链接。',
  },
  {
    id: 'resume',
    name: '在线简历',
    icon: '📄',
    description: '专业的单页简历，适合求职展示',
    examplePrompt: '做一份在线简历页面，包含：个人信息、教育背景、工作经历（3段）、技能列表、项目经历（2个）。风格要专业简洁，适合发给 HR。',
  },
  {
    id: 'landing',
    name: '产品落地页',
    icon: '🚀',
    description: '产品或服务的宣传展示页',
    examplePrompt: '做一个产品落地页，产品是一款 AI 写作助手。需要：顶部大图+标语、3个核心特性介绍、用户评价区、价格方案对比、底部行动号召按钮。',
  },
  {
    id: 'event',
    name: '活动邀请页',
    icon: '🎉',
    description: '活动/聚会/会议的邀请页面',
    examplePrompt: '做一个线下沙龙活动邀请页，主题是"AI 时代的内容创作"，时间是下周六下午两点，地点在望京 SOHO。需要活动介绍、嘉宾信息、议程安排、报名按钮。',
  },
  {
    id: 'portfolio',
    name: '作品集',
    icon: '🎨',
    description: '展示个人作品的画廊页面',
    examplePrompt: '做一个摄影作品集页面，网格布局展示 6-9 张作品（用占位图），点击可放大查看。风格要极简，深色背景，让作品本身成为焦点。',
  },
  {
    id: 'linktree',
    name: '链接聚合页',
    icon: '🔗',
    description: '类似 Linktree 的个人链接集合',
    examplePrompt: '做一个链接聚合页，手机端竖向排列，包含：头像+昵称、8个链接按钮（微信公众号、小红书、B站、知乎、GitHub、个人博客、邮箱、微信二维码）。风格可爱活泼。',
  },
]

const SYSTEM_PROMPT = `你是一位顶尖的前端设计工程师。用户会描述想要的网页，你需要生成一个完整的、可直接在浏览器中打开的单文件 HTML 页面。

## 设计原则

1. **追求精致**：每个像素都要有意图，不是"能用"而是"好看"
2. **拒绝 AI 味**：不要用紫粉渐变、不要满屏圆角卡片+左边框、不要千篇一律的 Inter 字体
3. **先想设计系统**：开始写代码前，先确定配色方案、字体层级、间距系统、圆角策略
4. **善用留白**：留白是设计的一部分，不是浪费空间
5. **动效克制**：只在有功能意义的地方加动画，CSS transition 优先
6. **响应式**：页面必须在手机和桌面上都好看

## 技术规范

- 输出完整的 HTML 文件，所有 CSS 写在 <style> 标签内，JS 写在 <script> 标签内
- 必须包含 viewport meta 标签
- 中文字体优先使用系统字体栈：-apple-system, 'PingFang SC', 'Noto Sans SC', sans-serif
- 英文可用 Google Fonts（通过 CDN 引入）
- 图片使用纯 CSS 占位（渐变色块 + 图标），不要用外部图片链接
- 颜色使用 CSS 自定义属性（--primary, --bg, --text 等）方便后续修改
- 优先使用 CSS Grid 和 Flexbox 布局
- 不要引入任何 JS 框架（jQuery、React 等），原生 JS 即可

## 配色建议（选一种，不要混搭）

- 现代科技：深蓝灰底 + 亮蓝强调 + 白色文字
- 优雅编辑：暖米白底 + 深棕文字 + 金色点缀
- 极简专业：纯白底 + 近黑文字 + 青蓝强调
- 活力消费：珊瑚色强调 + 浅灰底 + 深灰文字
- 暗色高级：近黑底 + 金色/翡翠绿强调 + 浅灰文字

## 输出格式

直接输出完整的 HTML 代码，不要用 markdown 代码块包裹，不要加任何解释文字。第一行必须是 <!DOCTYPE html>。`

export async function generateWebPage(
  config: AIClientConfig,
  userPrompt: string,
): Promise<WebGenResult> {
  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userPrompt },
  ]

  const overrideConfig = {
    ...config,
  }

  const res = await chat(overrideConfig, messages)

  if (!res.success || !res.content) {
    return { success: false, error: res.error || '生成失败' }
  }

  const html = extractHtml(res.content)
  if (!html) {
    return { success: false, error: '未能从 AI 返回中提取有效 HTML' }
  }

  return { success: true, html }
}

function extractHtml(raw: string): string | null {
  let html = raw.trim()

  // 如果被 markdown 代码块包裹，提取出来
  const codeBlockMatch = html.match(/```(?:html)?\s*\n([\s\S]*?)\n```/)
  if (codeBlockMatch) {
    html = codeBlockMatch[1].trim()
  }

  // 确保以 <!DOCTYPE 或 <html 开头
  if (!html.startsWith('<!DOCTYPE') && !html.startsWith('<html') && !html.startsWith('<!doctype')) {
    const docIndex = html.indexOf('<!DOCTYPE')
    const htmlIndex = html.indexOf('<html')
    const start = docIndex >= 0 ? docIndex : htmlIndex
    if (start >= 0) {
      html = html.slice(start)
    } else {
      return null
    }
  }

  // 注入 viewport 如果缺失
  if (!html.includes('viewport')) {
    html = html.replace('<head>', '<head>\n<meta name="viewport" content="width=device-width, initial-scale=1.0">')
  }

  return html
}

export function downloadHtml(html: string, filename: string = 'page.html'): void {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// 幻灯片编辑器 — AI 生成结构化幻灯片 JSON

import { chat, type AIClientConfig } from './client'

// ═══════════════════════════════════════
//  数据结构
// ═══════════════════════════════════════

export type SlideLayout = 'title' | 'content' | 'two-column' | 'bullets' | 'quote' | 'closing'

export interface SlideElement {
  id: string
  type: 'title' | 'subtitle' | 'body' | 'label'
  text: string
}

export interface Slide {
  id: string
  layout: SlideLayout
  elements: SlideElement[]
  themeIndex: number // 0~4，复用下面的主题色
}

export interface SlidesDeck {
  title: string
  theme: SlideTheme
  slides: Slide[]
}

export interface SlideTheme {
  name: string
  bg: string
  titleColor: string
  bodyColor: string
  accent: string
  accentText: string
  labelColor: string
}

// ═══════════════════════════════════════
//  内置主题
// ═══════════════════════════════════════

export const SLIDE_THEMES: SlideTheme[] = [
  {
    name: '深夜蓝',
    bg: '#0f172a',
    titleColor: '#f1f5f9',
    bodyColor: '#94a3b8',
    accent: '#6366f1',
    accentText: '#fff',
    labelColor: '#6366f1',
  },
  {
    name: '清晨白',
    bg: '#ffffff',
    titleColor: '#1e293b',
    bodyColor: '#475569',
    accent: '#7c3aed',
    accentText: '#fff',
    labelColor: '#7c3aed',
  },
  {
    name: '森林绿',
    bg: '#064e3b',
    titleColor: '#ecfdf5',
    bodyColor: '#6ee7b7',
    accent: '#10b981',
    accentText: '#fff',
    labelColor: '#34d399',
  },
  {
    name: '玫瑰红',
    bg: '#fff1f2',
    titleColor: '#881337',
    bodyColor: '#be123c',
    accent: '#f43f5e',
    accentText: '#fff',
    labelColor: '#e11d48',
  },
  {
    name: '碳灰',
    bg: '#18181b',
    titleColor: '#fafafa',
    bodyColor: '#a1a1aa',
    accent: '#f59e0b',
    accentText: '#000',
    labelColor: '#f59e0b',
  },
]

// ═══════════════════════════════════════
//  预设场景
// ═══════════════════════════════════════

export interface SlidesPreset {
  id: string
  name: string
  icon: string
  description: string
  examplePrompt: string
}

export const SLIDES_PRESETS: SlidesPreset[] = [
  {
    id: 'pitch',
    name: '产品介绍',
    icon: '🚀',
    description: '产品发布、功能展示',
    examplePrompt: '介绍一款AI写作助手：核心功能有智能续写、风格改写、多语言翻译，目标用户是自媒体创作者，定价99元/月。',
  },
  {
    id: 'report',
    name: '工作汇报',
    icon: '📊',
    description: '周报、月报、季度总结',
    examplePrompt: '2024年Q3产品团队汇报：完成3个大版本，用户增长35%，NPS达72，下季度重点推国际化和AI功能。',
  },
  {
    id: 'tutorial',
    name: '教学课件',
    icon: '📚',
    description: '知识讲解、培训课件',
    examplePrompt: '讲解CSS Flexbox布局基础，包含概念、核心属性、常见布局案例，适合前端初学者。',
  },
  {
    id: 'plan',
    name: '项目方案',
    icon: '🗂️',
    description: '提案、规划、路线图',
    examplePrompt: '一个社区团购小程序的项目方案：背景分析、核心功能、技术选型、开发排期、预算。',
  },
  {
    id: 'story',
    name: '故事叙述',
    icon: '📖',
    description: '品牌故事、创始人分享',
    examplePrompt: '一个独立咖啡品牌的故事：从一个人在车库里烘焙咖啡豆，到现在全国20家门店的成长历程。',
  },
]

// ═══════════════════════════════════════
//  工具函数
// ═══════════════════════════════════════

function makeId() {
  return Math.random().toString(36).slice(2, 9)
}

export function createEmptySlide(layout: SlideLayout = 'content'): Slide {
  const elements: SlideElement[] = []

  if (layout === 'title') {
    elements.push({ id: makeId(), type: 'title', text: '演示标题' })
    elements.push({ id: makeId(), type: 'subtitle', text: '副标题 · 作者 · 日期' })
  } else if (layout === 'bullets') {
    elements.push({ id: makeId(), type: 'label', text: '章节标签' })
    elements.push({ id: makeId(), type: 'title', text: '幻灯片标题' })
    elements.push({ id: makeId(), type: 'body', text: '• 要点一\n• 要点二\n• 要点三' })
  } else if (layout === 'two-column') {
    elements.push({ id: makeId(), type: 'title', text: '幻灯片标题' })
    elements.push({ id: makeId(), type: 'body', text: '左侧内容\n• 要点一\n• 要点二' })
    elements.push({ id: makeId(), type: 'body', text: '右侧内容\n• 要点三\n• 要点四' })
  } else if (layout === 'quote') {
    elements.push({ id: makeId(), type: 'body', text: '"这里是一段引言或金句"' })
    elements.push({ id: makeId(), type: 'subtitle', text: '—— 来源或署名' })
  } else if (layout === 'closing') {
    elements.push({ id: makeId(), type: 'title', text: '谢谢观看' })
    elements.push({ id: makeId(), type: 'subtitle', text: '欢迎交流 · 联系方式' })
  } else {
    elements.push({ id: makeId(), type: 'label', text: '章节标签' })
    elements.push({ id: makeId(), type: 'title', text: '幻灯片标题' })
    elements.push({ id: makeId(), type: 'body', text: '在这里输入正文内容，支持换行。' })
  }

  return { id: makeId(), layout, elements, themeIndex: 0 }
}

export function createDefaultDeck(): SlidesDeck {
  return {
    title: '新建演示',
    theme: SLIDE_THEMES[0],
    slides: [
      createEmptySlide('title'),
      createEmptySlide('bullets'),
      createEmptySlide('closing'),
    ],
  }
}

// ═══════════════════════════════════════
//  AI 生成
// ═══════════════════════════════════════

const SYSTEM_PROMPT = `你是一个专业的演示稿内容策划师。用户会给你一段主题描述，你需要生成结构化的幻灯片内容。

返回严格的 JSON 格式，结构如下：
{
  "title": "演示稿总标题",
  "slides": [
    {
      "layout": "title",
      "elements": [
        { "type": "title", "text": "..." },
        { "type": "subtitle", "text": "..." }
      ]
    },
    {
      "layout": "bullets",
      "elements": [
        { "type": "label", "text": "章节标签" },
        { "type": "title", "text": "幻灯片标题" },
        { "type": "body", "text": "• 要点一\\n• 要点二\\n• 要点三" }
      ]
    }
  ]
}

layout 只能是这5种之一：title / content / two-column / bullets / quote / closing
element type 只能是：title / subtitle / body / label

规则：
- 第一页必须是 layout: "title"，最后一页必须是 layout: "closing"
- 总共生成 6~10 页幻灯片
- 内容简洁有力，每页 body 不超过 100 字
- 不要有多余解释，只返回 JSON`

export async function generateSlidesDeck(
  config: AIClientConfig,
  prompt: string,
  themeIndex = 0
): Promise<{ success: boolean; deck?: SlidesDeck; error?: string }> {
  const res = await chat(config, [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: prompt },
  ])

  if (!res.success || !res.content) {
    return { success: false, error: res.error || '生成失败' }
  }

  try {
    // 提取 JSON（防止 AI 返回 markdown 代码块）
    const raw = res.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(raw)

    const slides: Slide[] = (parsed.slides || []).map((s: any) => ({
      id: makeId(),
      layout: s.layout || 'content',
      themeIndex,
      elements: (s.elements || []).map((el: any) => ({
        id: makeId(),
        type: el.type || 'body',
        text: el.text || '',
      })),
    }))

    return {
      success: true,
      deck: {
        title: parsed.title || '演示稿',
        theme: SLIDE_THEMES[themeIndex],
        slides,
      },
    }
  } catch {
    return { success: false, error: '解析 AI 返回内容失败，请重试' }
  }
}

// ═══════════════════════════════════════
//  导出 PPTX
// ═══════════════════════════════════════

export async function exportToPptx(deck: SlidesDeck) {
  const PptxGenJS = (await import('pptxgenjs')).default
  const pptx = new PptxGenJS()

  pptx.layout = 'LAYOUT_16x9'
  pptx.title = deck.title

  const t = deck.theme

  for (const slide of deck.slides) {
    const s = pptx.addSlide()

    // 背景色
    s.background = { color: t.bg.replace('#', '') }

    if (slide.layout === 'title') {
      const titleEl = slide.elements.find(e => e.type === 'title')
      const subtitleEl = slide.elements.find(e => e.type === 'subtitle')

      // 装饰色块
      s.addShape(pptx.ShapeType.rect, {
        x: 0, y: 3.2, w: 10, h: 0.08,
        fill: { color: t.accent.replace('#', '') },
        line: { color: t.accent.replace('#', ''), width: 0 },
      })

      if (titleEl) {
        s.addText(titleEl.text, {
          x: 0.8, y: 1.2, w: 8.4, h: 1.6,
          fontSize: 40, bold: true,
          color: t.titleColor.replace('#', ''),
          fontFace: 'Microsoft YaHei',
          align: 'center',
        })
      }
      if (subtitleEl) {
        s.addText(subtitleEl.text, {
          x: 0.8, y: 3.6, w: 8.4, h: 0.8,
          fontSize: 18,
          color: t.bodyColor.replace('#', ''),
          fontFace: 'Microsoft YaHei',
          align: 'center',
        })
      }
    } else if (slide.layout === 'quote') {
      const bodyEl = slide.elements.find(e => e.type === 'body')
      const subtitleEl = slide.elements.find(e => e.type === 'subtitle')

      s.addShape(pptx.ShapeType.rect, {
        x: 0.6, y: 0, w: 0.12, h: 5.63,
        fill: { color: t.accent.replace('#', '') },
        line: { color: t.accent.replace('#', ''), width: 0 },
      })

      if (bodyEl) {
        s.addText(bodyEl.text, {
          x: 1.2, y: 1.2, w: 7.8, h: 2.4,
          fontSize: 24, italic: true, bold: true,
          color: t.titleColor.replace('#', ''),
          fontFace: 'Microsoft YaHei',
        })
      }
      if (subtitleEl) {
        s.addText(subtitleEl.text, {
          x: 1.2, y: 4.0, w: 7.8, h: 0.6,
          fontSize: 14,
          color: t.bodyColor.replace('#', ''),
          fontFace: 'Microsoft YaHei',
        })
      }
    } else if (slide.layout === 'two-column') {
      const titleEl = slide.elements.find(e => e.type === 'title')
      const bodyEls = slide.elements.filter(e => e.type === 'body')

      s.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: 10, h: 1.0,
        fill: { color: t.accent.replace('#', '') },
        line: { color: t.accent.replace('#', ''), width: 0 },
      })

      if (titleEl) {
        s.addText(titleEl.text, {
          x: 0.4, y: 0.1, w: 9.2, h: 0.8,
          fontSize: 22, bold: true,
          color: t.accentText.replace('#', ''),
          fontFace: 'Microsoft YaHei',
        })
      }
      if (bodyEls[0]) {
        s.addText(bodyEls[0].text, {
          x: 0.4, y: 1.2, w: 4.4, h: 3.8,
          fontSize: 14,
          color: t.bodyColor.replace('#', ''),
          fontFace: 'Microsoft YaHei',
        })
      }
      if (bodyEls[1]) {
        s.addText(bodyEls[1].text, {
          x: 5.2, y: 1.2, w: 4.4, h: 3.8,
          fontSize: 14,
          color: t.bodyColor.replace('#', ''),
          fontFace: 'Microsoft YaHei',
        })
      }
    } else if (slide.layout === 'closing') {
      const titleEl = slide.elements.find(e => e.type === 'title')
      const subtitleEl = slide.elements.find(e => e.type === 'subtitle')

      s.addShape(pptx.ShapeType.rect, {
        x: 3.5, y: 2.3, w: 3, h: 0.08,
        fill: { color: t.accent.replace('#', '') },
        line: { color: t.accent.replace('#', ''), width: 0 },
      })

      if (titleEl) {
        s.addText(titleEl.text, {
          x: 0.8, y: 1.2, w: 8.4, h: 1.2,
          fontSize: 36, bold: true,
          color: t.titleColor.replace('#', ''),
          fontFace: 'Microsoft YaHei',
          align: 'center',
        })
      }
      if (subtitleEl) {
        s.addText(subtitleEl.text, {
          x: 0.8, y: 2.8, w: 8.4, h: 0.6,
          fontSize: 16,
          color: t.bodyColor.replace('#', ''),
          fontFace: 'Microsoft YaHei',
          align: 'center',
        })
      }
    } else {
      // content / bullets / default
      const labelEl = slide.elements.find(e => e.type === 'label')
      const titleEl = slide.elements.find(e => e.type === 'title')
      const bodyEl = slide.elements.find(e => e.type === 'body')

      // 顶部装饰线
      s.addShape(pptx.ShapeType.rect, {
        x: 0.4, y: 0.35, w: 0.06, h: 0.9,
        fill: { color: t.accent.replace('#', '') },
        line: { color: t.accent.replace('#', ''), width: 0 },
      })

      if (labelEl) {
        s.addText(labelEl.text, {
          x: 0.6, y: 0.3, w: 4, h: 0.4,
          fontSize: 10, bold: true,
          color: t.labelColor.replace('#', ''),
          fontFace: 'Microsoft YaHei',
        })
      }
      if (titleEl) {
        s.addText(titleEl.text, {
          x: 0.6, y: 0.7, w: 8.6, h: 0.9,
          fontSize: 26, bold: true,
          color: t.titleColor.replace('#', ''),
          fontFace: 'Microsoft YaHei',
        })
      }
      if (bodyEl) {
        s.addText(bodyEl.text, {
          x: 0.6, y: 1.8, w: 8.6, h: 3.4,
          fontSize: 15,
          color: t.bodyColor.replace('#', ''),
          fontFace: 'Microsoft YaHei',
          breakLine: true,
        })
      }
    }
  }

  await pptx.writeFile({ fileName: `${deck.title}.pptx` })
}

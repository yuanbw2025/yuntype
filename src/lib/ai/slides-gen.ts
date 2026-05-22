// 幻灯片编辑器 — 数据模型 + AI生成 + PPTX导出

import { chat, type AIClientConfig } from './client'

// ═══════════════════════════════════════
//  核心数据模型
// ═══════════════════════════════════════

export type SlideLayout = 'title' | 'content' | 'bullets' | 'two-column' | 'quote' | 'closing'
export type ElementRole = 'title' | 'subtitle' | 'body' | 'label' | 'custom'

export interface ElementStyle {
  // fontSize 单位：% of slide height（方便等比缩放）
  // 换算：pt ≈ fontSize * 5.4（标准16:9幻灯片高540pt）
  fontSize: number
  fontWeight: 'normal' | 'bold'
  fontStyle: 'normal' | 'italic'
  textAlign: 'left' | 'center' | 'right'
  lineHeight: number       // 倍数
  letterSpacing: number    // em
  colorOverride?: string   // 覆盖主题色，undefined = 跟随主题
}

export interface SlideElement {
  id: string
  role: ElementRole
  text: string
  // 位置尺寸：% of slide（0-100）
  x: number
  y: number
  w: number
  h: number
  style: ElementStyle
}

export interface Slide {
  id: string
  layout: SlideLayout
  elements: SlideElement[]
  themeIndex: number
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
//  主题色
// ═══════════════════════════════════════

export const SLIDE_THEMES: SlideTheme[] = [
  { name: '深夜蓝', bg: '#0f172a', titleColor: '#f1f5f9', bodyColor: '#94a3b8', accent: '#6366f1', accentText: '#fff', labelColor: '#818cf8' },
  { name: '清晨白', bg: '#ffffff', titleColor: '#1e293b', bodyColor: '#475569', accent: '#7c3aed', accentText: '#fff', labelColor: '#7c3aed' },
  { name: '森林绿', bg: '#064e3b', titleColor: '#ecfdf5', bodyColor: '#6ee7b7', accent: '#10b981', accentText: '#fff', labelColor: '#34d399' },
  { name: '玫瑰红', bg: '#fff1f2', titleColor: '#881337', bodyColor: '#9f1239', accent: '#f43f5e', accentText: '#fff', labelColor: '#e11d48' },
  { name: '碳灰',   bg: '#18181b', titleColor: '#fafafa', bodyColor: '#a1a1aa', accent: '#f59e0b', accentText: '#000', labelColor: '#fbbf24' },
]

// 根据 role 取主题色
export function getElementColor(role: ElementRole, theme: SlideTheme, override?: string): string {
  if (override) return override
  switch (role) {
    case 'title':    return theme.titleColor
    case 'subtitle': return theme.bodyColor
    case 'body':     return theme.bodyColor
    case 'label':    return theme.labelColor
    default:         return theme.bodyColor
  }
}

// ═══════════════════════════════════════
//  预设场景
// ═══════════════════════════════════════

export const SLIDES_PRESETS = [
  { id: 'pitch',    name: '产品介绍', icon: '🚀', examplePrompt: '介绍一款AI写作助手：核心功能有智能续写、风格改写、多语言翻译，目标用户是自媒体创作者，定价99元/月。' },
  { id: 'report',   name: '工作汇报', icon: '📊', examplePrompt: '2024年Q3产品团队汇报：完成3个大版本，用户增长35%，NPS达72，下季度重点推国际化和AI功能。' },
  { id: 'tutorial', name: '教学课件', icon: '📚', examplePrompt: '讲解CSS Flexbox布局基础，包含概念、核心属性、常见布局案例，适合前端初学者。' },
  { id: 'plan',     name: '项目方案', icon: '🗂️', examplePrompt: '一个社区团购小程序的项目方案：背景分析、核心功能、技术选型、开发排期、预算。' },
  { id: 'story',    name: '故事叙述', icon: '📖', examplePrompt: '一个独立咖啡品牌的故事：从车库里烘焙咖啡豆到全国20家门店的成长历程。' },
]

// ═══════════════════════════════════════
//  布局默认定位
// ═══════════════════════════════════════

// 根据 layout 和 role 返回默认的 x/y/w/h 和 style
function defaultElementGeom(
  layout: SlideLayout,
  role: ElementRole,
  index: number // 同role多个时的顺序
): { x: number; y: number; w: number; h: number; style: ElementStyle } {
  const base: ElementStyle = {
    fontSize: 3, fontWeight: 'normal', fontStyle: 'normal',
    textAlign: 'left', lineHeight: 1.8, letterSpacing: 0,
  }

  if (layout === 'title') {
    if (role === 'title')    return { x: 8, y: 22, w: 84, h: 26, style: { ...base, fontSize: 8, fontWeight: 'bold', textAlign: 'center', lineHeight: 1.3 } }
    if (role === 'subtitle') return { x: 8, y: 56, w: 84, h: 14, style: { ...base, fontSize: 3.5, textAlign: 'center' } }
  }
  if (layout === 'closing') {
    if (role === 'title')    return { x: 8, y: 26, w: 84, h: 26, style: { ...base, fontSize: 8, fontWeight: 'bold', textAlign: 'center', lineHeight: 1.3 } }
    if (role === 'subtitle') return { x: 8, y: 58, w: 84, h: 14, style: { ...base, fontSize: 3.5, textAlign: 'center' } }
  }
  if (layout === 'quote') {
    if (role === 'body')     return { x: 13, y: 20, w: 74, h: 40, style: { ...base, fontSize: 5, fontWeight: 'bold', fontStyle: 'italic', lineHeight: 1.5 } }
    if (role === 'subtitle') return { x: 13, y: 66, w: 74, h: 12, style: { ...base, fontSize: 3 } }
  }
  if (layout === 'two-column') {
    if (role === 'title')    return { x: 4, y: 2, w: 92, h: 17, style: { ...base, fontSize: 4.5, fontWeight: 'bold' } }
    if (role === 'body') {
      if (index === 0)       return { x: 4, y: 22, w: 44, h: 73, style: { ...base, fontSize: 2.8, lineHeight: 1.9 } }
      else                   return { x: 52, y: 22, w: 44, h: 73, style: { ...base, fontSize: 2.8, lineHeight: 1.9 } }
    }
  }
  // content / bullets / default
  if (role === 'label')    return { x: 7, y: 6, w: 40, h: 9, style: { ...base, fontSize: 2.2, fontWeight: 'bold', letterSpacing: 0.12 } }
  if (role === 'title')    return { x: 7, y: 15, w: 86, h: 18, style: { ...base, fontSize: 5.5, fontWeight: 'bold', lineHeight: 1.25 } }
  if (role === 'body')     return { x: 7, y: 35, w: 86, h: 60, style: { ...base, fontSize: 2.8, lineHeight: 1.95 } }
  if (role === 'subtitle') return { x: 7, y: 35, w: 86, h: 60, style: { ...base, fontSize: 2.8 } }
  return { x: 10, y: 10, w: 80, h: 20, style: base }
}

// ═══════════════════════════════════════
//  工具函数
// ═══════════════════════════════════════

export function makeId() {
  return Math.random().toString(36).slice(2, 9)
}

// 将 AI 返回的 { role, text } 数组转为带位置的 SlideElement[]
function buildElements(
  rawEls: { type: string; text: string }[],
  layout: SlideLayout
): SlideElement[] {
  const roleCount: Record<string, number> = {}
  return rawEls.map(raw => {
    const role = raw.type as ElementRole
    const idx = roleCount[role] ?? 0
    roleCount[role] = idx + 1
    const geom = defaultElementGeom(layout, role, idx)
    return {
      id: makeId(),
      role,
      text: raw.text,
      ...geom,
    }
  })
}

export function createEmptySlide(layout: SlideLayout = 'content'): Slide {
  const rawEls: { type: ElementRole; text: string }[] = []

  switch (layout) {
    case 'title':
      rawEls.push({ type: 'title', text: '演示标题' })
      rawEls.push({ type: 'subtitle', text: '副标题 · 作者 · 日期' })
      break
    case 'closing':
      rawEls.push({ type: 'title', text: '谢谢观看' })
      rawEls.push({ type: 'subtitle', text: '欢迎交流 · 联系方式' })
      break
    case 'quote':
      rawEls.push({ type: 'body', text: '"这里是一段引言或金句"' })
      rawEls.push({ type: 'subtitle', text: '—— 来源或署名' })
      break
    case 'two-column':
      rawEls.push({ type: 'title', text: '幻灯片标题' })
      rawEls.push({ type: 'body', text: '左侧内容\n• 要点一\n• 要点二' })
      rawEls.push({ type: 'body', text: '右侧内容\n• 要点三\n• 要点四' })
      break
    default:
      rawEls.push({ type: 'label', text: '章节标签' })
      rawEls.push({ type: 'title', text: '幻灯片标题' })
      rawEls.push({ type: 'body', text: '• 要点一\n• 要点二\n• 要点三' })
  }

  return { id: makeId(), layout, themeIndex: 0, elements: buildElements(rawEls, layout) }
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

const SYSTEM_PROMPT = `你是专业的演示稿内容策划师。根据用户描述生成幻灯片内容。

返回严格的 JSON，结构如下：
{
  "title": "演示稿总标题",
  "slides": [
    {
      "layout": "title",
      "elements": [
        { "type": "title", "text": "..." },
        { "type": "subtitle", "text": "..." }
      ]
    }
  ]
}

layout 只能是：title / content / bullets / two-column / quote / closing
element type 只能是：title / subtitle / body / label

规则：
- 第一页 layout 必须是 "title"，最后一页必须是 "closing"
- 生成 6~10 页
- 内容简洁有力，body 不超过 100 字
- 只返回 JSON，不要有任何其他文字`

export async function generateSlidesDeck(
  config: AIClientConfig,
  prompt: string,
  themeIndex = 0
): Promise<{ success: boolean; deck?: SlidesDeck; error?: string }> {
  const res = await chat(config, [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: prompt },
  ])
  if (!res.success || !res.content) return { success: false, error: res.error || '生成失败' }

  try {
    const raw = res.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(raw)
    const slides: Slide[] = (parsed.slides || []).map((s: any) => ({
      id: makeId(),
      layout: s.layout || 'content',
      themeIndex,
      elements: buildElements(s.elements || [], s.layout || 'content'),
    }))
    return { success: true, deck: { title: parsed.title || '演示稿', theme: SLIDE_THEMES[themeIndex], slides } }
  } catch {
    return { success: false, error: '解析 AI 返回内容失败，请重试' }
  }
}

// ═══════════════════════════════════════
//  导出 PPTX
// ═══════════════════════════════════════

// 幻灯片尺寸：10 x 5.63 英寸（16:9）
const SLIDE_W = 10
const SLIDE_H = 5.63
// 字号换算：fontSize(%) → pt（基准高度 540pt）
const pct2pt = (pct: number) => Math.round(pct * 5.4)

function hex(c: string) { return c.replace('#', '') }

export async function exportToPptx(deck: SlidesDeck) {
  const PptxGenJS = (await import('pptxgenjs')).default
  const pptx = new PptxGenJS()
  pptx.layout = 'LAYOUT_16x9'
  pptx.title = deck.title
  const t = deck.theme

  for (const slide of deck.slides) {
    const s = pptx.addSlide()
    s.background = { color: hex(t.bg) }

    // 装饰条
    if (slide.layout === 'title') {
      s.addShape(pptx.ShapeType.rect, { x: 0, y: SLIDE_H * 0.72, w: SLIDE_W, h: 0.05, fill: { color: hex(t.accent) }, line: { color: hex(t.accent), width: 0 } })
    } else if (slide.layout === 'closing') {
      s.addShape(pptx.ShapeType.rect, { x: SLIDE_W * 0.35, y: SLIDE_H * 0.22, w: SLIDE_W * 0.3, h: 0.04, fill: { color: hex(t.accent) }, line: { color: hex(t.accent), width: 0 } })
      s.addShape(pptx.ShapeType.rect, { x: SLIDE_W * 0.35, y: SLIDE_H * 0.88, w: SLIDE_W * 0.3, h: 0.04, fill: { color: hex(t.accent) }, line: { color: hex(t.accent), width: 0 } })
    } else if (slide.layout === 'quote') {
      s.addShape(pptx.ShapeType.rect, { x: SLIDE_W * 0.06, y: 0, w: 0.06, h: SLIDE_H, fill: { color: hex(t.accent) }, line: { color: hex(t.accent), width: 0 } })
    } else if (slide.layout === 'two-column') {
      s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: SLIDE_W, h: SLIDE_H * 0.18, fill: { color: hex(t.accent) }, line: { color: hex(t.accent), width: 0 } })
      s.addShape(pptx.ShapeType.rect, { x: SLIDE_W * 0.5, y: SLIDE_H * 0.2, w: 0.02, h: SLIDE_H * 0.77, fill: { color: hex(t.accent) + '44' }, line: { color: hex(t.accent) + '44', width: 0 } })
    } else {
      s.addShape(pptx.ShapeType.rect, { x: SLIDE_W * 0.035, y: SLIDE_H * 0.05, w: 0.05, h: SLIDE_H * 0.88, fill: { color: hex(t.accent) }, line: { color: hex(t.accent), width: 0 } })
    }

    // 文字元素
    for (const el of slide.elements) {
      const color = getElementColor(el.role, t, el.style.colorOverride)
      s.addText(el.text, {
        x: el.x / 100 * SLIDE_W,
        y: el.y / 100 * SLIDE_H,
        w: el.w / 100 * SLIDE_W,
        h: el.h / 100 * SLIDE_H,
        fontSize: pct2pt(el.style.fontSize),
        bold: el.style.fontWeight === 'bold',
        italic: el.style.fontStyle === 'italic',
        color: hex(color),
        align: el.style.textAlign,
        fontFace: 'Microsoft YaHei',
        breakLine: true,
        charSpacing: el.style.letterSpacing * 100,
      })
    }
  }

  await pptx.writeFile({ fileName: `${deck.title}.pptx` })
}

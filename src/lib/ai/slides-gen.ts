// 幻灯片编辑器 — 数据模型 + AI生成 + PPTX导出

import { chat, type AIClientConfig } from './client'

// ═══════════════════════════════════════
//  核心数据模型
// ═══════════════════════════════════════

export type SlideLayout = 'title' | 'content' | 'bullets' | 'two-column' | 'quote' | 'closing'
export type ElementRole = 'title' | 'subtitle' | 'body' | 'label' | 'custom'
export type ElementType = 'text' | 'image' | 'shape'
// 动画类型：none=无, fade=淡入, slide-up=下往上滑, slide-left=右往左滑, zoom=缩放出现
// appear=立即出现（PPTX Appear 效果映射）, bounce=弹入（PPTX Bounce 映射）
export type AnimationType = 'none' | 'fade' | 'slide-up' | 'slide-left' | 'zoom' | 'appear' | 'bounce'
// 动画触发方式（从 PPTX timing 解析）
export type AnimationTrigger = 'click' | 'after' | 'with'

export interface ElementStyle {
  fontSize: number        // % of slide height（7.5 ≈ 40pt on standard slide）
  fontWeight: 'normal' | 'bold'
  fontStyle: 'normal' | 'italic'
  textAlign: 'left' | 'center' | 'right'
  lineHeight: number
  letterSpacing: number   // em
  colorOverride?: string
  // 文字框背景色（文字元素带形状填充时使用）
  bgFill?: string
}

export interface SlideElement {
  id: string
  elementType: ElementType
  role: ElementRole
  text: string
  imageUrl?: string         // base64, for elementType === 'image'
  // 形状属性（elementType === 'shape'）
  svgPath?: string          // 归一化 SVG path，viewBox 0 0 100 100
  shapeFill?: string        // 填充色，hex
  shapeStroke?: string      // 描边色，hex
  shapeStrokeWidth?: number // 描边宽度（相对于 slide 高度的 %）
  shapePreset?: string      // PPTX 原始 prst 名（调试用）
  x: number              // % of slide width
  y: number              // % of slide height
  w: number
  h: number
  style: ElementStyle
  animation: AnimationType
  animationTrigger?: AnimationTrigger
  animationOrder?: number  // 第几次点击触发（0 = 进入时自动）
  animationDelay?: number  // ms，与前一元素的时间偏移
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
//  主题
// ═══════════════════════════════════════

export const SLIDE_THEMES: SlideTheme[] = [
  { name: '深夜蓝', bg: '#0f172a', titleColor: '#f1f5f9', bodyColor: '#94a3b8', accent: '#6366f1', accentText: '#fff', labelColor: '#818cf8' },
  { name: '清晨白', bg: '#ffffff', titleColor: '#1e293b', bodyColor: '#475569', accent: '#7c3aed', accentText: '#fff', labelColor: '#7c3aed' },
  { name: '森林绿', bg: '#064e3b', titleColor: '#ecfdf5', bodyColor: '#6ee7b7', accent: '#10b981', accentText: '#fff', labelColor: '#34d399' },
  { name: '玫瑰红', bg: '#fff1f2', titleColor: '#881337', bodyColor: '#9f1239', accent: '#f43f5e', accentText: '#fff', labelColor: '#e11d48' },
  { name: '碳灰',   bg: '#18181b', titleColor: '#fafafa', bodyColor: '#a1a1aa', accent: '#f59e0b', accentText: '#000', labelColor: '#fbbf24' },
]

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
//  预设
// ═══════════════════════════════════════

export const SLIDES_PRESETS = [
  { id: 'pitch',    name: '产品介绍', icon: '🚀', examplePrompt: '介绍一款AI写作助手：核心功能有智能续写、风格改写、多语言翻译，目标用户是自媒体创作者，定价99元/月。' },
  { id: 'report',   name: '工作汇报', icon: '📊', examplePrompt: '2024年Q3产品团队汇报：完成3个大版本，用户增长35%，NPS达72，下季度重点推国际化和AI功能。' },
  { id: 'tutorial', name: '教学课件', icon: '📚', examplePrompt: '讲解CSS Flexbox布局基础，包含概念、核心属性、常见布局案例，适合前端初学者。' },
  { id: 'plan',     name: '项目方案', icon: '🗂️', examplePrompt: '社区团购小程序：背景分析、核心功能、技术选型、开发排期、预算。' },
  { id: 'story',    name: '故事叙述', icon: '📖', examplePrompt: '一个独立咖啡品牌的故事：从车库里烘焙咖啡豆到全国20家门店的成长历程。' },
]

// ═══════════════════════════════════════
//  布局默认定位
// ═══════════════════════════════════════

function defaultElementGeom(layout: SlideLayout, role: ElementRole, index: number) {
  const base: ElementStyle = { fontSize: 3, fontWeight: 'normal', fontStyle: 'normal', textAlign: 'left', lineHeight: 1.8, letterSpacing: 0 }
  if (layout === 'title') {
    if (role === 'title')    return { x: 8, y: 22, w: 84, h: 26, style: { ...base, fontSize: 8, fontWeight: 'bold' as const, textAlign: 'center' as const, lineHeight: 1.3 } }
    if (role === 'subtitle') return { x: 8, y: 56, w: 84, h: 14, style: { ...base, fontSize: 3.5, textAlign: 'center' as const } }
  }
  if (layout === 'closing') {
    if (role === 'title')    return { x: 8, y: 26, w: 84, h: 26, style: { ...base, fontSize: 8, fontWeight: 'bold' as const, textAlign: 'center' as const, lineHeight: 1.3 } }
    if (role === 'subtitle') return { x: 8, y: 58, w: 84, h: 14, style: { ...base, fontSize: 3.5, textAlign: 'center' as const } }
  }
  if (layout === 'quote') {
    if (role === 'body')     return { x: 13, y: 20, w: 74, h: 40, style: { ...base, fontSize: 5, fontWeight: 'bold' as const, fontStyle: 'italic' as const, lineHeight: 1.5 } }
    if (role === 'subtitle') return { x: 13, y: 66, w: 74, h: 12, style: { ...base, fontSize: 3 } }
  }
  if (layout === 'two-column') {
    if (role === 'title')    return { x: 4, y: 2, w: 92, h: 17, style: { ...base, fontSize: 4.5, fontWeight: 'bold' as const } }
    if (role === 'body')     return index === 0
      ? { x: 4, y: 22, w: 44, h: 73, style: { ...base, fontSize: 2.8, lineHeight: 1.9 } }
      : { x: 52, y: 22, w: 44, h: 73, style: { ...base, fontSize: 2.8, lineHeight: 1.9 } }
  }
  if (role === 'label')    return { x: 7, y: 6, w: 40, h: 9, style: { ...base, fontSize: 2.2, fontWeight: 'bold' as const, letterSpacing: 0.12 } }
  if (role === 'title')    return { x: 7, y: 15, w: 86, h: 18, style: { ...base, fontSize: 5.5, fontWeight: 'bold' as const, lineHeight: 1.25 } }
  if (role === 'body')     return { x: 7, y: 35, w: 86, h: 60, style: { ...base, fontSize: 2.8, lineHeight: 1.95 } }
  return { x: 10, y: 10, w: 80, h: 20, style: base }
}

// ═══════════════════════════════════════
//  工具函数
// ═══════════════════════════════════════

export function makeId() { return Math.random().toString(36).slice(2, 9) }

function buildElements(rawEls: { type: string; text: string }[], layout: SlideLayout): SlideElement[] {
  const roleCount: Record<string, number> = {}
  return rawEls.map(raw => {
    const role = raw.type as ElementRole
    const idx = roleCount[role] ?? 0
    roleCount[role] = idx + 1
    const geom = defaultElementGeom(layout, role, idx)
    return { id: makeId(), elementType: 'text' as ElementType, role, text: raw.text, animation: 'none' as AnimationType, ...geom }
  })
}

export function createEmptySlide(layout: SlideLayout = 'content'): Slide {
  const rawEls: { type: ElementRole; text: string }[] = []
  switch (layout) {
    case 'title':      rawEls.push({ type: 'title', text: '演示标题' }, { type: 'subtitle', text: '副标题 · 作者 · 日期' }); break
    case 'closing':    rawEls.push({ type: 'title', text: '谢谢观看' }, { type: 'subtitle', text: '欢迎交流 · 联系方式' }); break
    case 'quote':      rawEls.push({ type: 'body', text: '"这里是一段引言或金句"' }, { type: 'subtitle', text: '—— 来源或署名' }); break
    case 'two-column': rawEls.push({ type: 'title', text: '幻灯片标题' }, { type: 'body', text: '左侧内容\n• 要点一\n• 要点二' }, { type: 'body', text: '右侧内容\n• 要点三\n• 要点四' }); break
    default:           rawEls.push({ type: 'label', text: '章节标签' }, { type: 'title', text: '幻灯片标题' }, { type: 'body', text: '• 要点一\n• 要点二\n• 要点三' })
  }
  return { id: makeId(), layout, themeIndex: 0, elements: buildElements(rawEls, layout) }
}

export function createDefaultDeck(): SlidesDeck {
  return { title: '新建演示', theme: SLIDE_THEMES[0], slides: [createEmptySlide('title'), createEmptySlide('bullets'), createEmptySlide('closing')] }
}

// ═══════════════════════════════════════
//  AI 生成完整演示
// ═══════════════════════════════════════

const GEN_SYSTEM = `你是专业演示稿策划师。根据用户描述生成幻灯片内容，返回严格 JSON：
{"title":"...","slides":[{"layout":"title","elements":[{"type":"title","text":"..."},{"type":"subtitle","text":"..."}]}]}
layout 只能是：title/content/bullets/two-column/quote/closing
element type 只能是：title/subtitle/body/label
规则：第一页 layout=title，最后页 layout=closing，生成 6~10 页，body 不超过 100 字，只返回 JSON。`

export async function generateSlidesDeck(config: AIClientConfig, prompt: string, themeIndex = 0) {
  const res = await chat(config, [{ role: 'system', content: GEN_SYSTEM }, { role: 'user', content: prompt }])
  if (!res.success || !res.content) return { success: false, error: res.error || '生成失败' }
  try {
    const raw = res.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(raw)
    const slides: Slide[] = (parsed.slides || []).map((s: any) => ({
      id: makeId(), layout: s.layout || 'content', themeIndex,
      elements: buildElements(s.elements || [], s.layout || 'content'),
    }))
    return { success: true, deck: { title: parsed.title || '演示稿', theme: SLIDE_THEMES[themeIndex], slides } as SlidesDeck }
  } catch { return { success: false, error: '解析 AI 返回失败，请重试' } }
}

// ═══════════════════════════════════════
//  AI 微调单页
// ═══════════════════════════════════════

export async function refineSlide(config: AIClientConfig, slide: Slide, instruction: string) {
  const content = slide.elements.filter(e => e.elementType === 'text').map(e => `[${e.role}] ${e.text}`).join('\n')
  const res = await chat(config, [
    { role: 'system', content: `你是幻灯片内容编辑助手。收到幻灯片内容和修改指令后，返回修改后的 JSON 数组，格式：[{"role":"title","text":"..."}]，保持 role 类型不变，只修改 text，只返回 JSON。` },
    { role: 'user', content: `当前内容：\n${content}\n\n修改指令：${instruction}` },
  ])
  if (!res.success || !res.content) return { success: false, error: res.error }
  try {
    const raw = res.content.replace(/```json?\n?/g, '').replace(/```\n?/g, '').trim()
    const updated = JSON.parse(raw) as { role: string; text: string }[]
    const textEls = slide.elements.filter(e => e.elementType === 'text')
    const newElements = slide.elements.map(el => {
      if (el.elementType !== 'text') return el
      const idx = textEls.indexOf(el)
      const upd = updated[idx]
      return upd ? { ...el, text: upd.text } : el
    })
    return { success: true, slide: { ...slide, elements: newElements } as Slide }
  } catch { return { success: false, error: '解析失败，请重试' } }
}

// ═══════════════════════════════════════
//  导出工具（供外部用 html2canvas 捕获）
// ═══════════════════════════════════════

// 生成单页的静态 HTML 字符串（像素单位，供截图用）
export function renderSlideHtml(slide: Slide, theme: SlideTheme, w = 1280, h = 720): string {
  const t = theme
  const acc = t.accent

  let decoHtml = ''
  if (slide.layout === 'title') {
    decoHtml = `<div style="position:absolute;left:0;top:${h * 0.72}px;width:100%;height:${h * 0.008}px;background:${acc}"></div>`
  } else if (slide.layout === 'closing') {
    decoHtml = `<div style="position:absolute;left:${w*0.35}px;top:${h*0.22}px;width:${w*0.3}px;height:${h*0.007}px;background:${acc}"></div>
                <div style="position:absolute;left:${w*0.35}px;top:${h*0.88}px;width:${w*0.3}px;height:${h*0.007}px;background:${acc}"></div>`
  } else if (slide.layout === 'quote') {
    decoHtml = `<div style="position:absolute;left:${w*0.05}px;top:0;width:${w*0.012}px;height:100%;background:${acc}"></div>`
  } else if (slide.layout === 'two-column') {
    decoHtml = `<div style="position:absolute;left:0;top:0;width:100%;height:${h*0.18}px;background:${acc}"></div>
                <div style="position:absolute;left:${w*0.5}px;top:${h*0.2}px;width:${w*0.003}px;height:${h*0.77}px;background:${acc}55"></div>`
  } else {
    decoHtml = `<div style="position:absolute;left:${w*0.035}px;top:${h*0.05}px;width:${w*0.006}px;height:${h*0.88}px;background:${acc};border-radius:3px"></div>`
  }

  const elsHtml = slide.elements.map(el => {
    if (el.elementType === 'image' && el.imageUrl) {
      return `<div style="position:absolute;left:${el.x}%;top:${el.y}%;width:${el.w}%;height:${el.h}%;overflow:hidden">
        <img src="${el.imageUrl}" style="width:100%;height:100%;object-fit:cover" /></div>`
    }
    if (el.elementType === 'shape') {
      const fill   = el.shapeFill   || t.accent
      const stroke = el.shapeStroke || 'none'
      const sw     = el.shapeStrokeWidth ? el.shapeStrokeWidth / 100 * h : 0
      const path   = el.svgPath || 'M0,0 H100 V100 H0 Z'
      return `<svg style="position:absolute;left:${el.x}%;top:${el.y}%;width:${el.w}%;height:${el.h}%"
        viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d="${path}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" vector-effect="non-scaling-stroke"/>
      </svg>`
    }
    const color = getElementColor(el.role, t, el.style.colorOverride)
    const fs = el.style.fontSize / 100 * h
    const bg = el.style.bgFill ? `background:${el.style.bgFill};` : ''
    return `<div style="position:absolute;left:${el.x}%;top:${el.y}%;width:${el.w}%;height:${el.h}%;${bg}
      font-size:${fs}px;font-weight:${el.style.fontWeight};font-style:${el.style.fontStyle};
      color:${color};text-align:${el.style.textAlign};line-height:${el.style.lineHeight};
      letter-spacing:${el.style.letterSpacing}em;white-space:pre-wrap;word-break:break-word;overflow:hidden;
      font-family:'Microsoft YaHei','PingFang SC',sans-serif">${el.text}</div>`
  }).join('')

  return `<div style="position:relative;width:${w}px;height:${h}px;background:${t.bg};overflow:hidden;font-family:'Microsoft YaHei','PingFang SC',sans-serif">
    ${decoHtml}${elsHtml}
  </div>`
}

// ═══════════════════════════════════════
//  导出 PPTX
// ═══════════════════════════════════════

const SLIDE_W = 10, SLIDE_H = 5.63
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
      s.addShape(pptx.ShapeType.rect, { x: SLIDE_W * 0.05, y: 0, w: 0.06, h: SLIDE_H, fill: { color: hex(t.accent) }, line: { color: hex(t.accent), width: 0 } })
    } else if (slide.layout === 'two-column') {
      s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: SLIDE_W, h: SLIDE_H * 0.18, fill: { color: hex(t.accent) }, line: { color: hex(t.accent), width: 0 } })
    } else {
      s.addShape(pptx.ShapeType.rect, { x: SLIDE_W * 0.035, y: SLIDE_H * 0.05, w: 0.05, h: SLIDE_H * 0.88, fill: { color: hex(t.accent) }, line: { color: hex(t.accent), width: 0 } })
    }

    // 元素
    for (const el of slide.elements) {
      if (el.elementType === 'image' && el.imageUrl) {
        const base64 = el.imageUrl.split(',')[1]
        const ext = el.imageUrl.startsWith('data:image/png') ? 'png' : 'jpg'
        s.addImage({ data: `${ext};base64,${base64}`, x: el.x / 100 * SLIDE_W, y: el.y / 100 * SLIDE_H, w: el.w / 100 * SLIDE_W, h: el.h / 100 * SLIDE_H })
      } else {
        const color = getElementColor(el.role, t, el.style.colorOverride)
        s.addText(el.text, {
          x: el.x / 100 * SLIDE_W, y: el.y / 100 * SLIDE_H,
          w: el.w / 100 * SLIDE_W, h: el.h / 100 * SLIDE_H,
          fontSize: pct2pt(el.style.fontSize), bold: el.style.fontWeight === 'bold',
          italic: el.style.fontStyle === 'italic', color: hex(color),
          align: el.style.textAlign, fontFace: 'Microsoft YaHei', breakLine: true,
          charSpacing: el.style.letterSpacing * 100,
        })
      }
    }
  }
  await pptx.writeFile({ fileName: `${deck.title}.pptx` })
}

// ═══════════════════════════════════════
//  AI 风格分析（分析导入的 PPTX 风格）
// ═══════════════════════════════════════

export interface StyleAnalysis {
  styleKeywords: string[]   // ['极简', '商务', '深色'] 等中文关键词
  tone: string              // '正式专业' | '活泼创意' | '学术严谨' | '品牌营销' 等
  layoutPattern: string     // 版式特征描述
  colorDescription: string  // 颜色风格描述
  aiHint: string            // 给后续生成用的精准提示（混合中英文更好）
}

const STYLE_ANALYZE_SYSTEM = `你是专业的 PPT 设计风格分析师。
分析用户提供的幻灯片数据（内容摘要 + 配色），返回严格 JSON：
{
  "styleKeywords": ["关键词1", "关键词2", "关键词3"],
  "tone": "语调描述（2~4字）",
  "layoutPattern": "版式特征（1句话）",
  "colorDescription": "颜色风格（1句话）",
  "aiHint": "English style hint for AI generation, 1-2 sentences, describe visual style, color mood, layout preference"
}
styleKeywords 从以下选 2~4 个：极简、商务、学术、科技、创意、温暖、深色、明亮、扁平、插画、中国风、渐变
只返回 JSON，不要解释。`

export async function analyzeStyleWithAI(
  config: AIClientConfig,
  summary: string,
): Promise<{ success: boolean; analysis?: StyleAnalysis; error?: string }> {
  const res = await chat(config, [
    { role: 'system', content: STYLE_ANALYZE_SYSTEM },
    { role: 'user', content: summary },
  ])
  if (!res.success || !res.content) return { success: false, error: res.error }
  try {
    const raw = res.content.replace(/```json?\n?/g, '').replace(/```\n?/g, '').trim()
    const analysis = JSON.parse(raw) as StyleAnalysis
    return { success: true, analysis }
  } catch {
    return { success: false, error: '风格分析解析失败' }
  }
}

// ═══════════════════════════════════════
//  风格感知续写 / 补全
// ═══════════════════════════════════════

// 把现有幻灯片内容压缩成上下文摘要
function buildContextSummary(slides: Slide[]): string {
  return slides.map((s, i) => {
    const texts = s.elements
      .filter(e => e.elementType === 'text')
      .map(e => `[${e.role}]${e.text.slice(0, 60)}`)
      .join(' ')
    return `第${i + 1}页(${s.layout}): ${texts}`
  }).join('\n')
}

export async function generateSlidesWithStyle(
  config: AIClientConfig,
  instruction: string,         // 用户指令，如"再生成 3 页关于竞品分析的内容"
  styleAnalysis: StyleAnalysis,
  existingSlides: Slide[],
  themeIndex = 0,
): Promise<{ success: boolean; slides?: Slide[]; error?: string }> {
  const context  = buildContextSummary(existingSlides)
  const styleHint = `${styleAnalysis.aiHint} 风格关键词: ${styleAnalysis.styleKeywords.join('/')}，语调: ${styleAnalysis.tone}。`

  const system = `你是专业演示稿策划师。严格按照提供的风格生成幻灯片，风格要与已有内容保持一致。
风格描述: ${styleHint}
版式特征: ${styleAnalysis.layoutPattern}

返回严格 JSON（只返回 JSON，不要解释）:
{"slides":[{"layout":"content","elements":[{"type":"title","text":"..."},{"type":"body","text":"..."}]}]}
layout 只能是: title/content/bullets/two-column/quote/closing
element type 只能是: title/subtitle/body/label
正文 body 不超过 80 字，要点用换行分隔，不要加序号，只返回 JSON。`

  const userPrompt = `已有幻灯片内容（共${existingSlides.length}页）：
${context}

续写指令：${instruction}`

  const res = await chat(config, [
    { role: 'system', content: system },
    { role: 'user', content: userPrompt },
  ])
  if (!res.success || !res.content) return { success: false, error: res.error }
  try {
    const raw = res.content.replace(/```json?\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(raw)
    const slides: Slide[] = (parsed.slides || []).map((s: any) => ({
      id: makeId(), layout: s.layout || 'content', themeIndex,
      elements: buildElements(s.elements || [], s.layout || 'content'),
    }))
    return { success: true, slides }
  } catch { return { success: false, error: '解析失败，请重试' } }
}

// ═══════════════════════════════════════
//  风格感知美化（对所有文字统一语言风格）
// ═══════════════════════════════════════

export async function polishDeckWithStyle(
  config: AIClientConfig,
  slides: Slide[],
  styleAnalysis: StyleAnalysis,
  instruction = '统一语言风格，让表达更精炼、专业',
): Promise<{ success: boolean; slides?: Slide[]; error?: string }> {
  const content = slides.map((s, i) => ({
    slideIndex: i,
    elements: s.elements
      .filter(e => e.elementType === 'text')
      .map(e => ({ id: e.id, role: e.role, text: e.text })),
  }))

  const system = `你是演示稿文案优化师。保持幻灯片结构不变，只修改文字内容，使其：
1. 语言风格统一，符合描述：${styleAnalysis.tone}，${styleAnalysis.styleKeywords.join('/')}
2. ${instruction}
3. 保持每个元素的 role 和 id 不变

返回严格 JSON（只返回 JSON）:
[{"slideIndex":0,"elements":[{"id":"xxx","text":"优化后文字"}]}]`

  const res = await chat(config, [
    { role: 'system', content: system },
    { role: 'user', content: JSON.stringify(content) },
  ])
  if (!res.success || !res.content) return { success: false, error: res.error }
  try {
    const raw = res.content.replace(/```json?\n?/g, '').replace(/```\n?/g, '').trim()
    const updates = JSON.parse(raw) as { slideIndex: number; elements: { id: string; text: string }[] }[]
    const idMap: Record<string, string> = {}
    for (const upd of updates) {
      for (const el of upd.elements) idMap[el.id] = el.text
    }
    const newSlides = slides.map(s => ({
      ...s,
      elements: s.elements.map(el =>
        idMap[el.id] ? { ...el, text: idMap[el.id] } : el
      ),
    }))
    return { success: true, slides: newSlides }
  } catch { return { success: false, error: '解析失败，请重试' } }
}

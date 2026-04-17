// 小红书图片组渲染器 — 分页算法 + HTML生成

import { parseMarkdown, renderInline, type MarkdownNode } from './markdown'
import type { StyleComboV2 } from '../atoms'
import { getSlot, type RenderContext } from '../atoms/slots'
import type { BlueprintXhsConfig, CoverVariantType, ContentLayoutType } from '../atoms/blueprints'

// ═══════════════════════════════════════
//  类型定义
// ═══════════════════════════════════════

export interface XhsConfig {
  width: number
  height: number
  padding: number
  fontSize: number
  lineHeight: number
}

export const XHS_PRESETS: Record<string, XhsConfig> = {
  '3:4': { width: 1080, height: 1440, padding: 60, fontSize: 32, lineHeight: 1.8 },
  '1:1': { width: 1080, height: 1080, padding: 60, fontSize: 30, lineHeight: 1.8 },
  '16:9': { width: 1920, height: 1080, padding: 80, fontSize: 32, lineHeight: 1.8 },
}

/** 页面视觉模板类型（content 页专用） */
export type PageTemplateType = 'feature-grid' | 'workflow' | 'text-highlight' | 'card-list' | 'standard'

export interface XhsPage {
  type: 'cover' | 'content' | 'ending'
  elements: PageElement[]
  pageIndex: number
  totalPages: number
  templateType?: PageTemplateType
}

export interface PageElement {
  type: 'heading' | 'paragraph' | 'list' | 'blockquote' | 'code' | 'hr' | 'table'
  content: string
  level?: number
  items?: string[]
  ordered?: boolean
  headers?: string[]
  rows?: string[][]
  estimatedHeight: number
}

// ═══════════════════════════════════════
//  高度估算
// ═══════════════════════════════════════

function estimateTextHeight(text: string, fontSize: number, lineHeight: number, availableWidth: number): number {
  const charsPerLine = Math.floor(availableWidth / fontSize)
  if (charsPerLine <= 0) return fontSize * lineHeight
  const lines = Math.max(1, Math.ceil(text.length / charsPerLine))
  return lines * fontSize * lineHeight
}

// ═══════════════════════════════════════
//  V2 高度估算 — 插槽装饰感知 + 缩放感知
// ═══════════════════════════════════════

/**
 * 插槽装饰开销（基于微信 600px 基准值，单位 px）
 * marginV: 上下 margin 总和
 * paddingV: 上下 padding 总和
 * decorExtra: 边框 / 图标 / 圆角等额外空间
 */
const SLOT_OVERHEAD: Record<string, { marginV: number; paddingV: number; decorExtra: number }> = {
  heading:    { marginV: 44, paddingV: 0,  decorExtra: 12 },
  paragraph:  { marginV: 20, paddingV: 0,  decorExtra: 0 },
  blockquote: { marginV: 16, paddingV: 28, decorExtra: 6 },
  list:       { marginV: 16, paddingV: 0,  decorExtra: 8 },
  code:       { marginV: 32, paddingV: 32, decorExtra: 4 },
  hr:         { marginV: 48, paddingV: 0,  decorExtra: 8 },
  table:      { marginV: 32, paddingV: 16, decorExtra: 8 },
}

/** 布局模式额外每元素开销（基准 px） */
const LAYOUT_OVERHEAD: Record<ContentLayoutType, number> = {
  'standard': 0,
  'card-wrapped': 44,
  'alternating-bg': 16,
  'timeline-rail': 20,
}

/** V2: 单个元素高度估算（含插槽装饰 + 缩放） */
function estimateElementHeightV2(
  node: MarkdownNode,
  config: XhsConfig,
  scale: number,
  layout: ContentLayoutType,
): number {
  const contentWidth = config.width - config.padding * 2
  const { fontSize, lineHeight } = config

  const overhead = SLOT_OVERHEAD[node.type] || SLOT_OVERHEAD['paragraph']
  const decorH = (overhead.marginV + overhead.paddingV + overhead.decorExtra) * scale
  const layoutExtra = LAYOUT_OVERHEAD[layout] * scale

  let textH: number
  switch (node.type) {
    case 'heading': {
      const hSize = node.level === 1 ? fontSize * 1.6 : node.level === 2 ? fontSize * 1.3 : fontSize * 1.1
      textH = estimateTextHeight(node.text || '', hSize, lineHeight, contentWidth)
      break
    }
    case 'paragraph':
      textH = estimateTextHeight(node.text || '', fontSize, lineHeight, contentWidth)
      break
    case 'blockquote':
      textH = estimateTextHeight(node.text || '', fontSize * 0.95, lineHeight, contentWidth - 80 * scale)
      break
    case 'list': {
      textH = (node.children || []).reduce((sum, item) => {
        return sum + estimateTextHeight(item, fontSize, lineHeight, contentWidth - 36 * scale) + 8 * scale
      }, 0)
      break
    }
    case 'code':
      textH = estimateTextHeight(node.text || '', fontSize * 0.8, 1.5, contentWidth - 40 * scale)
      break
    case 'hr':
      textH = 0
      break
    case 'table': {
      const rowCount = (node.rows?.length || 0) + 1
      textH = rowCount * (fontSize * lineHeight + 16 * scale)
      break
    }
    default:
      textH = fontSize * lineHeight
  }

  return textH + decorH + layoutExtra
}

/** V2: 页面级装饰占用高度（header / pageNum / footer / brand） */
function estimatePageChromeV2(config: XhsConfig, xhs: BlueprintXhsConfig): number {
  let chrome = config.padding * 2 // top + bottom padding (已含在容器box-sizing里)

  // 页码区域
  chrome += Math.round(config.fontSize * 0.65) + 20

  // header bar
  if (xhs.pageDecoration.headerBar) chrome += 6

  // footer line
  if (xhs.pageDecoration.footerLine) chrome += 4

  // brand watermark
  if (xhs.pageDecoration.brandPosition !== 'none') chrome += Math.round(config.fontSize * 0.5) + 10

  // safety margin（取整 / 行内装饰误差）
  chrome += 24

  return chrome
}

/** V2: 将 MarkdownNode 转为 PageElement（使用 V2 估算） */
function nodeToPageElementV2(
  node: MarkdownNode,
  config: XhsConfig,
  scale: number,
  layout: ContentLayoutType,
): PageElement {
  return {
    type: node.type === 'image' ? 'paragraph' : node.type as PageElement['type'],
    content: node.text || (node.type === 'image' ? `[图片: ${node.alt || ''}]` : ''),
    level: node.level,
    items: node.children,
    ordered: node.ordered,
    headers: node.headers,
    rows: node.rows,
    estimatedHeight: estimateElementHeightV2(node, config, scale, layout),
  }
}

// ═══════════════════════════════════════
//  模板规划器 — 根据内容选择视觉模板
// ═══════════════════════════════════════

/** 根据页面元素决定最适合的视觉模板 */
function planPageTemplate(elements: PageElement[]): PageTemplateType {
  const lists = elements.filter(e => e.type === 'list')
  const headings = elements.filter(e => e.type === 'heading')
  const paragraphs = elements.filter(e => e.type === 'paragraph')
  const blockquotes = elements.filter(e => e.type === 'blockquote')
  const hasOrderedList = lists.some(l => l.ordered)
  const hasUnorderedList = lists.some(l => !l.ordered)

  // 流程步骤：有序列表（步骤感强）
  if (hasOrderedList) {
    const orderedList = lists.find(l => l.ordered)
    if ((orderedList?.items?.length ?? 0) >= 2) return 'workflow'
  }

  // 特性网格：无序列表 2-8 项（每项短文本）
  if (hasUnorderedList && headings.length <= 1) {
    const ul = lists.find(l => !l.ordered)
    const itemCount = ul?.items?.length ?? 0
    if (itemCount >= 2 && itemCount <= 8) return 'feature-grid'
  }

  // 文字强调：以引用块为主
  if (blockquotes.length > 0 && paragraphs.length <= 1 && headings.length <= 1) {
    return 'text-highlight'
  }

  // 卡片列表：标题 + 段落（适合连贯正文）
  if (headings.length >= 1 && paragraphs.length >= 1 && lists.length === 0 && blockquotes.length === 0) {
    return 'card-list'
  }

  return 'standard'
}

/** V2 分页算法 — 先按 H2/H3 分节，每节一页；节过长时再按高度补切 */
export function splitToPagesV2(markdown: string, config: XhsConfig, style: StyleComboV2): XhsPage[] {
  const allNodes = parseMarkdown(markdown)
  if (allNodes.length === 0) return []

  const xhs = style.blueprint.xhs
  const scale = config.fontSize / 16
  const layout = xhs.contentLayout
  const availableHeight = config.height - estimatePageChromeV2(config, xhs)

  const pages: XhsPage[] = []

  // ── 提取封面信息 ──────────────────────────────
  let titleText = '无标题'
  let summaryText = ''
  let contentStartIdx = 0

  if (allNodes[0]?.type === 'heading') {
    titleText = allNodes[0].text || '无标题'
    contentStartIdx = 1
    if (allNodes[1]?.type === 'paragraph') {
      summaryText = allNodes[1].text || ''
      contentStartIdx = 2
    }
  } else if (allNodes[0]?.type === 'paragraph') {
    titleText = allNodes[0].text || '无标题'
    contentStartIdx = 1
  }

  pages.push({
    type: 'cover',
    elements: [
      { type: 'heading', content: titleText, level: 1, estimatedHeight: 0 },
      ...(summaryText ? [{ type: 'paragraph' as const, content: summaryText, estimatedHeight: 0 }] : []),
    ],
    pageIndex: 0,
    totalPages: 0,
  })

  // ── 按 heading 分节 ──────────────────────────
  const contentNodes = allNodes.slice(contentStartIdx)
  const sections: import('./markdown').MarkdownNode[][] = []
  let cur: import('./markdown').MarkdownNode[] = []

  for (const node of contentNodes) {
    if (node.type === 'heading' && cur.length > 0) {
      sections.push(cur)
      cur = [node]
    } else {
      cur.push(node)
    }
  }
  if (cur.length > 0) sections.push(cur)

  // ── 每节转成一张或多张页 ──────────────────────
  for (const sectionNodes of sections) {
    const allEls = sectionNodes.map(n => nodeToPageElementV2(n, config, scale, layout))
    const totalH = allEls.reduce((s, e) => s + e.estimatedHeight, 0)

    if (totalH <= availableHeight) {
      // 整节放一页
      pages.push({
        type: 'content',
        elements: allEls,
        pageIndex: pages.length,
        totalPages: 0,
        templateType: planPageTemplate(allEls),
      })
    } else {
      // 节过长：保留 heading 在每批首位，按高度补切
      const headingEl = allEls[0]?.type === 'heading' ? allEls[0] : null
      let batch: PageElement[] = []
      let batchH = 0

      for (const el of allEls) {
        if (batchH + el.estimatedHeight > availableHeight && batch.length > 0) {
          pages.push({
            type: 'content',
            elements: batch,
            pageIndex: pages.length,
            totalPages: 0,
            templateType: planPageTemplate(batch),
          })
          // 续页顶部带上 heading（续）
          batch = headingEl && el !== headingEl ? [headingEl, el] : [el]
          batchH = batch.reduce((s, e) => s + e.estimatedHeight, 0)
        } else {
          batch.push(el)
          batchH += el.estimatedHeight
        }
      }
      if (batch.length > 0) {
        pages.push({
          type: 'content',
          elements: batch,
          pageIndex: pages.length,
          totalPages: 0,
          templateType: planPageTemplate(batch),
        })
      }
    }
  }

  // ── 尾页 ─────────────────────────────────────
  pages.push({ type: 'ending', elements: [], pageIndex: pages.length, totalPages: 0 })

  const total = pages.length
  pages.forEach((p, i) => { p.pageIndex = i; p.totalPages = total })

  return pages
}

// ═══════════════════════════════════════════════════════════
//  V2 渲染器 — 使用骨架+插槽系统渲染小红书
//  支持 15 种骨架 × 6 插槽 × 11 配色 × 3 字体 × 3 比例
// ═══════════════════════════════════════════════════════════

// ─── 封面变体渲染函数（V2 封面页使用）──────────────────────

function renderCoverClassic(
  title: string, summary: string, colors: any, titleFont: string, bodyFont: string,
  titleSize: number, subtitleSize: number, separator: string, config: XhsConfig
): string {
  const topY = Math.round(config.height * 0.25)
  return `
    <div style="position: absolute; top: ${config.padding}px; left: ${config.padding}px; right: ${config.padding}px;
      text-align: center; color: ${colors.primary}; font-size: ${config.fontSize * 0.8}px; opacity: 0.6;">
      ${separator}
    </div>
    <div style="position: absolute; top: ${topY}px; left: ${config.padding * 1.5}px; right: ${config.padding * 1.5}px; text-align: center;">
      <h1 style="font-family: '${titleFont}', '${bodyFont}', sans-serif; font-size: ${titleSize}px; font-weight: 800;
        color: ${colors.text}; line-height: 1.4; margin: 0 0 ${config.padding}px; letter-spacing: 2px;">
        ${renderInline(title)}
      </h1>
      ${summary ? `<p style="font-size: ${subtitleSize}px; color: ${colors.textMuted}; line-height: 1.7; margin: 0; padding: 0 20px;">
        ${renderInline(summary)}</p>` : ''}
    </div>
    <div style="position: absolute; bottom: ${config.padding * 1.5}px; left: 0; right: 0; text-align: center;">
      <div style="color: ${colors.primary}; font-size: ${config.fontSize * 0.75}px; opacity: 0.5;">${separator}</div>
      <div style="color: ${colors.textMuted}; font-size: ${config.fontSize * 0.7}px; margin-top: 16px; letter-spacing: 1px;">
        云中书 · YunType
      </div>
    </div>
  `
}

function renderCoverBold(
  title: string, summary: string, colors: any, titleFont: string, bodyFont: string,
  titleSize: number, subtitleSize: number, separator: string, config: XhsConfig
): string {
  const bigSize = Math.round(titleSize * 1.3)
  return `
    <div style="position: absolute; top: 0; left: 0; width: 12px; height: 100%; background: ${colors.primary};"></div>
    <div style="position: absolute; top: ${config.padding * 1.2}px; left: ${config.padding * 2}px;">
      <span style="background: ${colors.primary}; color: #fff; padding: 6px 16px; border-radius: 20px;
        font-size: ${config.fontSize * 0.7}px; font-weight: 600; letter-spacing: 1px;">FEATURED</span>
    </div>
    <div style="position: absolute; top: ${Math.round(config.height * 0.2)}px; left: ${config.padding * 2}px; right: ${config.padding * 2}px;">
      <h1 style="font-family: '${titleFont}', '${bodyFont}', sans-serif; font-size: ${bigSize}px; font-weight: 900;
        color: ${colors.text}; line-height: 1.2; margin: 0; letter-spacing: -1px;">
        ${renderInline(title)}
      </h1>
    </div>
    <div style="position: absolute; bottom: ${config.padding * 2}px; left: ${config.padding * 2}px; right: ${config.padding * 2}px;">
      ${summary ? `
        <div style="border-top: 3px solid ${colors.primary}; padding-top: 20px; margin-bottom: 20px;">
          <p style="font-size: ${subtitleSize}px; color: ${colors.textMuted}; line-height: 1.8; margin: 0;">
            ${renderInline(summary)}</p>
        </div>` : ''}
      <div style="color: ${colors.textMuted}; font-size: ${config.fontSize * 0.65}px; letter-spacing: 2px;">
        ${separator}
      </div>
    </div>
  `
}

function renderCoverMinimal(
  title: string, summary: string, colors: any, titleFont: string, bodyFont: string,
  titleSize: number, subtitleSize: number, config: XhsConfig
): string {
  return `
    <div style="position: absolute; top: 50%; left: ${config.padding * 2}px; right: ${config.padding * 2}px;
      transform: translateY(-50%); text-align: center;">
      <h1 style="font-family: '${titleFont}', '${bodyFont}', sans-serif; font-size: ${titleSize}px; font-weight: 300;
        color: ${colors.text}; line-height: 1.6; margin: 0; letter-spacing: 4px;">
        ${renderInline(title)}
      </h1>
      ${summary ? `
        <div style="width: 40px; height: 1px; background: ${colors.primary}; margin: 30px auto;"></div>
        <p style="font-size: ${Math.round(subtitleSize * 0.9)}px; color: ${colors.textMuted}; line-height: 1.8; margin: 0; font-weight: 300;">
          ${renderInline(summary)}</p>` : ''}
    </div>
    <div style="position: absolute; bottom: ${config.padding}px; left: 0; right: 0; text-align: center;">
      <div style="color: ${colors.textMuted}; font-size: ${config.fontSize * 0.6}px; letter-spacing: 3px; opacity: 0.5;">
        YUNTYPE
      </div>
    </div>
  `
}

function renderCoverCard(
  title: string, summary: string, colors: any, titleFont: string, bodyFont: string,
  titleSize: number, subtitleSize: number, separator: string, config: XhsConfig
): string {
  const cardPad = config.padding * 1.5
  return `
    <div style="position: absolute; top: -${config.height * 0.1}px; right: -${config.width * 0.1}px;
      width: ${config.width * 0.5}px; height: ${config.width * 0.5}px;
      border-radius: 50%; background: ${colors.primary}; opacity: 0.06;"></div>
    <div style="position: absolute; bottom: -${config.height * 0.05}px; left: -${config.width * 0.05}px;
      width: ${config.width * 0.3}px; height: ${config.width * 0.3}px;
      border-radius: 50%; background: ${colors.primary}; opacity: 0.04;"></div>
    <div style="position: absolute; top: 50%; left: ${cardPad}px; right: ${cardPad}px;
      transform: translateY(-50%);
      background: ${colors.contentBg}; border-radius: 20px; padding: ${config.padding * 1.5}px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.08);">
      <div style="text-align: center; color: ${colors.primary}; font-size: ${config.fontSize * 0.7}px; margin-bottom: 20px; opacity: 0.6;">
        ${separator}
      </div>
      <h1 style="font-family: '${titleFont}', '${bodyFont}', sans-serif; font-size: ${Math.round(titleSize * 0.9)}px;
        font-weight: 800; color: ${colors.text}; line-height: 1.4; margin: 0 0 16px; text-align: center; letter-spacing: 1px;">
        ${renderInline(title)}
      </h1>
      ${summary ? `<p style="font-size: ${subtitleSize}px; color: ${colors.textMuted}; line-height: 1.7; margin: 0;
        text-align: center; padding: 0 10px;">${renderInline(summary)}</p>` : ''}
      <div style="text-align: center; color: ${colors.primary}; font-size: ${config.fontSize * 0.7}px; margin-top: 24px; opacity: 0.6;">
        ${separator}
      </div>
    </div>
    <div style="position: absolute; bottom: ${config.padding}px; left: 0; right: 0; text-align: center;">
      <div style="color: ${colors.textMuted}; font-size: ${config.fontSize * 0.65}px; letter-spacing: 1px;">
        云中书 · YunType
      </div>
    </div>
  `
}

function renderCoverMagazine(
  title: string, summary: string, colors: any, titleFont: string, bodyFont: string,
  titleSize: number, subtitleSize: number, separator: string, config: XhsConfig
): string {
  const firstChar = title.charAt(0)
  return `
    <div style="position: absolute; top: 0; left: 0; right: 0; height: 6px; background: ${colors.primary};"></div>
    <div style="position: absolute; top: ${config.padding * 1.5}px; left: ${config.padding * 1.5}px; right: ${config.padding * 1.5}px;
      display: flex; justify-content: space-between; align-items: center;">
      <span style="font-size: ${config.fontSize * 0.7}px; color: ${colors.textMuted}; letter-spacing: 3px; text-transform: uppercase;">
        YUNTYPE MAGAZINE
      </span>
      <span style="font-size: ${config.fontSize * 0.65}px; color: ${colors.textMuted};">
        ${new Date().toLocaleDateString('zh-CN')}
      </span>
    </div>
    <div style="position: absolute; top: ${Math.round(config.height * 0.22)}px; left: ${config.padding * 1.5}px; right: ${config.padding * 1.5}px;">
      <div style="display: flex; align-items: flex-start; gap: 4px;">
        <span style="font-family: '${titleFont}', serif; font-size: ${Math.round(titleSize * 2)}px; font-weight: 900;
          color: ${colors.primary}; line-height: 0.85; opacity: 0.15;">
          ${firstChar}
        </span>
      </div>
      <h1 style="font-family: '${titleFont}', '${bodyFont}', sans-serif; font-size: ${titleSize}px; font-weight: 800;
        color: ${colors.text}; line-height: 1.3; margin: -${Math.round(titleSize * 0.5)}px 0 0; letter-spacing: 1px;">
        ${renderInline(title)}
      </h1>
      ${summary ? `
        <div style="margin-top: 24px; padding-left: 20px; border-left: 3px solid ${colors.primary};">
          <p style="font-size: ${subtitleSize}px; color: ${colors.textMuted}; line-height: 1.8; margin: 0;">
            ${renderInline(summary)}</p>
        </div>` : ''}
    </div>
    <div style="position: absolute; bottom: ${config.padding * 1.5}px; left: ${config.padding * 1.5}px; right: ${config.padding * 1.5}px;
      border-top: 1px solid ${colors.primary}30; padding-top: 12px; display: flex; justify-content: space-between;">
      <span style="color: ${colors.textMuted}; font-size: ${config.fontSize * 0.6}px;">${separator}</span>
      <span style="color: ${colors.textMuted}; font-size: ${config.fontSize * 0.6}px;">云中书 YunType</span>
    </div>
  `
}

/** 将封面变体映射到分隔符 */
const COVER_SEPARATORS: Record<CoverVariantType, string> = {
  classic: '· · · · ·',
  bold: '■ ■ ■ ■ ■',
  minimal: '',
  card: '◇ ◇ ◇',
  magazine: '──────',
}

/** 页码渲染 — 4 种风格 */
function renderPageNumber(page: XhsPage, style: 'right' | 'center' | 'fraction' | 'dot', colors: any, fontSize: number): string {
  const idx = page.pageIndex + 1
  const total = page.totalPages
  switch (style) {
    case 'center':
      return `<div style="text-align:center;color:${colors.textMuted};font-size:${fontSize * 0.6}px;margin-bottom:16px;letter-spacing:2px;">${idx} / ${total}</div>`
    case 'fraction':
      return `<div style="text-align:right;color:${colors.textMuted};font-size:${fontSize * 0.55}px;margin-bottom:16px;font-family:'JetBrains Mono',monospace;"><span style="font-size:${fontSize * 0.9}px;font-weight:700;color:${colors.primary};">${idx}</span><span style="opacity:0.4;"> / ${total}</span></div>`
    case 'dot': {
      const dots = Array.from({ length: total }, (_, i) =>
        `<span style="display:inline-block;width:${i === idx - 1 ? 16 : 6}px;height:6px;border-radius:3px;background:${i === idx - 1 ? colors.primary : colors.primary + '30'};"></span>`
      ).join('')
      return `<div style="text-align:center;display:flex;gap:4px;justify-content:center;margin-bottom:16px;">${dots}</div>`
    }
    case 'right':
    default:
      return `<div style="text-align:right;color:${colors.textMuted};font-size:${fontSize * 0.65}px;margin-bottom:20px;font-family:'JetBrains Mono',monospace;">${idx} / ${total}</div>`
  }
}

/** 页面顶部装饰条 */
function renderV2HeaderBar(colors: any, config: XhsConfig, bp: StyleComboV2['blueprint']): string {
  const xhs = bp.xhs
  if (!xhs.pageDecoration.headerBar) return ''
  // 根据骨架风格选择不同的头部装饰
  if (bp.tags.includes('magazine') || bp.tags.includes('editorial')) {
    return `<div style="position:absolute;top:0;left:0;right:0;height:4px;background:${colors.primary};"></div>`
  }
  if (bp.tags.includes('academic') || bp.tags.includes('formal')) {
    return `<div style="position:absolute;top:${config.padding * 0.5}px;left:${config.padding}px;right:${config.padding}px;border-top:2px double ${colors.primary}40;padding-top:4px;"></div>`
  }
  return `<div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,${colors.primary},${colors.primary}40,transparent);"></div>`
}

/** 页面底部装饰 */
function renderV2FooterDecor(colors: any, config: XhsConfig, xhs: BlueprintXhsConfig): string {
  if (!xhs.pageDecoration.footerLine) return ''
  return `<div style="position:absolute;bottom:${config.padding}px;left:${config.padding * 1.5}px;right:${config.padding * 1.5}px;height:2px;background:linear-gradient(90deg,transparent,${colors.primary}40,transparent);"></div>`
}

/** 品牌水印 */
function renderV2Brand(colors: any, config: XhsConfig, position: 'bottom-center' | 'bottom-right' | 'none'): string {
  if (position === 'none') return ''
  const align = position === 'bottom-right' ? 'right' : 'center'
  return `<div style="position:absolute;bottom:${config.padding * 0.4}px;left:${config.padding}px;right:${config.padding}px;text-align:${align};color:${colors.textMuted};font-size:${Math.round(config.fontSize * 0.45)}px;opacity:0.4;letter-spacing:1px;">云中书 YunType</div>`
}

// ═══════════════════════════════════════════════════════════
//  视觉模板渲染器 — Phase C
// ═══════════════════════════════════════════════════════════

/** 特性网格模板 — 标题 + 2列网格卡片 */
function renderTemplateFeatureGrid(
  elements: PageElement[], colors: any, config: XhsConfig, _ctx: RenderContext
): string {
  const heading = elements.find(e => e.type === 'heading')
  const listEl = elements.find(e => e.type === 'list')
  const items = listEl?.items ?? []
  const fs = config.fontSize
  const pad = config.padding

  const headingHtml = heading
    ? `<div style="margin-bottom:${Math.round(fs * 0.9)}px;">
        <div style="display:inline-block;background:${colors.primary};height:${Math.round(fs * 0.18)}px;width:${Math.round(fs * 1.2)}px;border-radius:4px;vertical-align:middle;margin-right:12px;"></div>
        <span style="font-size:${Math.round(fs * 1.35)}px;font-weight:800;color:${colors.text};vertical-align:middle;line-height:1.3;">${renderInline(heading.content)}</span>
      </div>`
    : ''

  const ICONS = ['💡', '🎯', '✨', '🚀', '🔥', '⚡', '🌟', '💎']
  const gridCols = items.length <= 4 ? 2 : 2
  const cardGap = Math.round(fs * 0.45)
  const cardPad = Math.round(fs * 0.7)

  const cards = items.map((item, i) => {
    const icon = ICONS[i % ICONS.length]
    const isDark = colors.pageBg.startsWith('#0') || colors.pageBg.startsWith('#1')
    const cardBg = isDark ? `rgba(255,255,255,0.06)` : colors.contentBg
    const cardBorder = isDark ? `rgba(255,255,255,0.1)` : `${colors.primary}20`
    return `
      <div style="background:${cardBg};border-radius:${Math.round(fs * 0.5)}px;padding:${cardPad}px;border:1.5px solid ${cardBorder};display:flex;flex-direction:column;gap:${Math.round(fs * 0.3)}px;">
        <div style="display:flex;align-items:center;gap:${Math.round(fs * 0.35)}px;">
          <div style="width:${Math.round(fs * 1.1)}px;height:${Math.round(fs * 1.1)}px;border-radius:${Math.round(fs * 0.3)}px;background:${colors.primary}25;display:flex;align-items:center;justify-content:center;font-size:${Math.round(fs * 0.75)}px;flex-shrink:0;">${icon}</div>
          <span style="font-size:${Math.round(fs * 0.9)}px;font-weight:700;color:${colors.primary};line-height:1.2;">${String(i + 1).padStart(2, '0')}</span>
        </div>
        <div style="font-size:${Math.round(fs * 0.85)}px;color:${colors.text};line-height:1.6;">${renderInline(item)}</div>
      </div>`
  }).join('')

  return `
    <div style="padding:${pad}px;height:100%;box-sizing:border-box;display:flex;flex-direction:column;">
      ${headingHtml}
      <div style="display:grid;grid-template-columns:repeat(${gridCols},1fr);gap:${cardGap}px;flex:1;align-content:start;">
        ${cards}
      </div>
    </div>`
}

/** 流程步骤模板 — 时间线 + 步骤卡片 */
function renderTemplateWorkflow(
  elements: PageElement[], colors: any, config: XhsConfig, _ctx: RenderContext
): string {
  const heading = elements.find(e => e.type === 'heading')
  const listEl = elements.find(e => e.type === 'list' && e.ordered)
    ?? elements.find(e => e.type === 'list')
  const items = listEl?.items ?? []
  const fs = config.fontSize
  const pad = config.padding

  const headingHtml = heading
    ? `<div style="margin-bottom:${Math.round(fs * 0.9)}px;padding-left:${Math.round(fs * 0.5)}px;border-left:${Math.round(fs * 0.2)}px solid ${colors.primary};">
        <div style="font-size:${Math.round(fs * 1.3)}px;font-weight:800;color:${colors.text};line-height:1.3;">${renderInline(heading.content)}</div>
      </div>`
    : ''

  const isDark = colors.pageBg.startsWith('#0') || colors.pageBg.startsWith('#1')
  const stepBg = isDark ? `rgba(255,255,255,0.05)` : colors.contentBg
  const stepBorder = isDark ? `rgba(255,255,255,0.08)` : `${colors.primary}18`
  const dotSize = Math.round(fs * 0.9)
  const railLeft = Math.round(dotSize / 2)

  const steps = items.map((item, i) => {
    const isLast = i === items.length - 1
    return `
      <div style="display:flex;gap:${Math.round(fs * 0.5)}px;position:relative;padding-bottom:${isLast ? 0 : Math.round(fs * 0.5)}px;">
        <div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0;">
          <div style="width:${dotSize}px;height:${dotSize}px;border-radius:50%;background:${colors.primary};display:flex;align-items:center;justify-content:center;font-size:${Math.round(fs * 0.55)}px;font-weight:800;color:#fff;z-index:1;">${i + 1}</div>
          ${!isLast ? `<div style="width:2px;flex:1;background:${colors.primary}30;margin-top:4px;"></div>` : ''}
        </div>
        <div style="background:${stepBg};border-radius:${Math.round(fs * 0.4)}px;padding:${Math.round(fs * 0.45)}px ${Math.round(fs * 0.6)}px;border:1px solid ${stepBorder};flex:1;margin-bottom:${isLast ? 0 : Math.round(fs * 0.25)}px;">
          <div style="font-size:${Math.round(fs * 0.85)}px;color:${colors.text};line-height:1.6;">${renderInline(item)}</div>
        </div>
      </div>`
  }).join('')

  // extra paragraphs below steps
  const extraParas = elements.filter(e => e.type === 'paragraph')
    .map(e => `<div style="font-size:${Math.round(fs * 0.8)}px;color:${colors.textMuted};line-height:1.6;margin-top:${Math.round(fs * 0.4)}px;">${renderInline(e.content)}</div>`)
    .join('')

  return `
    <div style="padding:${pad}px;height:100%;box-sizing:border-box;display:flex;flex-direction:column;">
      ${headingHtml}
      <div style="flex:1;overflow:hidden;">
        ${steps}
        ${extraParas}
      </div>
    </div>`
  // suppress unused warning
  void railLeft
}

/** 文字强调模板 — 大字引用 + 装饰 */
function renderTemplateTextHighlight(
  elements: PageElement[], colors: any, config: XhsConfig, _ctx: RenderContext
): string {
  const heading = elements.find(e => e.type === 'heading')
  const quotes = elements.filter(e => e.type === 'blockquote')
  const paras = elements.filter(e => e.type === 'paragraph')
  const fs = config.fontSize
  const pad = config.padding

  const isDark = colors.pageBg.startsWith('#0') || colors.pageBg.startsWith('#1')
  const quoteBg = isDark ? `rgba(255,255,255,0.04)` : `${colors.primary}08`

  const headingHtml = heading
    ? `<div style="font-size:${Math.round(fs * 1.1)}px;font-weight:700;color:${colors.textMuted};margin-bottom:${Math.round(fs * 0.6)}px;text-align:center;letter-spacing:2px;">${renderInline(heading.content)}</div>`
    : ''

  const quotesHtml = quotes.map((q, i) => `
    <div style="background:${quoteBg};border-radius:${Math.round(fs * 0.5)}px;padding:${Math.round(fs * 0.9)}px ${Math.round(fs * 1.1)}px;margin-bottom:${i < quotes.length - 1 ? Math.round(fs * 0.5) : 0}px;position:relative;">
      <div style="position:absolute;top:${Math.round(fs * 0.2)}px;left:${Math.round(fs * 0.4)}px;font-size:${Math.round(fs * 2.5)}px;color:${colors.primary};opacity:0.2;line-height:1;font-family:Georgia,serif;">"</div>
      <div style="font-size:${Math.round(fs * 1.05)}px;color:${colors.text};line-height:1.8;text-align:center;font-weight:500;padding-top:${Math.round(fs * 0.4)}px;">${renderInline(q.content)}</div>
      <div style="width:${Math.round(fs * 1.5)}px;height:3px;background:${colors.primary};margin:${Math.round(fs * 0.5)}px auto 0;border-radius:2px;opacity:0.6;"></div>
    </div>`
  ).join('')

  const parasHtml = paras.map(p =>
    `<div style="font-size:${Math.round(fs * 0.85)}px;color:${colors.textMuted};line-height:1.7;text-align:center;margin-top:${Math.round(fs * 0.4)}px;">${renderInline(p.content)}</div>`
  ).join('')

  return `
    <div style="padding:${pad}px;height:100%;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;">
      ${headingHtml}
      ${quotesHtml}
      ${parasHtml}
    </div>`
}

/** 卡片列表模板 — 标题 + 段落卡片 */
function renderTemplateCardList(
  elements: PageElement[], colors: any, config: XhsConfig, _ctx: RenderContext
): string {
  const heading = elements.find(e => e.type === 'heading')
  const rest = elements.filter(e => e !== heading)
  const fs = config.fontSize
  const pad = config.padding

  const isDark = colors.pageBg.startsWith('#0') || colors.pageBg.startsWith('#1')
  const cardBg = isDark ? `rgba(255,255,255,0.05)` : colors.contentBg
  const cardBorder = isDark ? `rgba(255,255,255,0.08)` : `${colors.primary}20`
  const ACCENT_COLORS = [colors.primary, colors.accent, colors.secondary]

  const headingHtml = heading
    ? `<div style="margin-bottom:${Math.round(fs * 0.8)}px;">
        <div style="font-size:${Math.round(fs * 1.45)}px;font-weight:900;color:${colors.text};line-height:1.25;margin-bottom:${Math.round(fs * 0.25)}px;">${renderInline(heading.content)}</div>
        <div style="width:${Math.round(fs * 2)}px;height:${Math.round(fs * 0.18)}px;background:${colors.primary};border-radius:4px;"></div>
      </div>`
    : ''

  const cards = rest.map((el, i) => {
    const accentColor = ACCENT_COLORS[i % ACCENT_COLORS.length]
    if (el.type === 'paragraph') {
      return `
        <div style="display:flex;gap:${Math.round(fs * 0.45)}px;background:${cardBg};border-radius:${Math.round(fs * 0.4)}px;padding:${Math.round(fs * 0.55)}px ${Math.round(fs * 0.65)}px;border:1px solid ${cardBorder};margin-bottom:${Math.round(fs * 0.3)}px;">
          <div style="width:${Math.round(fs * 0.18)}px;border-radius:4px;background:${accentColor};flex-shrink:0;"></div>
          <div style="font-size:${Math.round(fs * 0.85)}px;color:${colors.text};line-height:1.7;">${renderInline(el.content)}</div>
        </div>`
    } else if (el.type === 'list') {
      const listItems = (el.items ?? []).map((item, j) => `
        <div style="display:flex;align-items:baseline;gap:${Math.round(fs * 0.3)}px;margin-bottom:${Math.round(fs * 0.25)}px;">
          <span style="color:${accentColor};font-size:${Math.round(fs * 0.65)}px;flex-shrink:0;font-weight:700;">${el.ordered ? `${j + 1}.` : '▸'}</span>
          <span style="font-size:${Math.round(fs * 0.82)}px;color:${colors.text};line-height:1.6;">${renderInline(item)}</span>
        </div>`).join('')
      return `<div style="margin-bottom:${Math.round(fs * 0.3)}px;">${listItems}</div>`
    } else if (el.type === 'blockquote') {
      return `
        <div style="border-left:${Math.round(fs * 0.2)}px solid ${accentColor};padding:${Math.round(fs * 0.4)}px ${Math.round(fs * 0.65)}px;background:${accentColor}10;border-radius:0 ${Math.round(fs * 0.3)}px ${Math.round(fs * 0.3)}px 0;margin-bottom:${Math.round(fs * 0.3)}px;">
          <div style="font-size:${Math.round(fs * 0.85)}px;color:${colors.text};line-height:1.7;font-style:italic;">${renderInline(el.content)}</div>
        </div>`
    }
    return ''
  }).join('')

  return `
    <div style="padding:${pad}px;height:100%;box-sizing:border-box;display:flex;flex-direction:column;">
      ${headingHtml}
      <div style="flex:1;overflow:hidden;">${cards}</div>
    </div>`
}

/** V2: 渲染单页小红书 HTML（使用骨架+插槽） */
export function renderXhsPageV2(page: XhsPage, style: StyleComboV2, config: XhsConfig): string {
  const { colors } = style.color
  const typo = style.typography
  const bp = style.blueprint
  const xhs = bp.xhs

  // XHS 平台上下文：传给插槽渲染函数
  const ctx: RenderContext = {
    colors,
    typo: typo.wechat,
    isDark: colors.pageBg.startsWith('#1') || colors.pageBg.startsWith('#0'),
    platform: 'xhs',
    scale: config.fontSize / 16, // ~2x for 32px base
  }

  const bodyFont = typo.xiaohongshu.bodyFont
  const titleFont = typo.xiaohongshu.titleFont

  // 背景样式
  let bgStyle: string
  if (page.type === 'cover' || page.type === 'ending') {
    bgStyle = `background: linear-gradient(160deg, ${colors.pageBg}, ${colors.contentBg});`
  } else {
    const bpStyle = bp.containerStyle({ contentBg: colors.contentBg, text: colors.text, pageBg: colors.pageBg })
    const bgMatch = bpStyle.match(/background[^;]+;/)
    bgStyle = bgMatch ? bgMatch[0] : `background-color: ${colors.pageBg};`
  }

  const containerStyle = `
    width: ${config.width}px; height: ${config.height}px; ${bgStyle}
    padding: ${config.padding}px; box-sizing: border-box;
    font-family: '${bodyFont}', 'PingFang SC', 'Microsoft YaHei', sans-serif;
    font-size: ${config.fontSize}px; line-height: ${config.lineHeight};
    color: ${colors.text}; position: relative; overflow: hidden;
  `

  let content = ''
  const separator = COVER_SEPARATORS[xhs.coverVariant] || '· · ·'

  switch (page.type) {
    case 'cover': {
      const title = page.elements[0]?.content || '无标题'
      const summary = page.elements[1]?.content || ''
      const titleSize = Math.round(config.fontSize * 2.2)
      const subtitleSize = Math.round(config.fontSize * 1.05)
      // 使用骨架 xhs.coverVariant 直接选择
      switch (xhs.coverVariant) {
        case 'bold':
          content = renderCoverBold(title, summary, colors, titleFont, bodyFont, titleSize, subtitleSize, separator, config)
          break
        case 'minimal':
          content = renderCoverMinimal(title, summary, colors, titleFont, bodyFont, titleSize, subtitleSize, config)
          break
        case 'card':
          content = renderCoverCard(title, summary, colors, titleFont, bodyFont, titleSize, subtitleSize, separator, config)
          break
        case 'magazine':
          content = renderCoverMagazine(title, summary, colors, titleFont, bodyFont, titleSize, subtitleSize, separator, config)
          break
        case 'classic':
        default:
          content = renderCoverClassic(title, summary, colors, titleFont, bodyFont, titleSize, subtitleSize, separator, config)
          break
      }
      break
    }
    case 'content': {
      const templateType = page.templateType ?? 'standard'

      if (templateType === 'feature-grid') {
        content = renderTemplateFeatureGrid(page.elements, colors, config, ctx)
      } else if (templateType === 'workflow') {
        content = renderTemplateWorkflow(page.elements, colors, config, ctx)
      } else if (templateType === 'text-highlight') {
        content = renderTemplateTextHighlight(page.elements, colors, config, ctx)
      } else if (templateType === 'card-list') {
        content = renderTemplateCardList(page.elements, colors, config, ctx)
      } else {
        // standard 模式：保留原有骨架布局逻辑
        content += renderV2HeaderBar(colors, config, bp)
        content += renderPageNumber(page, xhs.pageDecoration.pageNumberStyle, colors, config.fontSize)
        let hIdx = 0
        const layout = xhs.contentLayout
        if (layout === 'card-wrapped') {
          for (const el of page.elements) {
            content += `<div style="background:${colors.contentBg};border-radius:12px;padding:16px 20px;margin-bottom:12px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">`
            content += renderElementV2(el, config, style, ctx, hIdx)
            content += `</div>`
            if (el.type === 'heading') hIdx++
          }
        } else if (layout === 'alternating-bg') {
          let elIdx = 0
          for (const el of page.elements) {
            const altBg = elIdx % 2 === 1 ? `background:${colors.secondary};border-radius:8px;padding:12px 16px;margin-bottom:8px;` : `margin-bottom:8px;`
            content += `<div style="${altBg}">`
            content += renderElementV2(el, config, style, ctx, hIdx)
            content += `</div>`
            if (el.type === 'heading') hIdx++
            elIdx++
          }
        } else if (layout === 'timeline-rail') {
          content += `<div style="position:relative;padding-left:36px;">`
          content += `<div style="position:absolute;left:12px;top:0;bottom:0;width:2px;background:${colors.primary}30;"></div>`
          for (const el of page.elements) {
            const isH = el.type === 'heading'
            const dotSize = isH ? 12 : 6
            const dotTop = isH ? 8 : 6
            content += `<div style="position:relative;margin-bottom:8px;">`
            content += `<div style="position:absolute;left:-30px;top:${dotTop}px;width:${dotSize}px;height:${dotSize}px;border-radius:50%;background:${isH ? colors.primary : colors.primary + '50'};"></div>`
            content += renderElementV2(el, config, style, ctx, hIdx)
            content += `</div>`
            if (isH) hIdx++
          }
          content += `</div>`
        } else {
          for (const el of page.elements) {
            content += renderElementV2(el, config, style, ctx, hIdx)
            if (el.type === 'heading') hIdx++
          }
        }
        content += renderV2FooterDecor(colors, config, xhs)
        content += renderV2Brand(colors, config, xhs.pageDecoration.brandPosition)
      }
      break
    }
    case 'ending': {
      content = renderEndingV2(page, style, config, ctx, xhs)
      break
    }
  }

  return `<div style="${containerStyle}">${content}</div>`
}

/** V2 尾页渲染 — 3 种风格 */
function renderEndingV2(page: XhsPage, style: StyleComboV2, config: XhsConfig, ctx: RenderContext, xhs: BlueprintXhsConfig): string {
  const { colors } = style.color
  const titleFont = style.typography.xiaohongshu.titleFont
  const dividerSlot = getSlot('divider', style.slots.divider)
  const centerY = Math.round(config.height * 0.28)

  const ctaButtons = `
    <div style="display:inline-flex;gap:12px;margin-bottom:40px;">
      <span style="background:${colors.primary};color:#fff;padding:10px 24px;border-radius:24px;font-size:${config.fontSize * 0.8}px;font-weight:600;">👍 点赞</span>
      <span style="background:${colors.primary}20;color:${colors.primary};padding:10px 24px;border-radius:24px;font-size:${config.fontSize * 0.8}px;font-weight:600;">⭐ 收藏</span>
      <span style="background:${colors.primary}20;color:${colors.primary};padding:10px 24px;border-radius:24px;font-size:${config.fontSize * 0.8}px;font-weight:600;">🔄 转发</span>
    </div>`

  if (xhs.endingStyle === 'minimal') {
    return `
      <div style="position:absolute;top:50%;left:0;right:0;transform:translateY(-50%);text-align:center;">
        <div style="font-size:${config.fontSize * 2}px;margin-bottom:24px;">✨</div>
        <div style="font-family:'${titleFont}',sans-serif;font-size:${config.fontSize * 1.6}px;font-weight:300;color:${colors.text};margin-bottom:20px;letter-spacing:4px;">感谢阅读</div>
        <div style="width:40px;height:1px;background:${colors.primary};margin:0 auto 24px;opacity:0.4;"></div>
        ${ctaButtons}
        <div style="font-size:${config.fontSize * 0.6}px;color:${colors.textMuted};letter-spacing:2px;">本文共 ${page.totalPages} 页</div>
      </div>
      <div style="position:absolute;bottom:${config.padding}px;left:0;right:0;text-align:center;color:${colors.textMuted};font-size:${config.fontSize * 0.5}px;letter-spacing:3px;opacity:0.4;">YUNTYPE</div>
    `
  }

  if (xhs.endingStyle === 'card') {
    const cardPad = config.padding * 1.5
    return `
      <div style="position:absolute;top:50%;left:${cardPad}px;right:${cardPad}px;transform:translateY(-50%);background:${colors.contentBg};border-radius:20px;padding:${config.padding * 1.5}px;box-shadow:0 8px 40px rgba(0,0,0,0.08);text-align:center;">
        <div style="font-size:${config.fontSize * 2}px;margin-bottom:20px;">✨</div>
        <div style="font-family:'${titleFont}',sans-serif;font-size:${config.fontSize * 1.6}px;font-weight:800;color:${colors.text};margin-bottom:12px;letter-spacing:2px;">感谢阅读</div>
        <div style="font-size:${config.fontSize * 0.7}px;color:${colors.textMuted};margin-bottom:28px;">Thank you for reading</div>
        ${ctaButtons}
        <div style="font-size:${config.fontSize * 0.6}px;color:${colors.textMuted};line-height:2;">本文共 ${page.totalPages} 页 · 关注获取更多内容</div>
      </div>
      <div style="position:absolute;bottom:${config.padding}px;left:0;right:0;text-align:center;color:${colors.textMuted};font-size:${config.fontSize * 0.5}px;letter-spacing:1px;">云中书 · YunType</div>
    `
  }

  // standard ending
  return `
    <div style="position:absolute;top:${config.padding}px;left:${config.padding}px;right:${config.padding}px;">${dividerSlot.render(ctx)}</div>
    <div style="position:absolute;top:${Math.round(config.height * 0.15)}px;left:50%;transform:translateX(-50%);width:${Math.round(config.width * 0.4)}px;height:${Math.round(config.width * 0.4)}px;border-radius:50%;background:${colors.primary};opacity:0.04;"></div>
    <div style="position:absolute;top:${centerY}px;left:0;right:0;text-align:center;">
      <div style="font-size:${config.fontSize * 2.5}px;margin-bottom:24px;">✨</div>
      <div style="font-family:'${titleFont}',sans-serif;font-size:${config.fontSize * 1.8}px;font-weight:800;color:${colors.text};margin-bottom:16px;letter-spacing:2px;">感谢阅读</div>
      <div style="font-size:${config.fontSize * 0.75}px;color:${colors.textMuted};margin-bottom:36px;letter-spacing:1px;">Thank you for reading</div>
      ${ctaButtons}
      <div style="font-size:${config.fontSize * 0.7}px;color:${colors.textMuted};line-height:2;">本文共 ${page.totalPages} 页 · 关注获取更多内容</div>
    </div>
    <div style="position:absolute;bottom:${config.padding * 1.5}px;left:${config.padding}px;right:${config.padding}px;text-align:center;">
      ${dividerSlot.render(ctx)}
      <div style="color:${colors.textMuted};font-size:${config.fontSize * 0.6}px;letter-spacing:2px;margin-top:12px;">Powered by 云中书 YunType</div>
    </div>
  `
}

/** V2 元素渲染 — 使用插槽 */
function renderElementV2(el: PageElement, config: XhsConfig, style: StyleComboV2, ctx: RenderContext, _hIdx: number): string {
  const { slots } = style

  switch (el.type) {
    case 'heading': {
      const slot = getSlot('title', slots.title)
      return `<div style="margin:16px 0 8px;">${slot.render(renderInline(el.content), el.level || 2, ctx, _hIdx)}</div>`
    }
    case 'paragraph': {
      const slot = getSlot('paragraph', slots.paragraph)
      return slot.render(renderInline(el.content), ctx, _hIdx === 0)
    }
    case 'blockquote': {
      const slot = getSlot('quote', slots.quote)
      return slot.render(renderInline(el.content), ctx)
    }
    case 'list': {
      const slot = getSlot('list', slots.list)
      return slot.render(el.items || [], el.ordered || false, ctx)
    }
    case 'hr': {
      const slot = getSlot('divider', slots.divider)
      return slot.render(ctx)
    }
    case 'code':
      return `<div style="margin:16px 0;padding:16px;background:${ctx.colors.contentBg};border:1px solid ${ctx.colors.primary}20;border-radius:8px;font-family:'JetBrains Mono','Fira Code',monospace;font-size:${Math.round(config.fontSize * 0.75)}px;line-height:1.5;color:${ctx.colors.text};white-space:pre-wrap;word-break:break-all;">${el.content.replace(/</g, '<').replace(/>/g, '>')}</div>`
    case 'table':
      return renderTableV2(el, ctx, config)
    default:
      return ''
  }
}

// ═══════════════════════════════════════
//  表格渲染
// ═══════════════════════════════════════

/** 表格渲染（使用 RenderContext 缩放） */
function renderTableV2(el: PageElement, ctx: RenderContext, _config: XhsConfig): string {
  const headers = el.headers || []
  const rows = el.rows || []
  if (headers.length === 0) return ''

  const { colors } = ctx
  const scale = ctx.scale ?? 1
  const colCount = headers.length
  const cellPad = Math.round(8 * scale)
  const fs = Math.round(14 * scale)
  const headerFs = Math.round(15 * scale)
  const radius = Math.round(12 * scale)

  const headerCells = headers.map(h =>
    `<td style="padding:${cellPad}px ${Math.round(10*scale)}px;font-size:${headerFs}px;font-weight:700;color:#fff;text-align:center;width:${100/colCount}%;word-break:break-all;line-height:1.4;">${renderInline(h)}</td>`
  ).join('')

  const dataRows = rows.map((row, ri) => {
    const bg = ri % 2 === 0 ? colors.pageBg : `${colors.primary}0a`
    const cells = headers.map((_, ci) => {
      const cell = row[ci] || ''
      return `<td style="padding:${cellPad}px ${Math.round(10*scale)}px;font-size:${fs}px;color:${colors.text};text-align:center;border-bottom:1px solid ${colors.primary}18;word-break:break-all;line-height:1.5;">${renderInline(cell)}</td>`
    }).join('')
    return `<tr style="background:${bg};">${cells}</tr>`
  }).join('')

  return `
    <div style="margin:${Math.round(12*scale)}px 0;border-radius:${radius}px;overflow:hidden;border:${Math.round(1.5*scale)}px solid ${colors.primary}25;">
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:${colors.primary};">${headerCells}</tr>
        </thead>
        <tbody>${dataRows}</tbody>
      </table>
    </div>
  `
}

// 小红书图片组渲染器 — 分页算法 + HTML生成

import { parseMarkdown, renderInline, type MarkdownNode } from './markdown'
import type { StyleComboV2 } from '../atoms'
import { getSlot, type RenderContext } from '../atoms/slots'
import type { BlueprintXhsConfig, ContentLayoutType } from '../atoms/blueprints'
import { renderPageWithOrchestrator } from './xhs-orchestrator'
import {
  renderCoverClassic, renderCoverBold, renderCoverMinimal,
  renderCoverCard, renderCoverMagazine, COVER_SEPARATORS,
} from './xhs-covers'
export {
  renderPageNumber, renderV2HeaderBar, renderV2FooterDecor, renderV2Brand,
  renderPageDecorations, renderPageTopBar, renderPageBottomBar,
  renderTemplateFeatureGrid, renderTemplateWorkflow,
  renderTemplateTextHighlight, renderTemplateCardList,
} from './xhs-page-chrome'

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
  '3:4': { width: 1080, height: 1440, padding: 48, fontSize: 36, lineHeight: 1.8 },
  '16:9': { width: 1920, height: 1080, padding: 64, fontSize: 34, lineHeight: 1.8 },
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

  // 卡片列表：有标题 + 段落
  if (headings.length >= 1 && paragraphs.length >= 1 && lists.length === 0 && blockquotes.length === 0) {
    return 'card-list'
  }

  // 纯段落（无标题）：也用卡片列表，让每段独立成卡片
  if (paragraphs.length >= 1 && headings.length === 0 && lists.length === 0 && blockquotes.length === 0) {
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
    const headingEl = allEls[0]?.type === 'heading' ? allEls[0] : null

    // 无标题节：每页最多 3 个元素（保证手机可读性）
    // 有标题节：按高度切割
    const maxElsPerPage = headingEl ? 999 : 3

    const flushBatch = (batch: PageElement[]) => {
      if (batch.length === 0) return
      pages.push({
        type: 'content',
        elements: batch,
        pageIndex: pages.length,
        totalPages: 0,
        templateType: planPageTemplate(batch),
      })
    }

    let batch: PageElement[] = []
    let batchH = 0

    for (const el of allEls) {
      const heightFull = batchH + el.estimatedHeight > availableHeight
      const countFull = batch.length >= maxElsPerPage
      if ((heightFull || countFull) && batch.length > 0) {
        flushBatch([...batch])
        // 续页：有标题节则顶部带上 heading
        batch = headingEl && el !== headingEl ? [headingEl, el] : [el]
        batchH = batch.reduce((s, e) => s + e.estimatedHeight, 0)
      } else {
        batch.push(el)
        batchH += el.estimatedHeight
      }
    }
    flushBatch(batch)
  }

  // ── 尾页 ─────────────────────────────────────
  pages.push({ type: 'ending', elements: [], pageIndex: pages.length, totalPages: 0 })

  const total = pages.length
  pages.forEach((p, i) => { p.pageIndex = i; p.totalPages = total })

  return pages
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

  // 背景样式：所有页面使用微妙渐变
  let bgStyle: string
  if (page.type === 'cover') {
    bgStyle = `background: linear-gradient(160deg, ${colors.pageBg} 0%, ${colors.contentBg} 70%, ${colors.pageBg} 100%);`
  } else if (page.type === 'ending') {
    bgStyle = `background: linear-gradient(160deg, ${colors.pageBg}, ${colors.contentBg});`
  } else {
    // 内容页：从 pageBg 淡入到略带主题色
    bgStyle = `background: linear-gradient(165deg, ${colors.pageBg} 0%, ${colors.pageBg} 60%, ${colors.primary}08 100%);`
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
      // 标题字号按长度自适应，避免长标题撑爆页面
      const titleLen = title.length
      const titleMult = titleLen <= 10 ? 2.2 : titleLen <= 18 ? 1.8 : titleLen <= 28 ? 1.4 : 1.1
      const titleSize = Math.round(config.fontSize * titleMult)
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
      // ─── 新版：走块编排器（orchestrator） ───
      // 骨架决定 block variant 组合；装饰/顶栏/底栏由编排器处理。
      // 外层容器仍由本函数包裹（统一字体、比例、背景渐变）。
      return renderPageWithOrchestrator({ page, config, combo: style, blueprint: bp })
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
export function renderElementV2(el: PageElement, config: XhsConfig, style: StyleComboV2, ctx: RenderContext, _hIdx: number): string {
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

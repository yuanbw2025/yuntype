// 小红书图片组渲染器 — 分页算法 + HTML生成

import { parseMarkdown, renderInline, type MarkdownNode } from './markdown'
import type { StyleCombo } from '../atoms'

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

export interface XhsPage {
  type: 'cover' | 'content' | 'ending'
  elements: PageElement[]
  pageIndex: number
  totalPages: number
}

export interface PageElement {
  type: 'heading' | 'paragraph' | 'list' | 'blockquote' | 'code' | 'hr'
  content: string
  level?: number
  items?: string[]
  ordered?: boolean
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

function estimateElementHeight(node: MarkdownNode, config: XhsConfig): number {
  const contentWidth = config.width - config.padding * 2
  const { fontSize, lineHeight } = config

  switch (node.type) {
    case 'heading': {
      const hSize = node.level === 1 ? fontSize * 1.6 : node.level === 2 ? fontSize * 1.3 : fontSize * 1.1
      return estimateTextHeight(node.text || '', hSize, lineHeight, contentWidth) + 40
    }
    case 'paragraph':
      return estimateTextHeight(node.text || '', fontSize, lineHeight, contentWidth) + 20
    case 'blockquote':
      return estimateTextHeight(node.text || '', fontSize * 0.95, lineHeight, contentWidth - 40) + 48
    case 'list': {
      const itemHeights = (node.children || []).reduce((sum, item) => {
        return sum + estimateTextHeight(item, fontSize, lineHeight, contentWidth - 36) + 8
      }, 0)
      return itemHeights + 24
    }
    case 'code':
      return estimateTextHeight(node.text || '', fontSize * 0.8, 1.5, contentWidth - 40) + 40
    case 'hr':
      return 40
    default:
      return 60
  }
}

// ═══════════════════════════════════════
//  分页算法
// ═══════════════════════════════════════

function nodeToPageElement(node: MarkdownNode, config: XhsConfig): PageElement {
  return {
    type: node.type === 'image' ? 'paragraph' : node.type as PageElement['type'],
    content: node.text || (node.type === 'image' ? `[图片: ${node.alt || ''}]` : ''),
    level: node.level,
    items: node.children,
    ordered: node.ordered,
    estimatedHeight: estimateElementHeight(node, config),
  }
}

export function splitToPages(markdown: string, config: XhsConfig): XhsPage[] {
  const nodes = parseMarkdown(markdown)
  if (nodes.length === 0) return []

  const pages: XhsPage[] = []
  const availableHeight = config.height - config.padding * 2 - 100 // 页码+装饰区域

  // 提取标题和摘要作为封面
  let titleText = '无标题'
  let summaryText = ''
  let contentStartIdx = 0

  if (nodes[0]?.type === 'heading' && nodes[0].level === 1) {
    titleText = nodes[0].text || '无标题'
    contentStartIdx = 1
    // 找第一个段落作为摘要
    if (nodes[1]?.type === 'paragraph') {
      summaryText = nodes[1].text || ''
      contentStartIdx = 2
    }
  } else if (nodes[0]?.type === 'paragraph') {
    titleText = nodes[0].text || '无标题'
    contentStartIdx = 1
  }

  // 封面页
  pages.push({
    type: 'cover',
    elements: [{
      type: 'heading',
      content: titleText,
      level: 1,
      estimatedHeight: 0,
    }, ...(summaryText ? [{
      type: 'paragraph' as const,
      content: summaryText,
      estimatedHeight: 0,
    }] : [])],
    pageIndex: 0,
    totalPages: 0, // 后面再填
  })

  // 内容页
  let currentElements: PageElement[] = []
  let currentHeight = 0

  for (let i = contentStartIdx; i < nodes.length; i++) {
    const element = nodeToPageElement(nodes[i], config)

    if (currentHeight + element.estimatedHeight > availableHeight && currentElements.length > 0) {
      pages.push({
        type: 'content',
        elements: currentElements,
        pageIndex: pages.length,
        totalPages: 0,
      })
      currentElements = [element]
      currentHeight = element.estimatedHeight
    } else {
      currentElements.push(element)
      currentHeight += element.estimatedHeight
    }
  }

  if (currentElements.length > 0) {
    pages.push({
      type: 'content',
      elements: currentElements,
      pageIndex: pages.length,
      totalPages: 0,
    })
  }

  // 尾页
  pages.push({
    type: 'ending',
    elements: [],
    pageIndex: pages.length,
    totalPages: 0,
  })

  // 填入总页数
  const total = pages.length
  pages.forEach((p, i) => {
    p.pageIndex = i
    p.totalPages = total
  })

  return pages
}

// ═══════════════════════════════════════
//  HTML 渲染
// ═══════════════════════════════════════

// 根据装饰风格获取分隔符文本
function getSeparatorText(decorationId: string): string {
  const map: Record<string, string> = {
    S1: '──────────────',
    S2: '■ ■ ■ ■ ■',
    S3: '· · · · ·',
    S4: '◇ ◇ ◇',
  }
  return map[decorationId] || '· · ·'
}

/** 渲染单页小红书 HTML */
export function renderXhsPageHTML(page: XhsPage, style: StyleCombo, config: XhsConfig): string {
  const { colors } = style.color
  const { decoration } = style
  const typo = style.typography

  const bgStyle = getBgStyle(colors, page.type)
  const titleFont = typo.xiaohongshu.titleFont
  const bodyFont = typo.xiaohongshu.bodyFont

  const containerStyle = `
    width: ${config.width}px;
    height: ${config.height}px;
    ${bgStyle}
    padding: ${config.padding}px;
    box-sizing: border-box;
    font-family: '${bodyFont}', 'PingFang SC', 'Microsoft YaHei', sans-serif;
    font-size: ${config.fontSize}px;
    line-height: ${config.lineHeight};
    color: ${colors.text};
    position: relative;
    overflow: hidden;
  `

  let content = ''

  switch (page.type) {
    case 'cover':
      content = renderCoverPage(page, colors, titleFont, bodyFont, getSeparatorText(decoration.id), config, decoration.id)
      break
    case 'content':
      content = renderContentPage(page, colors, titleFont, bodyFont, config)
      break
    case 'ending':
      content = renderEndingPage(page, colors, titleFont, getSeparatorText(decoration.id), config)
      break
  }

  return `<div style="${containerStyle}">${content}</div>`
}

function getBgStyle(colors: StyleCombo['color']['colors'], pageType: string): string {
  if (pageType === 'cover' || pageType === 'ending') {
    // 封面/尾页使用渐变背景
    return `background: linear-gradient(160deg, ${colors.pageBg}, ${colors.contentBg});`
  }
  return `background-color: ${colors.pageBg};`
}

// ═══════════════════════════════════════
//  封面变体系统（5种风格）
// ═══════════════════════════════════════

type CoverVariant = 'classic' | 'bold' | 'minimal' | 'card' | 'magazine'

/** 根据装饰ID选择封面变体 */
function getCoverVariant(decorationId: string): CoverVariant {
  const map: Record<string, CoverVariant> = {
    S1: 'classic',
    S2: 'bold',
    S3: 'minimal',
    S4: 'card',
  }
  return map[decorationId] || 'classic'
}

function renderCoverPage(
  page: XhsPage, colors: any, titleFont: string, bodyFont: string,
  separator: string, config: XhsConfig, decorationId?: string
): string {
  const variant = getCoverVariant(decorationId || 'S1')
  const title = page.elements[0]?.content || '无标题'
  const summary = page.elements[1]?.content || ''
  const titleSize = Math.round(config.fontSize * 2.2)
  const subtitleSize = Math.round(config.fontSize * 1.05)

  switch (variant) {
    case 'bold':
      return renderCoverBold(title, summary, colors, titleFont, bodyFont, titleSize, subtitleSize, separator, config)
    case 'minimal':
      return renderCoverMinimal(title, summary, colors, titleFont, bodyFont, titleSize, subtitleSize, config)
    case 'card':
      return renderCoverCard(title, summary, colors, titleFont, bodyFont, titleSize, subtitleSize, separator, config)
    case 'magazine':
      return renderCoverMagazine(title, summary, colors, titleFont, bodyFont, titleSize, subtitleSize, separator, config)
    case 'classic':
    default:
      return renderCoverClassic(title, summary, colors, titleFont, bodyFont, titleSize, subtitleSize, separator, config)
  }
}

/** 变体1: 经典居中 — 上装饰线 + 居中标题 + 摘要 + 底部品牌 */
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

/** 变体2: 大字冲击 — 超大标题 + 色块背景 + 底部摘要 */
function renderCoverBold(
  title: string, summary: string, colors: any, titleFont: string, bodyFont: string,
  titleSize: number, subtitleSize: number, separator: string, config: XhsConfig
): string {
  const bigSize = Math.round(titleSize * 1.3)
  return `
    <!-- 左侧色条 -->
    <div style="position: absolute; top: 0; left: 0; width: 12px; height: 100%; background: ${colors.primary};"></div>
    <!-- 顶部标签 -->
    <div style="position: absolute; top: ${config.padding * 1.2}px; left: ${config.padding * 2}px;">
      <span style="background: ${colors.primary}; color: #fff; padding: 6px 16px; border-radius: 20px;
        font-size: ${config.fontSize * 0.7}px; font-weight: 600; letter-spacing: 1px;">FEATURED</span>
    </div>
    <!-- 超大标题 -->
    <div style="position: absolute; top: ${Math.round(config.height * 0.2)}px; left: ${config.padding * 2}px; right: ${config.padding * 2}px;">
      <h1 style="font-family: '${titleFont}', '${bodyFont}', sans-serif; font-size: ${bigSize}px; font-weight: 900;
        color: ${colors.text}; line-height: 1.2; margin: 0; letter-spacing: -1px;">
        ${renderInline(title)}
      </h1>
    </div>
    <!-- 底部摘要 + 分隔 -->
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

/** 变体3: 极简留白 — 大量空白 + 底部小标题 */
function renderCoverMinimal(
  title: string, summary: string, colors: any, titleFont: string, bodyFont: string,
  titleSize: number, subtitleSize: number, config: XhsConfig
): string {
  return `
    <!-- 居中标题，大量留白 -->
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
    <!-- 底部极简品牌 -->
    <div style="position: absolute; bottom: ${config.padding}px; left: 0; right: 0; text-align: center;">
      <div style="color: ${colors.textMuted}; font-size: ${config.fontSize * 0.6}px; letter-spacing: 3px; opacity: 0.5;">
        YUNTYPE
      </div>
    </div>
  `
}

/** 变体4: 卡片式 — 中央卡片 + 圆角 + 阴影效果 */
function renderCoverCard(
  title: string, summary: string, colors: any, titleFont: string, bodyFont: string,
  titleSize: number, subtitleSize: number, separator: string, config: XhsConfig
): string {
  const cardPad = config.padding * 1.5
  return `
    <!-- 背景装饰圆 -->
    <div style="position: absolute; top: -${config.height * 0.1}px; right: -${config.width * 0.1}px;
      width: ${config.width * 0.5}px; height: ${config.width * 0.5}px;
      border-radius: 50%; background: ${colors.primary}; opacity: 0.06;"></div>
    <div style="position: absolute; bottom: -${config.height * 0.05}px; left: -${config.width * 0.05}px;
      width: ${config.width * 0.3}px; height: ${config.width * 0.3}px;
      border-radius: 50%; background: ${colors.primary}; opacity: 0.04;"></div>
    <!-- 中央卡片 -->
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
    <!-- 底部品牌 -->
    <div style="position: absolute; bottom: ${config.padding}px; left: 0; right: 0; text-align: center;">
      <div style="color: ${colors.textMuted}; font-size: ${config.fontSize * 0.65}px; letter-spacing: 1px;">
        云中书 · YunType
      </div>
    </div>
  `
}

/** 变体5: 杂志风 — 左对齐 + 大号首字 + 竖线装饰 */
function renderCoverMagazine(
  title: string, summary: string, colors: any, titleFont: string, bodyFont: string,
  titleSize: number, subtitleSize: number, separator: string, config: XhsConfig
): string {
  const firstChar = title.charAt(0)
  // restTitle reserved for future use
  return `
    <!-- 顶部横条 -->
    <div style="position: absolute; top: 0; left: 0; right: 0; height: 6px; background: ${colors.primary};"></div>
    <!-- 期刊标识 -->
    <div style="position: absolute; top: ${config.padding * 1.5}px; left: ${config.padding * 1.5}px; right: ${config.padding * 1.5}px;
      display: flex; justify-content: space-between; align-items: center;">
      <span style="font-size: ${config.fontSize * 0.7}px; color: ${colors.textMuted}; letter-spacing: 3px; text-transform: uppercase;">
        YUNTYPE MAGAZINE
      </span>
      <span style="font-size: ${config.fontSize * 0.65}px; color: ${colors.textMuted};">
        ${new Date().toLocaleDateString('zh-CN')}
      </span>
    </div>
    <!-- 大号首字母 + 标题 -->
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
    <!-- 底部 -->
    <div style="position: absolute; bottom: ${config.padding * 1.5}px; left: ${config.padding * 1.5}px; right: ${config.padding * 1.5}px;
      border-top: 1px solid ${colors.primary}30; padding-top: 12px; display: flex; justify-content: space-between;">
      <span style="color: ${colors.textMuted}; font-size: ${config.fontSize * 0.6}px;">${separator}</span>
      <span style="color: ${colors.textMuted}; font-size: ${config.fontSize * 0.6}px;">云中书 YunType</span>
    </div>
  `
}

function renderContentPage(
  page: XhsPage, colors: any, titleFont: string, bodyFont: string, config: XhsConfig
): string {
  const pageNum = `${page.pageIndex + 1} / ${page.totalPages}`

  // 页码
  let html = `
    <div style="
      text-align: right; color: ${colors.textMuted};
      font-size: ${config.fontSize * 0.65}px; margin-bottom: 20px;
      font-family: 'JetBrains Mono', monospace;
    ">${pageNum}</div>
  `

  // 渲染各元素
  for (const el of page.elements) {
    html += renderElement(el, colors, titleFont, bodyFont, config)
  }

  // 底部装饰线
  html += `
    <div style="
      position: absolute; bottom: ${config.padding}px; left: ${config.padding * 2}px; right: ${config.padding * 2}px;
      height: 2px; background: linear-gradient(90deg, transparent, ${colors.primary}40, transparent);
    "></div>
  `

  return html
}

function renderEndingPage(
  page: XhsPage, colors: any, titleFont: string, separator: string, config: XhsConfig
): string {
  const centerY = Math.round(config.height * 0.3)
  const totalPages = page.totalPages

  return `
    <!-- 顶部装饰 -->
    <div style="position: absolute; top: ${config.padding}px; left: 0; right: 0;
      text-align: center; color: ${colors.primary}; font-size: ${config.fontSize * 0.8}px; opacity: 0.5;">
      ${separator}
    </div>

    <!-- 装饰背景圆 -->
    <div style="position: absolute; top: ${Math.round(config.height * 0.15)}px; left: 50%;
      transform: translateX(-50%); width: ${Math.round(config.width * 0.4)}px; height: ${Math.round(config.width * 0.4)}px;
      border-radius: 50%; background: ${colors.primary}; opacity: 0.04;"></div>

    <!-- 主内容 -->
    <div style="position: absolute; top: ${centerY}px; left: 0; right: 0; text-align: center;">
      <div style="font-size: ${config.fontSize * 2.5}px; margin-bottom: 24px;">✨</div>
      <div style="font-family: '${titleFont}', sans-serif; font-size: ${config.fontSize * 1.8}px;
        font-weight: 800; color: ${colors.text}; margin-bottom: 16px; letter-spacing: 2px;">
        感谢阅读
      </div>
      <div style="font-size: ${config.fontSize * 0.75}px; color: ${colors.textMuted}; margin-bottom: 36px; letter-spacing: 1px;">
        Thank you for reading
      </div>

      <!-- CTA 按钮风格 -->
      <div style="display: inline-flex; gap: 12px; margin-bottom: 40px;">
        <span style="background: ${colors.primary}; color: #fff; padding: 10px 24px; border-radius: 24px;
          font-size: ${config.fontSize * 0.8}px; font-weight: 600;">👍 点赞</span>
        <span style="background: ${colors.primary}20; color: ${colors.primary}; padding: 10px 24px; border-radius: 24px;
          font-size: ${config.fontSize * 0.8}px; font-weight: 600;">⭐ 收藏</span>
        <span style="background: ${colors.primary}20; color: ${colors.primary}; padding: 10px 24px; border-radius: 24px;
          font-size: ${config.fontSize * 0.8}px; font-weight: 600;">🔄 转发</span>
      </div>

      <!-- 统计信息 -->
      <div style="font-size: ${config.fontSize * 0.7}px; color: ${colors.textMuted}; line-height: 2;">
        本文共 ${totalPages} 页 · 关注获取更多内容
      </div>
    </div>

    <!-- 底部品牌区 -->
    <div style="position: absolute; bottom: ${config.padding * 1.5}px; left: ${config.padding}px; right: ${config.padding}px; text-align: center;">
      <div style="width: 60px; height: 2px; background: ${colors.primary}; margin: 0 auto 16px; opacity: 0.3;"></div>
      <div style="color: ${colors.primary}; font-size: ${config.fontSize * 0.75}px; opacity: 0.5; margin-bottom: 8px;">
        ${separator}
      </div>
      <div style="color: ${colors.textMuted}; font-size: ${config.fontSize * 0.6}px; letter-spacing: 2px;">
        Powered by 云中书 YunType
      </div>
    </div>
  `
}

function renderElement(
  el: PageElement, colors: any, titleFont: string, bodyFont: string, config: XhsConfig
): string {
  switch (el.type) {
    case 'heading': {
      const sizes = { 1: 1.6, 2: 1.3, 3: 1.1 }
      const scale = sizes[el.level as 1|2|3] || 1.1
      return `
        <div style="
          font-family: '${titleFont}', '${bodyFont}', sans-serif;
          font-size: ${Math.round(config.fontSize * scale)}px;
          font-weight: 700;
          color: ${colors.text};
          margin: 24px 0 12px;
          padding-bottom: 8px;
          border-bottom: 2px solid ${colors.primary}30;
          line-height: 1.5;
        ">${renderInline(el.content)}</div>
      `
    }
    case 'paragraph':
      return `
        <p style="
          font-size: ${config.fontSize}px;
          color: ${colors.text};
          line-height: ${config.lineHeight};
          margin: 0 0 16px;
          text-indent: 2em;
        ">${renderInline(el.content)}</p>
      `
    case 'blockquote':
      return `
        <div style="
          margin: 16px 0;
          padding: 16px 20px;
          background: ${colors.primary}10;
          border-left: 4px solid ${colors.primary};
          border-radius: 0 8px 8px 0;
          font-size: ${Math.round(config.fontSize * 0.95)}px;
          color: ${colors.text};
          line-height: ${config.lineHeight};
        ">${renderInline(el.content)}</div>
      `
    case 'list': {
      const items = (el.items || []).map((item, i) => {
        const marker = el.ordered ? `${i + 1}.` : '•'
        return `
          <div style="
            display: flex; gap: 8px;
            margin-bottom: 8px;
            font-size: ${config.fontSize}px;
            line-height: ${config.lineHeight};
          ">
            <span style="color: ${colors.primary}; font-weight: 700; flex-shrink: 0;">${marker}</span>
            <span style="color: ${colors.text};">${renderInline(item)}</span>
          </div>
        `
      }).join('')
      return `<div style="margin: 12px 0;">${items}</div>`
    }
    case 'code':
      return `
        <div style="
          margin: 16px 0; padding: 16px;
          background: ${colors.contentBg};
          border: 1px solid ${colors.primary}20;
          border-radius: 8px;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: ${Math.round(config.fontSize * 0.75)}px;
          line-height: 1.5;
          color: ${colors.text};
          white-space: pre-wrap;
          word-break: break-all;
        ">${el.content.replace(/</g, '<').replace(/>/g, '>')}</div>
      `
    case 'hr':
      return `
        <div style="
          margin: 20px 0;
          text-align: center;
          color: ${colors.primary};
          font-size: ${config.fontSize * 0.8}px;
          opacity: 0.4;
        ">· · ·</div>
      `
    default:
      return ''
  }
}

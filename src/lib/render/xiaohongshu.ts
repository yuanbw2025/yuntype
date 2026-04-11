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
      content = renderCoverPage(page, colors, titleFont, bodyFont, getSeparatorText(decoration.id), config)
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

function renderCoverPage(
  page: XhsPage, colors: any, titleFont: string, bodyFont: string,
  separator: string, config: XhsConfig
): string {
  const title = page.elements[0]?.content || '无标题'
  const summary = page.elements[1]?.content || ''
  const topY = Math.round(config.height * 0.25)
  const titleSize = Math.round(config.fontSize * 2.2)
  const subtitleSize = Math.round(config.fontSize * 1.05)

  return `
    <!-- 装饰元素 -->
    <div style="
      position: absolute; top: ${config.padding}px; left: ${config.padding}px; right: ${config.padding}px;
      text-align: center; color: ${colors.primary}; font-size: ${config.fontSize * 0.8}px; opacity: 0.6;
    ">${separator}</div>

    <!-- 主内容区 -->
    <div style="
      position: absolute; top: ${topY}px; left: ${config.padding * 1.5}px; right: ${config.padding * 1.5}px;
      text-align: center;
    ">
      <h1 style="
        font-family: '${titleFont}', '${bodyFont}', sans-serif;
        font-size: ${titleSize}px;
        font-weight: 800;
        color: ${colors.text};
        line-height: 1.4;
        margin: 0 0 ${config.padding}px;
        letter-spacing: 2px;
      ">${renderInline(title)}</h1>

      ${summary ? `
        <p style="
          font-size: ${subtitleSize}px;
          color: ${colors.textMuted};
          line-height: 1.7;
          margin: 0;
          padding: 0 20px;
        ">${renderInline(summary)}</p>
      ` : ''}
    </div>

    <!-- 底部信息 -->
    <div style="
      position: absolute; bottom: ${config.padding * 1.5}px; left: 0; right: 0;
      text-align: center;
    ">
      <div style="color: ${colors.primary}; font-size: ${config.fontSize * 0.75}px; opacity: 0.5;">
        ${separator}
      </div>
      <div style="
        color: ${colors.textMuted}; font-size: ${config.fontSize * 0.7}px;
        margin-top: 16px; letter-spacing: 1px;
      ">云中书 · YunType</div>
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
  const centerY = Math.round(config.height * 0.35)

  return `
    <div style="
      position: absolute; top: ${config.padding}px; left: 0; right: 0;
      text-align: center; color: ${colors.primary}; font-size: ${config.fontSize * 0.8}px; opacity: 0.5;
    ">${separator}</div>

    <div style="
      position: absolute; top: ${centerY}px; left: 0; right: 0;
      text-align: center;
    ">
      <div style="font-size: ${config.fontSize * 2}px; margin-bottom: 30px;">✨</div>
      <div style="
        font-family: '${titleFont}', sans-serif;
        font-size: ${config.fontSize * 1.6}px;
        font-weight: 700;
        color: ${colors.text};
        margin-bottom: 24px;
      ">感谢阅读</div>
      <div style="
        font-size: ${config.fontSize * 0.85}px;
        color: ${colors.textMuted};
        line-height: 2;
      ">
        关注获取更多内容<br/>
        <span style="color: ${colors.primary};">点赞 · 收藏 · 转发</span>
      </div>
    </div>

    <div style="
      position: absolute; bottom: ${config.padding * 1.5}px; left: 0; right: 0;
      text-align: center;
    ">
      <div style="color: ${colors.primary}; font-size: ${config.fontSize * 0.75}px; opacity: 0.5;">
        ${separator}
      </div>
      <div style="
        color: ${colors.textMuted}; font-size: ${config.fontSize * 0.65}px;
        margin-top: 12px;
      ">Powered by 云中书 YunType</div>
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

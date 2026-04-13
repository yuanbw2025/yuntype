// 公众号 HTML 渲染器 — 全部内联CSS，微信兼容
// V1: MarkdownNode[] + StyleCombo → HTML
// V2: MarkdownNode[] + StyleComboV2 (骨架+插槽) → HTML

import { parseMarkdown, renderInline, type MarkdownNode } from './markdown'
import { type StyleCombo, type StyleComboV2 } from '../atoms'
import { getSlot, type RenderContext } from '../atoms/slots'

/** 将 Markdown 文本渲染为微信兼容的内联 HTML */
export function renderWechatHTML(markdown: string, style: StyleCombo): string {
  const nodes = parseMarkdown(markdown)
  const { color, layout, decoration, typography } = style
  const c = color.colors
  const p = layout.params
  const typo = typography.wechat

  let html = ''
  let isFirstParagraph = true

  for (const node of nodes) {
    switch (node.type) {
      case 'heading':
        html += renderHeading(node, c, p, decoration, typo)
        break
      case 'paragraph':
        html += renderParagraph(node, c, p, typo, isFirstParagraph && !!p.firstParagraphSize)
        isFirstParagraph = false
        break
      case 'blockquote':
        html += renderBlockquote(node, c, p, decoration, typo)
        break
      case 'list':
        html += renderList(node, c, p, decoration, typo)
        break
      case 'code':
        html += renderCodeBlock(node, c, p, color.category === 'dark')
        break
      case 'hr':
        html += decoration.templates.divider(c.secondary, c.primary)
        break
      case 'image':
        html += renderImage(node)
        break
    }
  }

  // 包裹外层容器
  return `<section style="background-color: ${c.contentBg}; padding: ${p.contentPadding}; max-width: 100%; box-sizing: border-box; color: ${c.text}; font-size: ${p.fontSizeBody}; line-height: ${p.lineHeight}; letter-spacing: ${typo.letterSpacing}; font-weight: ${typo.bodyWeight};">${html}</section>`
}

function renderHeading(
  node: MarkdownNode,
  c: StyleCombo['color']['colors'],
  p: StyleCombo['layout']['params'],
  decoration: StyleCombo['decoration'],
  typo: StyleCombo['typography']['wechat'],
): string {
  const text = renderInline(node.text ?? '')
  const level = node.level ?? 2

  // 字号映射
  const sizeMap: Record<number, string> = {
    1: p.fontSizeH1,
    2: p.fontSizeH2,
    3: p.fontSizeH3,
  }
  const fontSize = sizeMap[level] ?? p.fontSizeH2

  // 用装饰模板渲染 h2 和 h3
  if (level === 2) {
    const decoHtml = decoration.templates.headingDecoH2(text, c.primary, c.secondary)
    return `<section style="margin-top: ${p.headingTopSpacing}; margin-bottom: ${p.paragraphSpacing}; font-size: ${fontSize}; font-weight: ${typo.headingWeight}; color: ${c.primary}; line-height: 1.4;">${decoHtml}</section>`
  }
  if (level === 3) {
    const decoHtml = decoration.templates.headingDecoH3(text, c.primary)
    return `<section style="margin-top: ${p.headingTopSpacing}; margin-bottom: ${p.paragraphSpacing}; font-size: ${fontSize}; font-weight: ${typo.headingWeight}; color: ${c.primary}; line-height: 1.4;">${decoHtml}</section>`
  }

  // h1 不加装饰，直接大标题
  return `<section style="margin-top: ${p.headingTopSpacing}; margin-bottom: ${p.paragraphSpacing}; font-size: ${fontSize}; font-weight: ${typo.headingWeight}; color: ${c.primary}; text-align: center; line-height: 1.3;">${text}</section>`
}

function renderParagraph(
  node: MarkdownNode,
  c: StyleCombo['color']['colors'],
  p: StyleCombo['layout']['params'],
  typo: StyleCombo['typography']['wechat'],
  isFirst: boolean,
): string {
  const text = renderInline(node.text ?? '')
  const fontSize = isFirst ? (p.firstParagraphSize ?? p.fontSizeBody) : p.fontSizeBody
  const indent = p.textIndent ? `text-indent: ${p.textIndent};` : ''

  return `<p style="margin: 0 0 ${p.paragraphSpacing} 0; font-size: ${fontSize}; line-height: ${p.lineHeight}; color: ${c.text}; font-weight: ${typo.bodyWeight}; letter-spacing: ${typo.letterSpacing}; ${indent}">${text}</p>`
}

function renderBlockquote(
  node: MarkdownNode,
  c: StyleCombo['color']['colors'],
  p: StyleCombo['layout']['params'],
  decoration: StyleCombo['decoration'],
  typo: StyleCombo['typography']['wechat'],
): string {
  const text = renderInline(node.text ?? '')

  // 杂志编辑型特殊引用块样式
  const extraStyle = p.blockquoteFontSize
    ? `font-size: ${p.blockquoteFontSize}; text-align: ${p.blockquoteTextAlign ?? 'left'}; font-style: ${p.blockquoteFontStyle ?? 'normal'};`
    : `font-size: ${p.fontSizeBody}; letter-spacing: ${typo.letterSpacing};`

  const innerHtml = decoration.templates.blockquote(text, c.secondary, c.text)

  return `<section style="margin: 0 0 ${p.paragraphSpacing} 0; ${extraStyle}">${innerHtml}</section>`
}

function renderList(
  node: MarkdownNode,
  c: StyleCombo['color']['colors'],
  p: StyleCombo['layout']['params'],
  decoration: StyleCombo['decoration'],
  typo: StyleCombo['typography']['wechat'],
): string {
  const items = node.children ?? []
  const marker = decoration.templates.listMarker(c.primary)
  const ordered = node.ordered ?? false

  const itemsHtml = items.map((item, idx) => {
    const prefix = ordered
      ? `<span style="color: ${c.primary}; font-weight: bold; margin-right: 6px;">${idx + 1}.</span>`
      : `<span style="margin-right: 6px;">${marker}</span>`

    return `<section style="margin-bottom: ${p.listItemSpacing}; display: block; font-size: ${p.fontSizeBody}; line-height: ${p.lineHeight}; color: ${c.text}; font-weight: ${typo.bodyWeight}; letter-spacing: ${typo.letterSpacing};">${prefix}${renderInline(item)}</section>`
  }).join('')

  return `<section style="margin: 0 0 ${p.paragraphSpacing} 0; padding-left: 8px;">${itemsHtml}</section>`
}

function renderCodeBlock(
  node: MarkdownNode,
  _c: StyleCombo['color']['colors'],
  p: StyleCombo['layout']['params'],
  isDark = false,
): string {
  // 代码块用等宽字体 + 浅色背景
  const bgColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'
  const textColor = isDark ? '#C8D0D8' : '#333333'
  const code = (node.text ?? '').replace(/</g, '<').replace(/>/g, '>')

  return `<section style="margin: 0 0 ${p.paragraphSpacing} 0; background: ${bgColor}; padding: 12px 16px; border-radius: 4px; overflow: hidden;"><pre style="margin: 0; white-space: pre-wrap; word-break: break-all; font-size: 13px; line-height: 1.6; color: ${textColor}; font-family: Consolas, Monaco, 'Courier New', monospace;">${code}</pre></section>`
}

function renderImage(node: MarkdownNode): string {
  return `<section style="text-align: center; margin: 16px 0;"><img src="${node.src}" alt="${node.alt ?? ''}" style="max-width: 100%; border-radius: 4px;" /></section>`
}

// ═══════════════════════════════════════════════════════
//  V2 骨架引擎渲染器
// ═══════════════════════════════════════════════════════

interface Section {
  heading: string | null
  headingLevel: number
  nodes: MarkdownNode[]
}

/** 将 AST 按 h2 分组为 Section */
function groupSections(nodes: MarkdownNode[]): Section[] {
  const sections: Section[] = []
  let current: Section = { heading: null, headingLevel: 0, nodes: [] }

  for (const node of nodes) {
    if (node.type === 'heading' && (node.level ?? 3) <= 2) {
      // 保存之前的 section（如果有内容）
      if (current.heading !== null || current.nodes.length > 0) {
        sections.push(current)
      }
      current = {
        heading: node.text ?? '',
        headingLevel: node.level ?? 2,
        nodes: [],
      }
    } else {
      current.nodes.push(node)
    }
  }
  // 最后一组
  if (current.heading !== null || current.nodes.length > 0) {
    sections.push(current)
  }
  return sections
}

/** V2 渲染器 — 使用骨架 + 插槽系统 */
export function renderWechatV2(markdown: string, style: StyleComboV2): string {
  const nodes = parseMarkdown(markdown)
  const { color, typography, blueprint, slots } = style
  const c = color.colors
  const isDark = color.category === 'dark'

  const ctx: RenderContext = {
    colors: c,
    typo: typography.wechat,
    isDark,
  }

  // 获取各插槽渲染函数
  const titleSlot = getSlot('title', slots.title)
  const quoteSlot = getSlot('quote', slots.quote)
  const listSlot = getSlot('list', slots.list)
  const dividerSlot = getSlot('divider', slots.divider)
  const paragraphSlot = getSlot('paragraph', slots.paragraph)
  const sectionSlot = getSlot('section', slots.section)

  // 按 h2 分组
  const sections = groupSections(nodes)

  let headingIndex = 0

  // 渲染每个 section
  const sectionsHtml = sections.map((section, sIdx) => {
    let innerHtml = ''
    let isFirstParagraph = true

    // 渲染 section 标题
    if (section.heading) {
      innerHtml += titleSlot.render(section.heading, section.headingLevel, ctx, headingIndex)
      headingIndex++
    }

    // 渲染 section 内容
    for (const node of section.nodes) {
      switch (node.type) {
        case 'heading':
          innerHtml += titleSlot.render(node.text ?? '', node.level ?? 3, ctx, headingIndex)
          headingIndex++
          break
        case 'paragraph':
          innerHtml += paragraphSlot.render(node.text ?? '', ctx, isFirstParagraph)
          isFirstParagraph = false
          break
        case 'blockquote':
          innerHtml += quoteSlot.render(node.text ?? '', ctx)
          break
        case 'list':
          innerHtml += listSlot.render(node.children ?? [], node.ordered ?? false, ctx)
          break
        case 'code':
          innerHtml += renderCodeBlockV2(node, ctx)
          break
        case 'hr':
          innerHtml += dividerSlot.render(ctx)
          break
        case 'image':
          innerHtml += renderImage(node)
          break
      }
    }

    // 用 section 插槽包裹
    return sectionSlot.render(innerHtml, section.heading, ctx, sIdx)
  }).join('')

  // 用骨架容器包裹
  const containerCss = blueprint.containerStyle(c)
  return `<section style="${containerCss} padding: ${blueprint.contentPadding}; max-width: 100%; box-sizing: border-box; font-size: 15px; line-height: 1.75; letter-spacing: ${typography.wechat.letterSpacing}; font-weight: ${typography.wechat.bodyWeight};">${sectionsHtml}</section>`
}

function renderCodeBlockV2(node: MarkdownNode, ctx: RenderContext): string {
  const bgColor = ctx.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'
  const textColor = ctx.isDark ? '#C8D0D8' : '#333333'
  const code = (node.text ?? '').replace(/</g, '<').replace(/>/g, '>')
  return `<section style="margin: 0 0 16px 0; background: ${bgColor}; padding: 12px 16px; border-radius: 4px; overflow: hidden;"><pre style="margin: 0; white-space: pre-wrap; word-break: break-all; font-size: 13px; line-height: 1.6; color: ${textColor}; font-family: Consolas, Monaco, 'Courier New', monospace;">${code}</pre></section>`
}

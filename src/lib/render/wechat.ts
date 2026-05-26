// 公众号 HTML 渲染器 — 全部内联CSS，微信兼容

import { type MarkdownNode } from './markdown'

function renderImage(node: MarkdownNode): string {
  return `<section style="text-align: center; margin: 16px 0;"><img src="${node.src}" alt="${node.alt ?? ''}" style="max-width: 100%; border-radius: 4px;" /></section>`
}
import { type StyleComboV2 } from '../atoms'
import { getSlot, type RenderContext } from '../atoms/slots'
import { getPlacementAsset, parseAnchoredMarkdown, placementsForAnchor, type MediaAsset, type MediaPlacement } from '../media'

// ═══════════════════════════════════════════════════════
//  V2 骨架引擎渲染器
// ═══════════════════════════════════════════════════════

interface Section {
  heading: string | null
  headingLevel: number
  headingAnchorIndex: number | null
  nodes: AnchoredWechatNode[]
}

interface AnchoredWechatNode extends MarkdownNode {
  anchorIndex: number
}

export interface MediaRenderPlan {
  assets: MediaAsset[]
  placements: MediaPlacement[]
}

/** 将 AST 按 h2 分组为 Section */
function groupSections(nodes: AnchoredWechatNode[]): Section[] {
  const sections: Section[] = []
  let current: Section = { heading: null, headingLevel: 0, headingAnchorIndex: null, nodes: [] }

  for (const node of nodes) {
    if (node.type === 'heading' && (node.level ?? 3) <= 2) {
      // 保存之前的 section（如果有内容）
      if (current.heading !== null || current.nodes.length > 0) {
        sections.push(current)
      }
      current = {
        heading: node.text ?? '',
        headingLevel: node.level ?? 2,
        headingAnchorIndex: node.anchorIndex,
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
export function renderWechatV2(markdown: string, style: StyleComboV2, media?: MediaRenderPlan): string {
  const nodes = parseAnchoredMarkdown(markdown)
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

    const renderMedia = (anchorIndex: number, position: 'before' | 'after') =>
      renderMediaPlacements(anchorIndex, position, media, ctx)

    // 渲染 section 标题
    if (section.heading) {
      if (section.headingAnchorIndex !== null) {
        innerHtml += renderMedia(section.headingAnchorIndex, 'before')
      }
      innerHtml += titleSlot.render(section.heading, section.headingLevel, ctx, headingIndex)
      headingIndex++
      if (section.headingAnchorIndex !== null) {
        innerHtml += renderMedia(section.headingAnchorIndex, 'after')
      }
    }

    // 渲染 section 内容
    for (const node of section.nodes) {
      innerHtml += renderMedia(node.anchorIndex, 'before')
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
      innerHtml += renderMedia(node.anchorIndex, 'after')
    }

    // 用 section 插槽包裹
    return sectionSlot.render(innerHtml, section.heading, ctx, sIdx)
  }).join('')

  // 用骨架容器包裹
  const containerCss = blueprint.containerStyle(c)
  return `<section style="${containerCss} padding: ${blueprint.contentPadding}; max-width: 100%; box-sizing: border-box; font-size: 15px; line-height: 1.75; letter-spacing: ${typography.wechat.letterSpacing}; font-weight: ${typography.wechat.bodyWeight};">${sectionsHtml}</section>`
}

function renderMediaPlacements(
  anchorIndex: number,
  position: 'before' | 'after',
  media: MediaRenderPlan | undefined,
  ctx: RenderContext,
): string {
  if (!media) return ''
  return placementsForAnchor(media.placements, 'wechat', anchorIndex, position)
    .map(placement => {
      const asset = getPlacementAsset(media.assets, placement)
      if (!asset) return ''
      const caption = placement.caption ?? asset.caption
      const radius = placement.layout === 'card' ? 12 : 6
      const cardStyle = placement.layout === 'card'
        ? `background:${ctx.colors.contentBg};padding:10px;border:1px solid ${ctx.colors.primary}20;border-radius:${radius}px;box-shadow:0 4px 18px rgba(0,0,0,0.06);`
        : ''
      return `
        <section style="margin:18px 0;text-align:center;${cardStyle}">
          <img src="${asset.url}" alt="${caption ?? asset.name}" style="max-width:100%;display:block;margin:0 auto;border-radius:${radius}px;" />
          ${caption ? `<p style="margin:8px 0 0;font-size:12px;line-height:1.5;color:${ctx.colors.textMuted};">${caption}</p>` : ''}
        </section>`
    })
    .join('')
}

function renderCodeBlockV2(node: MarkdownNode, ctx: RenderContext): string {
  const bgColor = ctx.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'
  const textColor = ctx.isDark ? '#C8D0D8' : '#333333'
  const code = (node.text ?? '').replace(/</g, '<').replace(/>/g, '>')
  return `<section style="margin: 0 0 16px 0; background: ${bgColor}; padding: 12px 16px; border-radius: 4px; overflow: hidden;"><pre style="margin: 0; white-space: pre-wrap; word-break: break-all; font-size: 13px; line-height: 1.6; color: ${textColor}; font-family: Consolas, Monaco, 'Courier New', monospace;">${code}</pre></section>`
}

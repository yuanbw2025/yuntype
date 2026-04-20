// XHS 插槽式布局编排器 — 骨架 → block variant 分派
//
// 说明：本文件不修改 xiaohongshu.ts 的默认渲染路径，供后续迁移调用。
// 入口：renderPageWithOrchestrator(input)

import type { StyleComboV2 } from '../atoms'
import type { Blueprint } from '../atoms/blueprints'
import { renderInline } from './markdown'
import type { XhsPage, XhsConfig, PageElement } from './xiaohongshu'
import {
  blockRegistry,
  DEFAULT_VARIANTS,
  decoratorVariants,
  renderTopBar,
  renderBottomBar,
} from './xhs-blocks'
import type {
  BlockContext,
  BlueprintVariantMap,
  ListData,
  ParagraphData,
  QuoteData,
  TitleData,
} from './xhs-blocks/types'

// ═══════════════════════════════════════
//  骨架 → variant 映射
// ═══════════════════════════════════════

const BLUEPRINT_VARIANT_MAP: Record<string, BlueprintVariantMap> = {
  // ── 极简系 ──
  B01: { title: 'plain',          paragraph: 'plain-text',  list: 'timeline-rail',  quote: 'left-bar',   decorator: 'dot-pattern' },
  B02: { title: 'plain',          paragraph: 'plain-text',  list: 'timeline-rail',  quote: 'big-quotes', decorator: 'dot-pattern' },
  // ── 线条系 ──
  B03: { title: 'left-bar',       paragraph: 'plain-text',  list: 'timeline-rail',  quote: 'left-bar',   decorator: 'edge-strip' },
  B04: { title: 'gradient-box',   paragraph: 'quote-frame', list: 'icon-grid',      quote: 'left-bar',   decorator: 'edge-strip' },
  // ── 色块系 ──
  B05: { title: 'gradient-box',   paragraph: 'card-wrap',   list: 'icon-grid',      quote: 'big-quotes', decorator: 'corner-circles' },
  B06: { title: 'left-bar',       paragraph: 'card-wrap',   list: 'bubble-flow',    quote: 'big-quotes', decorator: 'corner-circles' },
  // ── 卡片系 ──
  B07: { title: 'left-bar',       paragraph: 'card-wrap',   list: 'numbered-cards', quote: 'left-bar',   decorator: 'corner-circles' },
  B08: { title: 'numbered-badge', paragraph: 'quote-frame', list: 'bubble-flow',    quote: 'big-quotes', decorator: 'corner-circles' },
  // ── 杂志系 ──
  B09: { title: 'gradient-box',   paragraph: 'quote-frame', list: 'numbered-cards', quote: 'big-quotes', decorator: 'edge-strip' },
  B10: { title: 'plain',          paragraph: 'quote-frame', list: 'icon-grid',      quote: 'big-quotes', decorator: 'dot-pattern' },
  // ── 结构系 ──
  B11: { title: 'numbered-badge', paragraph: 'plain-text',  list: 'numbered-cards', quote: 'left-bar',   decorator: 'edge-strip' },
  B12: { title: 'left-bar',       paragraph: 'plain-text',  list: 'timeline-rail',  quote: 'left-bar',   decorator: 'edge-strip' },
  // ── 文学系 ──
  B13: { title: 'plain',          paragraph: 'quote-frame', list: 'timeline-rail',  quote: 'big-quotes', decorator: 'dot-pattern' },
  // ── 商务系 ──
  B14: { title: 'left-bar',       paragraph: 'card-wrap',   list: 'icon-grid',      quote: 'left-bar',   decorator: 'edge-strip' },
  // ── 几何系 ──
  B15: { title: 'gradient-box',   paragraph: 'card-wrap',   list: 'icon-grid',      quote: 'big-quotes', decorator: 'corner-circles' },
}

/** fallback → B07 */
function getVariantMap(bpId: string): BlueprintVariantMap {
  return BLUEPRINT_VARIANT_MAP[bpId] ?? BLUEPRINT_VARIANT_MAP.B07
}

// ═══════════════════════════════════════
//  公共 API
// ═══════════════════════════════════════

export interface OrchestratorInput {
  page: XhsPage
  config: XhsConfig
  combo: StyleComboV2
  blueprint: Blueprint
}

export function renderPageWithOrchestrator(input: OrchestratorInput): string {
  const { page, config, combo, blueprint } = input
  const variants = getVariantMap(blueprint.id)
  const ctx: BlockContext = {
    colors: combo.color.colors,
    config,
    xhs: blueprint.xhs,
    pageIndex: page.pageIndex,
    totalPages: page.totalPages,
    pageType: page.type,
  }

  // ── 元素分派 ──
  const contentHtml = page.elements
    .map((el, i) => renderElement(el, i, ctx, variants))
    .filter(Boolean)
    .join('\n')

  // ── 装饰层 ──
  const decorFn = decoratorVariants[variants.decorator] ?? decoratorVariants['corner-circles']
  const decorHtml = decorFn(ctx)
  const topBar = renderTopBar(ctx)
  const bottomBar = renderBottomBar(ctx)

  // ── 容器 ──
  const pageBg = ctx.colors.pageBg
  const padding = config.padding
  return `
    <div style="position:relative;width:${config.width}px;height:${config.height}px;background-color:${pageBg};overflow:hidden;box-sizing:border-box;">
      ${decorHtml}
      <div style="position:relative;z-index:1;width:100%;height:100%;padding:${padding}px;box-sizing:border-box;display:flex;flex-direction:column;">
        ${topBar}
        <div style="flex:1;display:flex;flex-direction:column;gap:4px;min-height:0;">
          ${contentHtml}
        </div>
        ${bottomBar}
      </div>
    </div>`
}

// ═══════════════════════════════════════
//  元素 → block 分派
// ═══════════════════════════════════════

function renderElement(
  el: PageElement,
  index: number,
  ctx: BlockContext,
  variants: BlueprintVariantMap,
): string {
  switch (el.type) {
    case 'heading': {
      const vid = variants.title
      const fn = blockRegistry.title[vid] ?? blockRegistry.title[DEFAULT_VARIANTS.title]
      const data: TitleData = {
        text: el.content,
        level: el.level ?? 2,
        index: index + 1,
      }
      return fn(ctx, data)
    }

    case 'paragraph': {
      const vid = variants.paragraph
      const fn = blockRegistry.paragraph[vid] ?? blockRegistry.paragraph[DEFAULT_VARIANTS.paragraph]
      const data: ParagraphData = { text: renderInline(el.content) }
      return fn(ctx, data)
    }

    case 'list': {
      const vid = variants.list
      const fn = blockRegistry.list[vid] ?? blockRegistry.list[DEFAULT_VARIANTS.list]
      const data: ListData = {
        items: (el.items ?? []).map(renderInline),
        ordered: !!el.ordered,
      }
      return fn(ctx, data)
    }

    case 'blockquote': {
      const vid = variants.quote
      const fn = blockRegistry.quote[vid] ?? blockRegistry.quote[DEFAULT_VARIANTS.quote]
      const data: QuoteData = { text: renderInline(el.content) }
      return fn(ctx, data)
    }

    // 其他暂不支持的类型降级为段落
    case 'code':
    case 'hr':
    case 'table':
    default: {
      if (!el.content) return ''
      const fn = blockRegistry.paragraph['plain-text']
      return fn(ctx, { text: renderInline(el.content) })
    }
  }
}

// ═══════════════════════════════════════
//  __demoRender — 内部手动验证用
// ═══════════════════════════════════════

/** 生成一段硬编码 mock 页面的 HTML，便于浏览器里肉眼验证 */
export function __demoRender(blueprintId: 'B07' | 'B08' | 'B11' = 'B07'): string {
  const config: XhsConfig = {
    width: 1080, height: 1440, padding: 48, fontSize: 36, lineHeight: 1.8,
  }
  const mockColors = {
    pageBg: '#FAF6F1', contentBg: '#FFFFFF',
    primary: '#C8A882', secondary: '#E8D5C0',
    accent: '#8B6914', text: '#4A3F35', textMuted: '#8C7B6B',
  }
  const mockBp: Blueprint = {
    id: blueprintId, name: 'demo', desc: '', icon: '🧪',
    defaultSlots: {
      title: 'plain', quote: 'left-bar', list: 'dot',
      divider: 'thin-line', paragraph: 'compact', section: 'flat-flow',
    },
    containerStyle: () => '',
    contentPadding: '16px 20px',
    tags: [],
    xhs: {
      coverVariant: 'classic',
      contentLayout: 'standard',
      pageDecoration: { headerBar: true, footerLine: true, pageNumberStyle: 'fraction', brandPosition: 'bottom-center' },
      endingStyle: 'standard',
    },
  }
  const combo = {
    color: { id: 'L1', name: 'demo', category: 'light' as const, colors: mockColors, tags: [] },
    typography: { id: 'F1' } as StyleComboV2['typography'],
    blueprint: mockBp,
    slots: mockBp.defaultSlots,
  }
  const page: XhsPage = {
    type: 'content',
    pageIndex: 2,
    totalPages: 6,
    elements: [
      { type: 'heading', level: 2, content: '为什么写作能让人更清晰', estimatedHeight: 0 },
      { type: 'paragraph', content: '写作是思考的外化。当你把模糊的想法落到文字上，问题的棱角就清晰起来。', estimatedHeight: 0 },
      { type: 'list', ordered: true, items: [
        '先写出脑子里最乱的那一句',
        '然后追问这句话背后的前提',
        '最后用反例检验这个前提',
      ], content: '', estimatedHeight: 0 },
      { type: 'blockquote', content: '思考是与自己的对话。——汉娜·阿伦特', estimatedHeight: 0 },
    ],
  }
  return renderPageWithOrchestrator({ page, config, combo, blueprint: mockBp })
}

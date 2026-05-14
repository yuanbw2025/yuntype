import { renderInline } from './markdown'
import type { XhsConfig, XhsPage, PageElement } from './xiaohongshu'
import type { StyleComboV2 } from '../atoms'
import type { RenderContext } from '../atoms/slots'
import type { BlueprintXhsConfig } from '../atoms/blueprints'
import type { ColorScheme } from '../atoms/colors'

type Colors = ColorScheme['colors']

export function renderPageNumber(page: XhsPage, style: 'right' | 'center' | 'fraction' | 'dot', colors: Colors, fontSize: number): string {
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

export function renderV2HeaderBar(colors: Colors, config: XhsConfig, bp: StyleComboV2['blueprint']): string {
  const xhs = bp.xhs
  if (!xhs.pageDecoration.headerBar) return ''
  if (bp.tags.includes('magazine') || bp.tags.includes('editorial')) {
    return `<div style="position:absolute;top:0;left:0;right:0;height:4px;background:${colors.primary};"></div>`
  }
  if (bp.tags.includes('academic') || bp.tags.includes('formal')) {
    return `<div style="position:absolute;top:${config.padding * 0.5}px;left:${config.padding}px;right:${config.padding}px;border-top:2px double ${colors.primary}40;padding-top:4px;"></div>`
  }
  return `<div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,${colors.primary},${colors.primary}40,transparent);"></div>`
}

export function renderV2FooterDecor(colors: Colors, config: XhsConfig, xhs: BlueprintXhsConfig): string {
  if (!xhs.pageDecoration.footerLine) return ''
  return `<div style="position:absolute;bottom:${config.padding}px;left:${config.padding * 1.5}px;right:${config.padding * 1.5}px;height:2px;background:linear-gradient(90deg,transparent,${colors.primary}40,transparent);"></div>`
}

export function renderV2Brand(colors: Colors, config: XhsConfig, position: 'bottom-center' | 'bottom-right' | 'none'): string {
  if (position === 'none') return ''
  const align = position === 'bottom-right' ? 'right' : 'center'
  return `<div style="position:absolute;bottom:${config.padding * 0.4}px;left:${config.padding}px;right:${config.padding}px;text-align:${align};color:${colors.textMuted};font-size:${Math.round(config.fontSize * 0.45)}px;opacity:0.4;letter-spacing:1px;">云中书 YunType</div>`
}

function isDarkTheme(pageBg: string): boolean {
  const hex = pageBg.replace('#', '')
  if (hex.length < 6) return false
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  return (r + g + b) / 3 < 128
}

export function renderPageDecorations(colors: Colors, config: XhsConfig): string {
  const w = config.width
  const h = config.height
  return `
    <div style="position:absolute;top:-${Math.round(w * 0.15)}px;right:-${Math.round(w * 0.15)}px;width:${Math.round(w * 0.5)}px;height:${Math.round(w * 0.5)}px;border-radius:50%;background:radial-gradient(circle, ${colors.primary}25 0%, ${colors.primary}00 70%);pointer-events:none;"></div>
    <div style="position:absolute;bottom:-${Math.round(w * 0.2)}px;left:-${Math.round(w * 0.1)}px;width:${Math.round(w * 0.45)}px;height:${Math.round(w * 0.45)}px;border-radius:50%;background:radial-gradient(circle, ${colors.primary}18 0%, ${colors.primary}00 70%);pointer-events:none;"></div>
    <div style="position:absolute;top:${Math.round(h * 0.35)}px;right:${Math.round(w * 0.05)}px;width:${Math.round(w * 0.12)}px;height:${Math.round(w * 0.12)}px;border-radius:50%;background:${colors.primary}15;pointer-events:none;"></div>
  `
}

export function renderPageTopBar(pageIndex: number, totalPages: number, colors: Colors, config: XhsConfig): string {
  const fs = config.fontSize
  const pad = config.padding
  return `
    <div style="position:absolute;top:${Math.round(pad * 0.65)}px;left:${pad}px;right:${pad}px;display:flex;justify-content:space-between;align-items:center;z-index:2;">
      <div style="display:inline-flex;align-items:center;gap:${Math.round(fs * 0.25)}px;padding:${Math.round(fs * 0.22)}px ${Math.round(fs * 0.5)}px;background:${colors.primary};border-radius:${Math.round(fs * 0.7)}px;color:#fff;font-size:${Math.round(fs * 0.5)}px;font-weight:700;letter-spacing:1px;">
        <span style="font-size:${Math.round(fs * 0.55)}px;">☁️</span>
        <span>云中书</span>
      </div>
      <div style="display:inline-flex;align-items:center;gap:${Math.round(fs * 0.3)}px;font-size:${Math.round(fs * 0.55)}px;font-weight:800;color:${colors.textMuted};">
        <span style="color:${colors.primary};">${String(pageIndex).padStart(2, '0')}</span>
        <span style="opacity:0.4;">/</span>
        <span>${String(totalPages - 1).padStart(2, '0')}</span>
      </div>
    </div>
  `
}

export function renderPageBottomBar(colors: Colors, config: XhsConfig): string {
  const fs = config.fontSize
  const pad = config.padding
  return `
    <div style="position:absolute;bottom:${Math.round(pad * 0.55)}px;left:${pad}px;right:${pad}px;display:flex;align-items:center;gap:${Math.round(fs * 0.4)}px;z-index:2;">
      <div style="flex:1;height:2px;background:linear-gradient(90deg,${colors.primary}00,${colors.primary}30);"></div>
      <div style="font-size:${Math.round(fs * 0.45)}px;color:${colors.textMuted};letter-spacing:3px;font-weight:600;">YUNTYPE</div>
      <div style="flex:1;height:2px;background:linear-gradient(90deg,${colors.primary}30,${colors.primary}00);"></div>
    </div>
  `
}

function renderRichHeading(title: string, index: number, colors: Colors, config: XhsConfig): string {
  const fs = config.fontSize
  const numberText = String(index).padStart(2, '0')
  return `
    <div style="display:flex;align-items:flex-start;gap:${Math.round(fs * 0.5)}px;margin-bottom:${Math.round(fs * 0.7)}px;flex-shrink:0;">
      <div style="width:${Math.round(fs * 2.2)}px;height:${Math.round(fs * 2.2)}px;border-radius:${Math.round(fs * 0.45)}px;background:linear-gradient(135deg,${colors.primary},${colors.primary}cc);display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 ${Math.round(fs * 0.15)}px ${Math.round(fs * 0.5)}px ${colors.primary}40;">
        <span style="font-size:${Math.round(fs * 1.0)}px;font-weight:900;color:#fff;letter-spacing:-1px;">${numberText}</span>
      </div>
      <div style="flex:1;padding-top:${Math.round(fs * 0.15)}px;">
        <div style="font-size:${Math.round(fs * 1.45)}px;font-weight:900;color:${colors.text};line-height:1.2;margin-bottom:${Math.round(fs * 0.25)}px;letter-spacing:0.5px;">${title}</div>
        <div style="display:flex;gap:${Math.round(fs * 0.15)}px;align-items:center;">
          <div style="width:${Math.round(fs * 1.5)}px;height:${Math.round(fs * 0.16)}px;background:${colors.primary};border-radius:${Math.round(fs * 0.08)}px;"></div>
          <div style="width:${Math.round(fs * 0.3)}px;height:${Math.round(fs * 0.16)}px;background:${colors.primary};opacity:0.5;border-radius:${Math.round(fs * 0.08)}px;"></div>
          <div style="width:${Math.round(fs * 0.15)}px;height:${Math.round(fs * 0.16)}px;background:${colors.primary};opacity:0.25;border-radius:${Math.round(fs * 0.08)}px;"></div>
        </div>
      </div>
    </div>
  `
}

export function renderTemplateFeatureGrid(
  elements: PageElement[], colors: Colors, config: XhsConfig, _ctx: RenderContext
): string {
  const heading = elements.find(e => e.type === 'heading')
  const listEl = elements.find(e => e.type === 'list')
  const items = listEl?.items ?? []
  const fs = config.fontSize
  const pad = config.padding
  const isDark = isDarkTheme(colors.pageBg)

  const cardBg = isDark
    ? `linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))`
    : `linear-gradient(135deg,${colors.contentBg},${colors.primary}08)`
  const cardBorder = isDark ? `rgba(255,255,255,0.14)` : `${colors.primary}28`

  const headingHtml = heading ? renderRichHeading(heading.content, 1, colors, config) : ''

  const ICONS = ['💡', '🎯', '✨', '🚀', '🔥', '⚡', '🌟', '💎']
  const cols = 2
  const rows = Math.ceil(items.length / cols)

  const cards = items.map((item, i) => {
    const icon = ICONS[i % ICONS.length]
    return `
      <div style="position:relative;background:${cardBg};border-radius:${Math.round(fs * 0.6)}px;padding:${Math.round(fs * 0.8)}px ${Math.round(fs * 0.85)}px;border:1.5px solid ${cardBorder};display:flex;flex-direction:column;justify-content:center;gap:${Math.round(fs * 0.35)}px;min-height:0;overflow:hidden;">
        <div style="position:absolute;top:-${Math.round(fs * 0.4)}px;right:-${Math.round(fs * 0.4)}px;width:${Math.round(fs * 2.2)}px;height:${Math.round(fs * 2.2)}px;border-radius:50%;background:${colors.primary};opacity:0.06;"></div>
        <div style="display:flex;align-items:center;gap:${Math.round(fs * 0.4)}px;position:relative;">
          <div style="width:${Math.round(fs * 1.3)}px;height:${Math.round(fs * 1.3)}px;border-radius:${Math.round(fs * 0.35)}px;background:linear-gradient(135deg,${colors.primary}30,${colors.primary}15);display:flex;align-items:center;justify-content:center;font-size:${Math.round(fs * 0.85)}px;flex-shrink:0;border:1px solid ${colors.primary}30;">${icon}</div>
          <div style="display:flex;flex-direction:column;">
            <span style="font-size:${Math.round(fs * 0.5)}px;font-weight:700;color:${colors.textMuted};letter-spacing:2px;">FEATURE</span>
            <span style="font-size:${Math.round(fs * 0.9)}px;font-weight:900;color:${colors.primary};line-height:1;">${String(i + 1).padStart(2, '0')}</span>
          </div>
        </div>
        <div style="font-size:${Math.round(fs * 0.88)}px;color:${colors.text};line-height:1.6;font-weight:500;position:relative;">${renderInline(item)}</div>
      </div>`
  }).join('')

  return `
    <div style="padding:${Math.round(pad * 0.4)}px ${pad}px ${Math.round(pad * 0.4)}px;height:100%;box-sizing:border-box;display:flex;flex-direction:column;position:relative;">
      ${headingHtml}
      <div style="display:grid;grid-template-columns:repeat(${cols},1fr);grid-template-rows:repeat(${rows},1fr);gap:${Math.round(fs * 0.5)}px;flex:1;min-height:0;">
        ${cards}
      </div>
    </div>`
}

export function renderTemplateWorkflow(
  elements: PageElement[], colors: Colors, config: XhsConfig, _ctx: RenderContext
): string {
  const heading = elements.find(e => e.type === 'heading')
  const listEl = elements.find(e => e.type === 'list' && e.ordered) ?? elements.find(e => e.type === 'list')
  const items = listEl?.items ?? []
  const fs = config.fontSize
  const pad = config.padding
  const isDark = isDarkTheme(colors.pageBg)

  const stepBg = isDark
    ? `linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))`
    : `linear-gradient(135deg,${colors.contentBg},${colors.primary}06)`
  const stepBorder = isDark ? `rgba(255,255,255,0.12)` : `${colors.primary}20`

  const headingHtml = heading ? renderRichHeading(heading.content, 1, colors, config) : ''

  const dotSize = Math.round(fs * 1.5)

  const steps = items.map((item, i) => {
    const isLast = i === items.length - 1
    return `
      <div style="display:flex;gap:${Math.round(fs * 0.55)}px;flex:1;min-height:0;position:relative;">
        <div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0;width:${dotSize}px;">
          <div style="width:${dotSize}px;height:${dotSize}px;border-radius:50%;background:linear-gradient(135deg,${colors.primary},${colors.primary}dd);display:flex;align-items:center;justify-content:center;font-size:${Math.round(fs * 0.7)}px;font-weight:900;color:#fff;flex-shrink:0;box-shadow:0 ${Math.round(fs * 0.1)}px ${Math.round(fs * 0.35)}px ${colors.primary}50;border:3px solid ${colors.pageBg};">${i + 1}</div>
          ${!isLast ? `<div style="width:3px;flex:1;background:linear-gradient(${colors.primary}80,${colors.primary}15);margin-top:${Math.round(fs * 0.15)}px;border-radius:2px;"></div>` : ''}
        </div>
        <div style="background:${stepBg};border-radius:${Math.round(fs * 0.5)}px;padding:${Math.round(fs * 0.6)}px ${Math.round(fs * 0.8)}px;border:1.5px solid ${stepBorder};flex:1;display:flex;flex-direction:column;justify-content:center;${!isLast ? `margin-bottom:${Math.round(fs * 0.4)}px;` : ''}min-height:0;position:relative;overflow:hidden;">
          <div style="position:absolute;top:0;left:0;bottom:0;width:${Math.round(fs * 0.15)}px;background:linear-gradient(${colors.primary},${colors.primary}60);"></div>
          <div style="font-size:${Math.round(fs * 0.5)}px;color:${colors.primary};font-weight:800;letter-spacing:2px;margin-bottom:${Math.round(fs * 0.15)}px;text-transform:uppercase;">Step ${String(i + 1).padStart(2, '0')}</div>
          <div style="font-size:${Math.round(fs * 0.92)}px;color:${colors.text};line-height:1.6;font-weight:500;">${renderInline(item)}</div>
        </div>
      </div>`
  }).join('')

  const extraParas = elements.filter(e => e.type === 'paragraph')
    .map(e => `<div style="font-size:${Math.round(fs * 0.78)}px;color:${colors.textMuted};line-height:1.7;margin-top:${Math.round(fs * 0.4)}px;flex-shrink:0;padding-left:${Math.round(fs * 0.5)}px;border-left:3px solid ${colors.primary}40;">${renderInline(e.content)}</div>`)
    .join('')

  return `
    <div style="padding:${Math.round(pad * 0.4)}px ${pad}px ${Math.round(pad * 0.4)}px;height:100%;box-sizing:border-box;display:flex;flex-direction:column;position:relative;">
      ${headingHtml}
      <div style="flex:1;display:flex;flex-direction:column;min-height:0;">
        ${steps}
      </div>
      ${extraParas}
    </div>`
}

export function renderTemplateTextHighlight(
  elements: PageElement[], colors: Colors, config: XhsConfig, _ctx: RenderContext
): string {
  const heading = elements.find(e => e.type === 'heading')
  const quotes = elements.filter(e => e.type === 'blockquote')
  const paras = elements.filter(e => e.type === 'paragraph')
  const fs = config.fontSize
  const pad = config.padding
  const isDark = isDarkTheme(colors.pageBg)

  const quoteBg = isDark
    ? `linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))`
    : `linear-gradient(135deg,${colors.primary}0e,${colors.primary}04)`

  const headingHtml = heading
    ? `<div style="display:flex;align-items:center;justify-content:center;gap:${Math.round(fs * 0.35)}px;margin-bottom:${Math.round(fs * 0.8)}px;flex-shrink:0;">
        <div style="width:${Math.round(fs * 1.2)}px;height:2px;background:${colors.primary};opacity:0.6;"></div>
        <div style="font-size:${Math.round(fs * 0.7)}px;font-weight:800;color:${colors.primary};letter-spacing:4px;text-transform:uppercase;">${renderInline(heading.content)}</div>
        <div style="width:${Math.round(fs * 1.2)}px;height:2px;background:${colors.primary};opacity:0.6;"></div>
      </div>`
    : ''

  const singleLarge = quotes.length === 1
  const quoteFs = singleLarge ? Math.round(fs * 1.35) : Math.round(fs * 1.05)

  const quotesHtml = quotes.map((q, i) => `
    <div style="background:${quoteBg};border:2px solid ${colors.primary}25;border-radius:${Math.round(fs * 0.6)}px;padding:${Math.round(fs * 1.3)}px ${Math.round(fs * 1.2)}px;${i < quotes.length - 1 ? `margin-bottom:${Math.round(fs * 0.5)}px;` : ''}position:relative;flex:1;display:flex;flex-direction:column;justify-content:center;min-height:0;overflow:hidden;">
      <div style="position:absolute;top:${Math.round(fs * 0.3)}px;left:${Math.round(fs * 0.55)}px;font-size:${Math.round(fs * 3.8)}px;color:${colors.primary};opacity:0.18;line-height:1;font-family:Georgia,serif;font-weight:900;">"</div>
      <div style="position:absolute;bottom:${Math.round(fs * 0.3)}px;right:${Math.round(fs * 0.55)}px;font-size:${Math.round(fs * 3.8)}px;color:${colors.primary};opacity:0.18;line-height:1;font-family:Georgia,serif;font-weight:900;">"</div>
      <div style="font-size:${quoteFs}px;color:${colors.text};line-height:1.75;text-align:center;font-weight:600;position:relative;padding:0 ${Math.round(fs * 0.4)}px;">${renderInline(q.content)}</div>
      <div style="display:flex;align-items:center;justify-content:center;gap:${Math.round(fs * 0.2)}px;margin-top:${Math.round(fs * 0.7)}px;">
        <div style="width:${Math.round(fs * 0.35)}px;height:${Math.round(fs * 0.35)}px;border-radius:50%;background:${colors.primary};opacity:0.35;"></div>
        <div style="width:${Math.round(fs * 2.2)}px;height:3px;background:${colors.primary};border-radius:2px;opacity:0.7;"></div>
        <div style="width:${Math.round(fs * 0.35)}px;height:${Math.round(fs * 0.35)}px;border-radius:50%;background:${colors.primary};opacity:0.35;"></div>
      </div>
    </div>`
  ).join('')

  const parasHtml = paras.map(p =>
    `<div style="font-size:${Math.round(fs * 0.85)}px;color:${colors.textMuted};line-height:1.7;text-align:center;margin-top:${Math.round(fs * 0.5)}px;flex-shrink:0;font-style:italic;">${renderInline(p.content)}</div>`
  ).join('')

  return `
    <div style="padding:${Math.round(pad * 0.4)}px ${pad}px ${Math.round(pad * 0.4)}px;height:100%;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;position:relative;">
      ${headingHtml}
      <div style="flex:1;display:flex;flex-direction:column;justify-content:center;min-height:0;">
        ${quotesHtml}
      </div>
      ${parasHtml}
    </div>`
}

export function renderTemplateCardList(
  elements: PageElement[], colors: Colors, config: XhsConfig, _ctx: RenderContext
): string {
  const heading = elements.find(e => e.type === 'heading')
  const rest = elements.filter(e => e !== heading)
  const fs = config.fontSize
  const pad = config.padding
  const isDark = isDarkTheme(colors.pageBg)

  const cardBg = isDark
    ? `linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))`
    : `linear-gradient(135deg,${colors.contentBg},${colors.primary}07)`
  const cardBorder = isDark ? `rgba(255,255,255,0.12)` : `${colors.primary}22`

  const headingHtml = heading
    ? renderRichHeading(heading.content, 1, colors, config)
    : `<div style="display:flex;align-items:center;gap:${Math.round(fs * 0.4)}px;margin-bottom:${Math.round(fs * 0.7)}px;flex-shrink:0;">
        <div style="width:${Math.round(fs * 0.28)}px;height:${Math.round(fs * 1.8)}px;background:linear-gradient(${colors.primary},${colors.primary}60);border-radius:${Math.round(fs * 0.1)}px;"></div>
        <div style="display:flex;flex-direction:column;gap:${Math.round(fs * 0.15)}px;">
          <div style="font-size:${Math.round(fs * 0.55)}px;font-weight:800;color:${colors.primary};letter-spacing:3px;">KEY POINTS</div>
          <div style="font-size:${Math.round(fs * 0.9)}px;font-weight:700;color:${colors.text};">核心要点</div>
        </div>
      </div>`

  const renderParaCard = (content: string, idx: number) => `
    <div style="position:relative;display:flex;gap:${Math.round(fs * 0.55)}px;background:${cardBg};border-radius:${Math.round(fs * 0.5)}px;padding:${Math.round(fs * 0.75)}px ${Math.round(fs * 0.85)}px;border:1.5px solid ${cardBorder};flex:1;align-items:center;min-height:0;overflow:hidden;">
      <div style="position:absolute;top:-${Math.round(fs * 0.3)}px;right:-${Math.round(fs * 0.3)}px;width:${Math.round(fs * 2.0)}px;height:${Math.round(fs * 2.0)}px;border-radius:50%;background:${colors.primary};opacity:0.05;"></div>
      <div style="width:${Math.round(fs * 1.5)}px;height:${Math.round(fs * 1.5)}px;border-radius:${Math.round(fs * 0.35)}px;background:linear-gradient(135deg,${colors.primary},${colors.primary}cc);display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 ${Math.round(fs * 0.1)}px ${Math.round(fs * 0.3)}px ${colors.primary}40;">
        <span style="font-size:${Math.round(fs * 0.75)}px;font-weight:900;color:#fff;">${String(idx + 1).padStart(2, '0')}</span>
      </div>
      <div style="font-size:${Math.round(fs * 0.92)}px;color:${colors.text};line-height:1.65;font-weight:500;position:relative;flex:1;">${renderInline(content)}</div>
    </div>`

  const cards = rest.map((el, i) => {
    if (el.type === 'paragraph') {
      return renderParaCard(el.content, i)
    } else if (el.type === 'list') {
      const listItems = (el.items ?? []).map((item, j) => `
        <div style="display:flex;align-items:center;gap:${Math.round(fs * 0.45)}px;padding:${Math.round(fs * 0.55)}px ${Math.round(fs * 0.75)}px;background:${cardBg};border-radius:${Math.round(fs * 0.4)}px;border:1px solid ${cardBorder};margin-bottom:${Math.round(fs * 0.25)}px;">
          <div style="width:${Math.round(fs * 1.1)}px;height:${Math.round(fs * 1.1)}px;border-radius:${Math.round(fs * 0.3)}px;background:${colors.primary};display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:${Math.round(fs * 0.55)}px;font-weight:900;color:#fff;">${el.ordered ? j + 1 : '✦'}</div>
          <span style="font-size:${Math.round(fs * 0.9)}px;color:${colors.text};line-height:1.6;font-weight:500;">${renderInline(item)}</span>
        </div>`).join('')
      return `<div style="flex:1;min-height:0;display:flex;flex-direction:column;justify-content:center;">${listItems}</div>`
    } else if (el.type === 'blockquote') {
      return `
        <div style="position:relative;padding:${Math.round(fs * 0.7)}px ${Math.round(fs * 0.85)}px;background:linear-gradient(135deg,${colors.primary}15,${colors.primary}05);border-radius:${Math.round(fs * 0.45)}px;border:1.5px solid ${colors.primary}30;flex:1;display:flex;align-items:center;min-height:0;overflow:hidden;">
          <div style="position:absolute;top:${Math.round(fs * 0.1)}px;left:${Math.round(fs * 0.3)}px;font-size:${Math.round(fs * 2.5)}px;color:${colors.primary};opacity:0.25;line-height:1;font-family:Georgia,serif;">"</div>
          <div style="font-size:${Math.round(fs * 0.92)}px;color:${colors.text};line-height:1.7;font-style:italic;font-weight:500;position:relative;padding-left:${Math.round(fs * 0.6)}px;">${renderInline(el.content)}</div>
        </div>`
    }
    return ''
  }).join('')

  return `
    <div style="padding:${Math.round(pad * 0.4)}px ${pad}px ${Math.round(pad * 0.4)}px;height:100%;box-sizing:border-box;display:flex;flex-direction:column;position:relative;">
      ${headingHtml}
      <div style="flex:1;display:flex;flex-direction:column;gap:${Math.round(fs * 0.4)}px;min-height:0;">
        ${cards}
      </div>
    </div>`
}

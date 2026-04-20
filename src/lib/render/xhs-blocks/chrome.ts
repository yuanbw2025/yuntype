// 页面顶栏 / 底栏

import type { BlockContext } from './types'

/** 顶栏 — ☁️ 云中书胶囊 + 页码 */
export function renderTopBar(ctx: BlockContext): string {
  const { colors, pageIndex, totalPages, xhs, config } = ctx
  if (!xhs.pageDecoration.headerBar) return ''
  const pageLabel = formatPage(xhs.pageDecoration.pageNumberStyle, pageIndex, totalPages)
  const fs = Math.round(config.fontSize * 0.7)
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 0;margin-bottom:16px;">
      <div style="display:inline-flex;align-items:center;gap:10px;padding:10px 22px;background-color:${colors.secondary};border-radius:999px;font-size:${fs}px;color:${colors.text};font-weight:600;">
        <span>☁️</span><span>云中书</span>
      </div>
      <div style="font-size:${fs}px;color:${colors.textMuted};">${pageLabel}</div>
    </div>`
}

/** 底栏 — 品牌条 */
export function renderBottomBar(ctx: BlockContext): string {
  const { colors, pageIndex, totalPages, xhs, config } = ctx
  const { footerLine, brandPosition, pageNumberStyle } = xhs.pageDecoration
  if (!footerLine && brandPosition === 'none') return ''
  const fs = Math.round(config.fontSize * 0.65)
  const pageLabel = formatPage(pageNumberStyle, pageIndex, totalPages)
  const brand = brandPosition === 'none' ? '' : `<span style="color:${colors.textMuted};font-size:${fs}px;">云中书 · Cloud Book</span>`
  const pageShow = xhs.pageDecoration.headerBar ? '' : `<span style="color:${colors.textMuted};font-size:${fs}px;">${pageLabel}</span>`
  const justify = brandPosition === 'bottom-center'
    ? 'center'
    : brandPosition === 'bottom-right'
      ? 'flex-end'
      : 'space-between'
  const line = footerLine ? `border-top:2px solid ${colors.secondary};padding-top:16px;` : ''
  return `
    <div style="display:flex;align-items:center;justify-content:${justify};gap:16px;margin-top:16px;${line}">
      ${brand}
      ${pageShow}
    </div>`
}

function formatPage(style: string, index: number, total: number): string {
  switch (style) {
    case 'fraction': return `${index} / ${total}`
    case 'dot':      return '• '.repeat(index) + '◦ '.repeat(Math.max(0, total - index))
    case 'center':   return `— ${index} —`
    case 'right':
    default:         return `${index}`
  }
}

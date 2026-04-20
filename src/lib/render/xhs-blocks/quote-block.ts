// 引用块 — 2 个 variant

import type { QuoteData, VariantRenderer } from './types'

/** big-quotes — 左右大引号 */
export const bigQuotes: VariantRenderer<QuoteData> = (ctx, data) => {
  const { colors, config } = ctx
  const fs = config.fontSize
  const qSize = Math.round(fs * 2.4)
  return `
    <div style="margin:24px 0;padding:28px 36px;background-color:${colors.contentBg};border-radius:20px;position:relative;">
      <div style="position:absolute;top:4px;left:18px;font-size:${qSize}px;line-height:1;font-family:Georgia,serif;color:${colors.primary};opacity:0.6;">“</div>
      <div style="font-size:${Math.round(fs * 1.05)}px;line-height:1.8;color:${colors.text};padding:18px 30px 18px 30px;font-style:italic;">${escapeHtmlInline(data.text)}</div>
      <div style="position:absolute;bottom:-10px;right:22px;font-size:${qSize}px;line-height:1;font-family:Georgia,serif;color:${colors.primary};opacity:0.6;">”</div>
    </div>`
}

/** left-bar — 左竖条 + 斜体 */
export const leftBar: VariantRenderer<QuoteData> = (ctx, data) => {
  const { colors, config } = ctx
  const fs = config.fontSize
  return `
    <div style="margin:22px 0;padding:14px 22px;border-left:8px solid ${colors.primary};background-color:${colors.secondary};border-radius:0 12px 12px 0;">
      <div style="font-size:${fs}px;line-height:1.75;color:${colors.text};font-style:italic;">${escapeHtmlInline(data.text)}</div>
    </div>`
}

function escapeHtmlInline(s: string): string {
  // 已经是 inline-render 过的 HTML，这里只做最基本保护（假设调用方已处理）
  return s
}

export const quoteVariants: Record<string, VariantRenderer<QuoteData>> = {
  'big-quotes': bigQuotes,
  'left-bar': leftBar,
}

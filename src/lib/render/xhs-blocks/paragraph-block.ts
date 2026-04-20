// 段落块 — 3 个 variant

import type { ParagraphData, VariantRenderer } from './types'

/** card-wrap — 圆角卡片 */
export const cardWrap: VariantRenderer<ParagraphData> = (ctx, data) => {
  const { colors, config } = ctx
  const fs = config.fontSize
  return `
    <div style="margin:18px 0;padding:26px 30px;background-color:${colors.contentBg};border-radius:18px;border:2px solid ${colors.secondary};">
      <div style="font-size:${fs}px;line-height:1.8;color:${colors.text};">${data.text}</div>
    </div>`
}

/** quote-frame — 引号装饰框（非 quote 元素，也用左右引号气质） */
export const quoteFrame: VariantRenderer<ParagraphData> = (ctx, data) => {
  const { colors, config } = ctx
  const fs = config.fontSize
  return `
    <div style="margin:22px 0;padding:24px 34px;background-color:${colors.secondary};border-radius:22px;position:relative;">
      <div style="position:absolute;top:8px;left:16px;font-size:${Math.round(fs * 1.6)}px;color:${colors.primary};font-family:Georgia,serif;line-height:1;opacity:0.5;">“</div>
      <div style="font-size:${fs}px;line-height:1.8;color:${colors.text};padding:10px 0 0 0;">${data.text}</div>
    </div>`
}

/** plain-text — 纯文本段落，适度行距 */
export const plainText: VariantRenderer<ParagraphData> = (ctx, data) => {
  const { colors, config } = ctx
  const fs = config.fontSize
  return `
    <div style="margin:16px 0;font-size:${fs}px;line-height:1.85;color:${colors.text};">${data.text}</div>`
}

export const paragraphVariants: Record<string, VariantRenderer<ParagraphData>> = {
  'card-wrap': cardWrap,
  'quote-frame': quoteFrame,
  'plain-text': plainText,
}

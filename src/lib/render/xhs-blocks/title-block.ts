// 标题块 — 4 个 variant

import type { BlockContext, TitleData, VariantRenderer } from './types'

function titleSize(level: number, base: number): number {
  if (level <= 1) return Math.round(base * 2.0)
  if (level === 2) return Math.round(base * 1.5)
  return Math.round(base * 1.2)
}

/** plain — 大字标题 + 可选副标题 */
export const plain: VariantRenderer<TitleData> = (ctx, data) => {
  const { colors, config } = ctx
  const size = titleSize(data.level, config.fontSize)
  const subtitle = data.subtitle
    ? `<div style="font-size:${Math.round(config.fontSize * 0.9)}px;color:${colors.textMuted};margin-top:12px;line-height:1.5;">${escape(data.subtitle)}</div>`
    : ''
  return `
    <div style="margin:24px 0;">
      <div style="font-size:${size}px;font-weight:800;color:${colors.text};line-height:1.3;">${escape(data.text)}</div>
      ${subtitle}
    </div>`
}

/** left-bar — 左竖条 */
export const leftBar: VariantRenderer<TitleData> = (ctx, data) => {
  const { colors, config } = ctx
  const size = titleSize(data.level, config.fontSize)
  return `
    <div style="margin:20px 0;display:flex;align-items:center;gap:18px;">
      <div style="width:8px;height:${Math.round(size * 1.1)}px;background-color:${colors.primary};border-radius:4px;flex-shrink:0;"></div>
      <div style="font-size:${size}px;font-weight:800;color:${colors.text};line-height:1.3;">${escape(data.text)}</div>
    </div>`
}

/** numbered-badge — 大圆编号 + 标题 */
export const numberedBadge: VariantRenderer<TitleData> = (ctx, data) => {
  const { colors, config } = ctx
  const size = titleSize(data.level, config.fontSize)
  const badge = String(data.index ?? 1).padStart(2, '0')
  const badgeSize = Math.round(size * 1.4)
  return `
    <div style="margin:24px 0;display:flex;align-items:center;gap:20px;">
      <div style="width:${badgeSize}px;height:${badgeSize}px;background-color:${colors.primary};color:${colors.contentBg};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:${Math.round(size * 0.7)}px;font-weight:800;flex-shrink:0;">${badge}</div>
      <div style="font-size:${size}px;font-weight:800;color:${colors.text};line-height:1.3;">${escape(data.text)}</div>
    </div>`
}

/** gradient-box — 渐变色块反白 */
export const gradientBox: VariantRenderer<TitleData> = (ctx, data) => {
  const { colors, config } = ctx
  const size = titleSize(data.level, config.fontSize)
  return `
    <div style="margin:24px 0;padding:${Math.round(size * 0.5)}px ${Math.round(size * 0.8)}px;background:linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%);border-radius:16px;">
      <div style="font-size:${size}px;font-weight:800;color:${colors.contentBg};line-height:1.3;">${escape(data.text)}</div>
    </div>`
}

function escape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export const titleVariants: Record<string, VariantRenderer<TitleData>> = {
  'plain': plain,
  'left-bar': leftBar,
  'numbered-badge': numberedBadge,
  'gradient-box': gradientBox,
}

export type { BlockContext, TitleData }

// 页面级装饰 — 3 种

import type { BlockContext } from './types'

/** corner-circles — 四角渐变圆（绝对定位，不影响布局） */
export function cornerCircles(ctx: BlockContext): string {
  const { colors } = ctx
  const size = 260
  return `
    <div style="position:absolute;top:-${size / 2}px;left:-${size / 2}px;width:${size}px;height:${size}px;border-radius:50%;background:radial-gradient(circle, ${colors.primary}33 0%, transparent 70%);pointer-events:none;"></div>
    <div style="position:absolute;bottom:-${size / 2}px;right:-${size / 2}px;width:${size}px;height:${size}px;border-radius:50%;background:radial-gradient(circle, ${colors.accent}33 0%, transparent 70%);pointer-events:none;"></div>`
}

/** edge-strip — 左右边条 */
export function edgeStrip(ctx: BlockContext): string {
  const { colors } = ctx
  return `
    <div style="position:absolute;top:0;left:0;bottom:0;width:12px;background:linear-gradient(180deg, ${colors.primary} 0%, ${colors.accent} 100%);pointer-events:none;"></div>
    <div style="position:absolute;top:0;right:0;bottom:0;width:12px;background:linear-gradient(180deg, ${colors.accent} 0%, ${colors.primary} 100%);pointer-events:none;"></div>`
}

/** dot-pattern — 点阵背景 */
export function dotPattern(ctx: BlockContext): string {
  const { colors } = ctx
  // 用 radial-gradient 铺点阵，html2canvas 对此支持较好
  return `
    <div style="position:absolute;inset:0;background-image:radial-gradient(${colors.secondary} 2px, transparent 2px);background-size:36px 36px;background-position:0 0;opacity:0.5;pointer-events:none;"></div>`
}

export const decoratorVariants = {
  'corner-circles': cornerCircles,
  'edge-strip': edgeStrip,
  'dot-pattern': dotPattern,
}

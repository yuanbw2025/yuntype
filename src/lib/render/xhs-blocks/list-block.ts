// 列表块 — 4 个 variant

import type { ListData, VariantRenderer } from './types'

/** numbered-cards — 编号卡片垂直列 */
export const numberedCards: VariantRenderer<ListData> = (ctx, data) => {
  const { colors, config } = ctx
  const fs = config.fontSize
  const items = data.items.map((txt, i) => {
    const num = String(i + 1).padStart(2, '0')
    return `
      <div style="display:flex;align-items:flex-start;gap:20px;padding:22px 24px;background-color:${colors.contentBg};border-radius:18px;margin-bottom:16px;border-left:8px solid ${colors.primary};">
        <div style="font-size:${Math.round(fs * 1.3)}px;font-weight:800;color:${colors.primary};line-height:1;min-width:56px;">${num}</div>
        <div style="flex:1;font-size:${fs}px;line-height:1.7;color:${colors.text};">${txt}</div>
      </div>`
  }).join('')
  return `<div style="margin:20px 0;">${items}</div>`
}

/** bubble-flow — 气泡流（每条一个圆角气泡） */
export const bubbleFlow: VariantRenderer<ListData> = (ctx, data) => {
  const { colors, config } = ctx
  const fs = config.fontSize
  const items = data.items.map((txt, i) => {
    const bg = i % 2 === 0 ? colors.secondary : colors.contentBg
    return `
      <div style="display:inline-block;margin:0 14px 16px 0;padding:18px 28px;background-color:${bg};color:${colors.text};border-radius:999px;font-size:${fs}px;line-height:1.5;max-width:90%;">
        ${txt}
      </div>`
  }).join('')
  return `<div style="margin:20px 0;">${items}</div>`
}

/** timeline-rail — 时间轴（左轨 + 圆点节点） */
export const timelineRail: VariantRenderer<ListData> = (ctx, data) => {
  const { colors, config } = ctx
  const fs = config.fontSize
  const items = data.items.map((txt, i) => {
    const isLast = i === data.items.length - 1
    const line = isLast
      ? ''
      : `<div style="position:absolute;left:15px;top:32px;bottom:-16px;width:2px;background-color:${colors.secondary};"></div>`
    return `
      <div style="position:relative;padding-left:56px;padding-bottom:20px;">
        <div style="position:absolute;left:6px;top:10px;width:20px;height:20px;border-radius:50%;background-color:${colors.primary};border:4px solid ${colors.contentBg};box-shadow:0 0 0 2px ${colors.primary};"></div>
        ${line}
        <div style="font-size:${fs}px;line-height:1.7;color:${colors.text};">${txt}</div>
      </div>`
  }).join('')
  return `<div style="margin:20px 0;">${items}</div>`
}

/** icon-grid — 2 列图标网格 */
export const iconGrid: VariantRenderer<ListData> = (ctx, data) => {
  const { colors, config } = ctx
  const fs = config.fontSize
  const icons = ['◆', '▲', '●', '■', '★', '♦', '◉', '◇', '▸', '✦']
  const items = data.items.map((txt, i) => {
    const ic = icons[i % icons.length]
    return `
      <div style="flex:1 1 calc(50% - 12px);min-width:calc(50% - 12px);display:flex;align-items:flex-start;gap:14px;padding:20px 22px;background-color:${colors.contentBg};border-radius:14px;border:2px solid ${colors.secondary};">
        <div style="font-size:${Math.round(fs * 1.2)}px;color:${colors.primary};line-height:1;">${ic}</div>
        <div style="flex:1;font-size:${Math.round(fs * 0.95)}px;line-height:1.6;color:${colors.text};">${txt}</div>
      </div>`
  }).join('')
  return `<div style="margin:20px 0;display:flex;flex-wrap:wrap;gap:16px;">${items}</div>`
}

export const listVariants: Record<string, VariantRenderer<ListData>> = {
  'numbered-cards': numberedCards,
  'bubble-flow': bubbleFlow,
  'timeline-rail': timelineRail,
  'icon-grid': iconGrid,
}

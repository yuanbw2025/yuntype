// 风格预设 + 微调系统

import type { AtomIds, StyleCombo } from './index'

// ═══════════════════════════════════════
//  风格预设 — 8 套精选组合
// ═══════════════════════════════════════

export interface StylePreset {
  name: string
  nameEn: string
  emoji: string
  ids: AtomIds
}

export const stylePresets: StylePreset[] = [
  {
    name: '商务简约', nameEn: 'Business Clean', emoji: '💼',
    ids: { colorId: 'L4', layoutId: 'T1', decorationId: 'S1', typographyId: 'F1' },
  },
  {
    name: '文艺清新', nameEn: 'Literary Fresh', emoji: '🌿',
    ids: { colorId: 'L2', layoutId: 'T2', decorationId: 'S3', typographyId: 'F2' },
  },
  {
    name: '温柔奶茶', nameEn: 'Warm Milk Tea', emoji: '🍵',
    ids: { colorId: 'L1', layoutId: 'T2', decorationId: 'S2', typographyId: 'F2' },
  },
  {
    name: '活力蜜桃', nameEn: 'Peach Energy', emoji: '🍑',
    ids: { colorId: 'L3', layoutId: 'T1', decorationId: 'S4', typographyId: 'F3' },
  },
  {
    name: '暗夜金字', nameEn: 'Midnight Gold', emoji: '🌙',
    ids: { colorId: 'D1', layoutId: 'T4', decorationId: 'S2', typographyId: 'F2' },
  },
  {
    name: '科技极光', nameEn: 'Tech Aurora', emoji: '💻',
    ids: { colorId: 'D2', layoutId: 'T1', decorationId: 'S4', typographyId: 'F1' },
  },
  {
    name: '樱花浪漫', nameEn: 'Sakura Romance', emoji: '🌸',
    ids: { colorId: 'L8', layoutId: 'T4', decorationId: 'S3', typographyId: 'F2' },
  },
  {
    name: '深海学术', nameEn: 'Ocean Academic', emoji: '🌊',
    ids: { colorId: 'D3', layoutId: 'T3', decorationId: 'S2', typographyId: 'F1' },
  },
]

// ═══════════════════════════════════════
//  微调参数
// ═══════════════════════════════════════

export interface TuneParams {
  fontSizeScale: number    // 0.8 ~ 1.2, default 1.0
  spacingScale: number     // 0.6 ~ 1.5, default 1.0
  lineHeightAdd: number    // -0.2 ~ 0.4, default 0
}

export const defaultTuneParams: TuneParams = {
  fontSizeScale: 1.0,
  spacingScale: 1.0,
  lineHeightAdd: 0,
}

// ═══════════════════════════════════════
//  微调应用
// ═══════════════════════════════════════

function scalePx(value: string, scale: number): string {
  const num = parseFloat(value)
  if (isNaN(num)) return value
  return `${Math.round(num * scale)}px`
}

/** 将微调参数应用到样式组合，返回新组合 */
export function applyTuning(combo: StyleCombo, tune: TuneParams): StyleCombo {
  // 无变化则直接返回
  if (tune.fontSizeScale === 1 && tune.spacingScale === 1 && tune.lineHeightAdd === 0) {
    return combo
  }

  const p = { ...combo.layout.params }

  // 字号缩放
  p.fontSizeBody = scalePx(p.fontSizeBody, tune.fontSizeScale)
  p.fontSizeH1 = scalePx(p.fontSizeH1, tune.fontSizeScale)
  p.fontSizeH2 = scalePx(p.fontSizeH2, tune.fontSizeScale)
  p.fontSizeH3 = scalePx(p.fontSizeH3, tune.fontSizeScale)
  if (p.firstParagraphSize) p.firstParagraphSize = scalePx(p.firstParagraphSize, tune.fontSizeScale)
  if (p.blockquoteFontSize) p.blockquoteFontSize = scalePx(p.blockquoteFontSize, tune.fontSizeScale)

  // 间距缩放
  p.paragraphSpacing = scalePx(p.paragraphSpacing, tune.spacingScale)
  p.headingTopSpacing = scalePx(p.headingTopSpacing, tune.spacingScale)
  p.listItemSpacing = scalePx(p.listItemSpacing, tune.spacingScale)

  // 行高调整
  const lh = parseFloat(p.lineHeight)
  if (!isNaN(lh)) {
    p.lineHeight = String(Math.round((lh + tune.lineHeightAdd) * 100) / 100)
  }

  return {
    ...combo,
    layout: { ...combo.layout, params: p },
  }
}

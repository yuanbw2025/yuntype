// 分割线插槽 — 8种变体
import { type DividerSlotVariant } from './index'

export const dividerSlots: DividerSlotVariant[] = [
  // ── D01 细线 ──
  {
    id: 'thin-line',
    name: '细线',
    tags: ['minimal', 'clean', 'default'],
    render: (ctx) =>
      `<section style="border-top: 1px solid ${ctx.colors.secondary}; margin: 24px 0;"></section>`,
  },
  // ── D02 粗线 ──
  {
    id: 'thick-line',
    name: '粗线',
    tags: ['bold', 'modern', 'strong'],
    render: (ctx) =>
      `<section style="border-top: 3px solid ${ctx.colors.secondary}; margin: 24px 0;"></section>`,
  },
  // ── D03 双线 ──
  {
    id: 'double-line',
    name: '双线',
    tags: ['academic', 'formal', 'serious'],
    render: (ctx) =>
      `<section style="border-top: 3px double ${ctx.colors.secondary}; margin: 24px 0;"></section>`,
  },
  // ── D04 渐变线 ──
  {
    id: 'gradient-line',
    name: '渐变线',
    tags: ['modern', 'design', 'premium'],
    render: (ctx) =>
      `<section style="height: 2px; background: linear-gradient(to right, transparent, ${ctx.colors.primary}, transparent); margin: 28px 0;"></section>`,
  },
  // ── D05 点状 ──
  {
    id: 'dots',
    name: '点状 · · ·',
    tags: ['literary', 'elegant', 'poetic'],
    render: (ctx) =>
      `<p style="text-align: center; color: ${ctx.colors.secondary}; letter-spacing: 8px; margin: 24px 0; font-size: 14px;">· · · · ·</p>`,
  },
  // ── D06 装饰花 ──
  {
    id: 'ornament',
    name: '装饰花 ❖',
    tags: ['decorative', 'literary', 'elegant'],
    render: (ctx) =>
      `<p style="text-align: center; color: ${ctx.colors.primary}; margin: 28px 0; font-size: 16px; opacity: 0.6;">❖</p>`,
  },
  // ── D07 菱形 ──
  {
    id: 'diamond',
    name: '菱形 ◇◇◇',
    tags: ['geometric', 'unique', 'design'],
    render: (ctx) =>
      `<p style="text-align: center; color: ${ctx.colors.secondary}; letter-spacing: 6px; margin: 24px 0;">◇ ◇ ◇</p>`,
  },
  // ── D08 居中圆 ──
  {
    id: 'single-circle',
    name: '居中 ○',
    tags: ['japanese', 'minimal', 'zen'],
    render: (ctx) =>
      `<p style="text-align: center; color: ${ctx.colors.secondary}; margin: 28px 0; font-size: 12px;">○</p>`,
  },
]

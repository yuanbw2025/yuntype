// 分割线插槽 — 8种变体
import { type DividerSlotVariant, px } from './index'

export const dividerSlots: DividerSlotVariant[] = [
  // ── D01 细线 ──
  {
    id: 'thin-line',
    name: '细线',
    tags: ['minimal', 'clean', 'default'],
    render: (ctx) =>
      `<section style="border-top: ${px(1, ctx)} solid ${ctx.colors.secondary}; margin: ${px(24, ctx)} 0;"></section>`,
  },
  // ── D02 粗线 ──
  {
    id: 'thick-line',
    name: '粗线',
    tags: ['bold', 'modern', 'strong'],
    render: (ctx) =>
      `<section style="border-top: ${px(3, ctx)} solid ${ctx.colors.secondary}; margin: ${px(24, ctx)} 0;"></section>`,
  },
  // ── D03 双线 ──
  {
    id: 'double-line',
    name: '双线',
    tags: ['academic', 'formal', 'serious'],
    render: (ctx) =>
      `<section style="border-top: ${px(3, ctx)} double ${ctx.colors.secondary}; margin: ${px(24, ctx)} 0;"></section>`,
  },
  // ── D04 渐变线 ──
  {
    id: 'gradient-line',
    name: '渐变线',
    tags: ['modern', 'design', 'premium'],
    render: (ctx) =>
      `<section style="height: ${px(2, ctx)}; background: linear-gradient(to right, transparent, ${ctx.colors.primary}, transparent); margin: ${px(28, ctx)} 0;"></section>`,
  },
  // ── D05 点状 ──
  {
    id: 'dots',
    name: '点状 · · ·',
    tags: ['literary', 'elegant', 'poetic'],
    render: (ctx) =>
      `<p style="text-align: center; color: ${ctx.colors.secondary}; letter-spacing: ${px(8, ctx)}; margin: ${px(24, ctx)} 0; font-size: ${px(14, ctx)};">· · · · ·</p>`,
  },
  // ── D06 装饰花 ──
  {
    id: 'ornament',
    name: '装饰花 ❖',
    tags: ['decorative', 'literary', 'elegant'],
    render: (ctx) =>
      `<p style="text-align: center; color: ${ctx.colors.primary}; margin: ${px(28, ctx)} 0; font-size: ${px(16, ctx)}; opacity: 0.6;">❖</p>`,
  },
  // ── D07 菱形 ──
  {
    id: 'diamond',
    name: '菱形 ◇◇◇',
    tags: ['geometric', 'unique', 'design'],
    render: (ctx) =>
      `<p style="text-align: center; color: ${ctx.colors.secondary}; letter-spacing: ${px(6, ctx)}; margin: ${px(24, ctx)} 0;">◇ ◇ ◇</p>`,
  },
  // ── D08 居中圆 ──
  {
    id: 'single-circle',
    name: '居中 ○',
    tags: ['japanese', 'minimal', 'zen'],
    render: (ctx) =>
      `<p style="text-align: center; color: ${ctx.colors.secondary}; margin: ${px(28, ctx)} 0; font-size: ${px(12, ctx)};">○</p>`,
  },
]

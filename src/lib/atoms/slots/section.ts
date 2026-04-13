// 节区插槽 — 6种变体
// 节区插槽包裹每个 h2 下的一组内容块
import { type SectionSlotVariant, px } from './index'

export const sectionSlots: SectionSlotVariant[] = [
  // ── S01 平铺无包裹 ──
  {
    id: 'flat-flow',
    name: '平铺无包裹',
    tags: ['minimal', 'clean', 'default'],
    render: (innerHtml) => innerHtml,
  },
  // ── S02 卡片阴影 ──
  {
    id: 'card-shadow',
    name: '卡片阴影',
    tags: ['card', 'modular', 'structured'],
    render: (innerHtml, _heading, ctx) =>
      `<section style="background: ${ctx.isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF'}; border-radius: ${px(10, ctx)}; padding: ${px(20, ctx)}; margin: ${px(20, ctx)} 0; box-shadow: 0 ${px(2, ctx)} ${px(12, ctx)} rgba(0,0,0,${ctx.isDark ? '0.3' : '0.06'}); border: ${px(1, ctx)} solid rgba(${ctx.isDark ? '255,255,255,0.08' : '0,0,0,0.06'});">${innerHtml}</section>`,
  },
  // ── S03 交替色带 ──
  {
    id: 'alternating-bands',
    name: '交替色带',
    tags: ['structured', 'colorful', 'magazine'],
    render: (innerHtml, _heading, ctx, index) => {
      const isEven = index % 2 === 0
      const bg = isEven ? 'transparent' : ctx.colors.secondary
      return `<section style="background: ${bg}; padding: ${isEven ? '0' : px(20, ctx)}; margin: ${isEven ? '0' : `${px(16, ctx)} -${px(20, ctx)}`}; border-radius: 0;">${innerHtml}</section>`
    },
  },
  // ── S04 时间线轨道 ──
  {
    id: 'timeline',
    name: '时间线轨道',
    tags: ['timeline', 'step-by-step', 'structured'],
    render: (innerHtml, _heading, ctx, index) =>
      `<section style="position: relative; padding-left: ${px(28, ctx)}; margin: ${px(16, ctx)} 0; border-left: ${px(2, ctx)} solid ${ctx.colors.secondary};">
  <span style="position: absolute; left: -${px(7, ctx)}; top: ${px(4, ctx)}; width: ${px(12, ctx)}; height: ${px(12, ctx)}; border-radius: 50%; background: ${ctx.colors.primary}; display: block;"></span>
  <span style="position: absolute; left: -${px(7, ctx)}; top: ${px(4, ctx)}; width: ${px(12, ctx)}; height: ${px(12, ctx)}; border-radius: 50%; background: ${ctx.colors.primary}; opacity: 0.3; display: block; transform: scale(1.6);"></span>
  <span style="font-size: ${px(12, ctx)}; color: ${ctx.colors.textMuted}; margin-bottom: ${px(4, ctx)}; display: block;">Step ${index + 1}</span>
  ${innerHtml}
</section>`,
  },
  // ── S05 左侧标签 ──
  {
    id: 'left-label',
    name: '左侧标签',
    tags: ['professional', 'business', 'clean'],
    render: (innerHtml, heading, ctx) =>
      `<section style="display: flex; gap: ${px(16, ctx)}; margin: ${px(20, ctx)} 0; align-items: flex-start;">
  ${heading ? `<span style="writing-mode: vertical-lr; font-size: ${px(12, ctx)}; color: ${ctx.colors.primary}; letter-spacing: ${px(2, ctx)}; white-space: nowrap; padding-top: ${px(4, ctx)}; border-right: ${px(2, ctx)} solid ${ctx.colors.primary}; padding-right: ${px(8, ctx)};">${heading}</span>` : ''}
  <section style="flex: 1;">${innerHtml}</section>
</section>`,
  },
  // ── S06 分隔线段落 ──
  {
    id: 'divider-separated',
    name: '分隔线段落',
    tags: ['clean', 'editorial', 'reading'],
    render: (innerHtml, _heading, ctx, index) => {
      const sep = index > 0
        ? `<section style="border-top: ${px(1, ctx)} solid ${ctx.colors.secondary}; margin: ${px(24, ctx)} 0;"></section>`
        : ''
      return `${sep}${innerHtml}`
    },
  },
]

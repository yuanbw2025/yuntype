// 节区插槽 — 6种变体
// 节区插槽包裹每个 h2 下的一组内容块
import { type SectionSlotVariant } from './index'

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
      `<section style="background: ${ctx.isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF'}; border-radius: 10px; padding: 20px; margin: 20px 0; box-shadow: 0 2px 12px rgba(0,0,0,${ctx.isDark ? '0.3' : '0.06'}); border: 1px solid rgba(${ctx.isDark ? '255,255,255,0.08' : '0,0,0,0.06'});">${innerHtml}</section>`,
  },
  // ── S03 交替色带 ──
  {
    id: 'alternating-bands',
    name: '交替色带',
    tags: ['structured', 'colorful', 'magazine'],
    render: (innerHtml, _heading, ctx, index) => {
      const isEven = index % 2 === 0
      const bg = isEven ? 'transparent' : ctx.colors.secondary
      return `<section style="background: ${bg}; padding: ${isEven ? '0' : '20px'}; margin: ${isEven ? '0' : '16px -20px'}; border-radius: 0;">${innerHtml}</section>`
    },
  },
  // ── S04 时间线轨道 ──
  {
    id: 'timeline',
    name: '时间线轨道',
    tags: ['timeline', 'step-by-step', 'structured'],
    render: (innerHtml, _heading, ctx, index) =>
      `<section style="position: relative; padding-left: 28px; margin: 16px 0; border-left: 2px solid ${ctx.colors.secondary};">
  <span style="position: absolute; left: -7px; top: 4px; width: 12px; height: 12px; border-radius: 50%; background: ${ctx.colors.primary}; display: block;"></span>
  <span style="position: absolute; left: -7px; top: 4px; width: 12px; height: 12px; border-radius: 50%; background: ${ctx.colors.primary}; opacity: 0.3; display: block; transform: scale(1.6);"></span>
  <span style="font-size: 12px; color: ${ctx.colors.textMuted}; margin-bottom: 4px; display: block;">Step ${index + 1}</span>
  ${innerHtml}
</section>`,
  },
  // ── S05 左侧标签 ──
  {
    id: 'left-label',
    name: '左侧标签',
    tags: ['professional', 'business', 'clean'],
    render: (innerHtml, heading, ctx) =>
      `<section style="display: flex; gap: 16px; margin: 20px 0; align-items: flex-start;">
  ${heading ? `<span style="writing-mode: vertical-lr; font-size: 12px; color: ${ctx.colors.primary}; letter-spacing: 2px; white-space: nowrap; padding-top: 4px; border-right: 2px solid ${ctx.colors.primary}; padding-right: 8px;">${heading}</span>` : ''}
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
        ? `<section style="border-top: 1px solid ${ctx.colors.secondary}; margin: 24px 0;"></section>`
        : ''
      return `${sep}${innerHtml}`
    },
  },
]

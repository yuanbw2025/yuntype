// 列表插槽 — 8种变体（支持平台缩放）
import { type ListSlotVariant, px } from './index'
import { renderInline } from '../../render/markdown'

function r(text: string): string {
  return renderInline(text)
}

export const listSlots: ListSlotVariant[] = [
  // ── L01 圆点 ──
  {
    id: 'dot',
    name: '● 圆点',
    tags: ['default', 'clean', 'professional'],
    render: (items, ordered, ctx) => {
      const html = items.map((item, idx) => {
        const prefix = ordered
          ? `<span style="color: ${ctx.colors.primary}; font-weight: bold; margin-right: ${px(6, ctx)};">${idx + 1}.</span>`
          : `<span style="color: ${ctx.colors.primary}; margin-right: ${px(8, ctx)};">●</span>`
        return `<section style="margin-bottom: ${px(8, ctx)}; display: flex; align-items: baseline; font-size: ${px(15, ctx)}; line-height: 1.75; color: ${ctx.colors.text}; letter-spacing: ${ctx.typo.letterSpacing};">${prefix}<span>${r(item)}</span></section>`
      }).join('')
      return `<section style="margin: 0 0 ${px(16, ctx)} 0; padding-left: ${px(4, ctx)};">${html}</section>`
    },
  },
  // ── L02 方块 ──
  {
    id: 'square',
    name: '■ 方块',
    tags: ['modern', 'design', 'bold'],
    render: (items, ordered, ctx) => {
      const html = items.map((item, idx) => {
        const prefix = ordered
          ? `<span style="background: ${ctx.colors.primary}; color: #fff; width: ${px(22, ctx)}; height: ${px(22, ctx)}; border-radius: ${px(3, ctx)}; display: inline-flex; align-items: center; justify-content: center; font-size: ${px(12, ctx)}; margin-right: ${px(8, ctx)}; flex-shrink: 0;">${idx + 1}</span>`
          : `<span style="color: ${ctx.colors.primary}; margin-right: ${px(8, ctx)};">■</span>`
        return `<section style="margin-bottom: ${px(8, ctx)}; display: flex; align-items: baseline; font-size: ${px(15, ctx)}; line-height: 1.75; color: ${ctx.colors.text};">${prefix}<span>${r(item)}</span></section>`
      }).join('')
      return `<section style="margin: 0 0 ${px(16, ctx)} 0; padding-left: ${px(4, ctx)};">${html}</section>`
    },
  },
  // ── L03 箭头 ──
  {
    id: 'arrow',
    name: '▶ 箭头',
    tags: ['dynamic', 'tutorial', 'step-by-step'],
    render: (items, ordered, ctx) => {
      const html = items.map((item, idx) => {
        const prefix = ordered
          ? `<span style="color: ${ctx.colors.primary}; font-weight: bold; margin-right: ${px(6, ctx)};">${idx + 1}.</span>`
          : `<span style="color: ${ctx.colors.primary}; margin-right: ${px(8, ctx)}; font-size: ${px(12, ctx)};">▶</span>`
        return `<section style="margin-bottom: ${px(8, ctx)}; display: flex; align-items: baseline; font-size: ${px(15, ctx)}; line-height: 1.75; color: ${ctx.colors.text};">${prefix}<span>${r(item)}</span></section>`
      }).join('')
      return `<section style="margin: 0 0 ${px(16, ctx)} 0; padding-left: ${px(4, ctx)};">${html}</section>`
    },
  },
  // ── L04 菱形 ──
  {
    id: 'diamond',
    name: '🔹 菱形',
    tags: ['friendly', 'warm', 'cute'],
    render: (items, ordered, ctx) => {
      const html = items.map((item, idx) => {
        const prefix = ordered
          ? `<span style="color: ${ctx.colors.primary}; font-weight: bold; margin-right: ${px(6, ctx)};">${idx + 1}.</span>`
          : `<span style="margin-right: ${px(8, ctx)};">🔹</span>`
        return `<section style="margin-bottom: ${px(8, ctx)}; display: flex; align-items: baseline; font-size: ${px(15, ctx)}; line-height: 1.75; color: ${ctx.colors.text};">${prefix}<span>${r(item)}</span></section>`
      }).join('')
      return `<section style="margin: 0 0 ${px(16, ctx)} 0; padding-left: ${px(4, ctx)};">${html}</section>`
    },
  },
  // ── L05 清单打勾 ──
  {
    id: 'checklist',
    name: '☑ 清单',
    tags: ['structured', 'tutorial', 'checklist'],
    render: (items, _ordered, ctx) => {
      const html = items.map((item) =>
        `<section style="margin-bottom: ${px(8, ctx)}; display: flex; align-items: baseline; font-size: ${px(15, ctx)}; line-height: 1.75; color: ${ctx.colors.text};">
  <span style="color: ${ctx.colors.primary}; margin-right: ${px(8, ctx)};">☑</span><span>${r(item)}</span>
</section>`
      ).join('')
      return `<section style="margin: 0 0 ${px(16, ctx)} 0; padding-left: ${px(4, ctx)};">${html}</section>`
    },
  },
  // ── L06 短线前缀 ──
  {
    id: 'dash-prefix',
    name: '— 短线',
    tags: ['japanese', 'minimal', 'elegant'],
    render: (items, ordered, ctx) => {
      const html = items.map((item, idx) => {
        const prefix = ordered
          ? `<span style="color: ${ctx.colors.textMuted}; margin-right: ${px(8, ctx)};">${idx + 1}.</span>`
          : `<span style="color: ${ctx.colors.textMuted}; margin-right: ${px(8, ctx)};">—</span>`
        return `<section style="margin-bottom: ${px(10, ctx)}; display: flex; align-items: baseline; font-size: ${px(15, ctx)}; line-height: 1.8; color: ${ctx.colors.text};">${prefix}<span>${r(item)}</span></section>`
      }).join('')
      return `<section style="margin: 0 0 ${px(16, ctx)} 0; padding-left: ${px(4, ctx)};">${html}</section>`
    },
  },
  // ── L07 卡片列表 ──
  {
    id: 'card-items',
    name: '卡片列表',
    tags: ['card', 'modular', 'structured'],
    render: (items, ordered, ctx) => {
      const html = items.map((item, idx) => {
        const prefix = ordered
          ? `<span style="background: ${ctx.colors.primary}; color: #fff; width: ${px(22, ctx)}; height: ${px(22, ctx)}; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: ${px(12, ctx)}; margin-right: ${px(10, ctx)}; flex-shrink: 0;">${idx + 1}</span>`
          : `<span style="width: ${px(6, ctx)}; height: ${px(6, ctx)}; border-radius: 50%; background: ${ctx.colors.primary}; display: inline-block; margin-right: ${px(10, ctx)}; flex-shrink: 0; position: relative; top: ${px(-2, ctx)};"></span>`
        return `<section style="margin-bottom: ${px(8, ctx)}; padding: ${px(10, ctx)} ${px(14, ctx)}; background: ${ctx.colors.secondary}; border-radius: ${px(6, ctx)}; display: flex; align-items: center; font-size: ${px(15, ctx)}; line-height: 1.6; color: ${ctx.colors.text};">${prefix}<span>${r(item)}</span></section>`
      }).join('')
      return `<section style="margin: 0 0 ${px(16, ctx)} 0;">${html}</section>`
    },
  },
  // ── L08 编号圆圈 ──
  {
    id: 'circle-number',
    name: '①②③ 圆圈编号',
    tags: ['structured', 'tutorial', 'formal'],
    render: (items, _ordered, ctx) => {
      const circles = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩']
      const html = items.map((item, idx) => {
        const prefix = `<span style="color: ${ctx.colors.primary}; margin-right: ${px(8, ctx)}; font-size: ${px(16, ctx)};">${circles[idx] ?? `${idx + 1}.`}</span>`
        return `<section style="margin-bottom: ${px(8, ctx)}; display: flex; align-items: baseline; font-size: ${px(15, ctx)}; line-height: 1.75; color: ${ctx.colors.text};">${prefix}<span>${r(item)}</span></section>`
      }).join('')
      return `<section style="margin: 0 0 ${px(16, ctx)} 0; padding-left: ${px(4, ctx)};">${html}</section>`
    },
  },
]

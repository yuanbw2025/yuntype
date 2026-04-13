// 列表插槽 — 8种变体
import { type ListSlotVariant } from './index'
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
          ? `<span style="color: ${ctx.colors.primary}; font-weight: bold; margin-right: 6px;">${idx + 1}.</span>`
          : `<span style="color: ${ctx.colors.primary}; margin-right: 8px;">●</span>`
        return `<section style="margin-bottom: 8px; display: flex; align-items: baseline; font-size: 15px; line-height: 1.75; color: ${ctx.colors.text}; letter-spacing: ${ctx.typo.letterSpacing};">${prefix}<span>${r(item)}</span></section>`
      }).join('')
      return `<section style="margin: 0 0 16px 0; padding-left: 4px;">${html}</section>`
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
          ? `<span style="background: ${ctx.colors.primary}; color: #fff; width: 22px; height: 22px; border-radius: 3px; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; margin-right: 8px; flex-shrink: 0;">${idx + 1}</span>`
          : `<span style="color: ${ctx.colors.primary}; margin-right: 8px;">■</span>`
        return `<section style="margin-bottom: 8px; display: flex; align-items: baseline; font-size: 15px; line-height: 1.75; color: ${ctx.colors.text};">${prefix}<span>${r(item)}</span></section>`
      }).join('')
      return `<section style="margin: 0 0 16px 0; padding-left: 4px;">${html}</section>`
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
          ? `<span style="color: ${ctx.colors.primary}; font-weight: bold; margin-right: 6px;">${idx + 1}.</span>`
          : `<span style="color: ${ctx.colors.primary}; margin-right: 8px; font-size: 12px;">▶</span>`
        return `<section style="margin-bottom: 8px; display: flex; align-items: baseline; font-size: 15px; line-height: 1.75; color: ${ctx.colors.text};">${prefix}<span>${r(item)}</span></section>`
      }).join('')
      return `<section style="margin: 0 0 16px 0; padding-left: 4px;">${html}</section>`
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
          ? `<span style="color: ${ctx.colors.primary}; font-weight: bold; margin-right: 6px;">${idx + 1}.</span>`
          : `<span style="margin-right: 8px;">🔹</span>`
        return `<section style="margin-bottom: 8px; display: flex; align-items: baseline; font-size: 15px; line-height: 1.75; color: ${ctx.colors.text};">${prefix}<span>${r(item)}</span></section>`
      }).join('')
      return `<section style="margin: 0 0 16px 0; padding-left: 4px;">${html}</section>`
    },
  },
  // ── L05 清单打勾 ──
  {
    id: 'checklist',
    name: '☑ 清单',
    tags: ['structured', 'tutorial', 'checklist'],
    render: (items, _ordered, ctx) => {
      const html = items.map((item) =>
        `<section style="margin-bottom: 8px; display: flex; align-items: baseline; font-size: 15px; line-height: 1.75; color: ${ctx.colors.text};">
  <span style="color: ${ctx.colors.primary}; margin-right: 8px;">☑</span><span>${r(item)}</span>
</section>`
      ).join('')
      return `<section style="margin: 0 0 16px 0; padding-left: 4px;">${html}</section>`
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
          ? `<span style="color: ${ctx.colors.textMuted}; margin-right: 8px;">${idx + 1}.</span>`
          : `<span style="color: ${ctx.colors.textMuted}; margin-right: 8px;">—</span>`
        return `<section style="margin-bottom: 10px; display: flex; align-items: baseline; font-size: 15px; line-height: 1.8; color: ${ctx.colors.text};">${prefix}<span>${r(item)}</span></section>`
      }).join('')
      return `<section style="margin: 0 0 16px 0; padding-left: 4px;">${html}</section>`
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
          ? `<span style="background: ${ctx.colors.primary}; color: #fff; width: 22px; height: 22px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; margin-right: 10px; flex-shrink: 0;">${idx + 1}</span>`
          : `<span style="width: 6px; height: 6px; border-radius: 50%; background: ${ctx.colors.primary}; display: inline-block; margin-right: 10px; flex-shrink: 0; position: relative; top: -2px;"></span>`
        return `<section style="margin-bottom: 8px; padding: 10px 14px; background: ${ctx.colors.secondary}; border-radius: 6px; display: flex; align-items: center; font-size: 15px; line-height: 1.6; color: ${ctx.colors.text};">${prefix}<span>${r(item)}</span></section>`
      }).join('')
      return `<section style="margin: 0 0 16px 0;">${html}</section>`
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
        const prefix = `<span style="color: ${ctx.colors.primary}; margin-right: 8px; font-size: 16px;">${circles[idx] ?? `${idx + 1}.`}</span>`
        return `<section style="margin-bottom: 8px; display: flex; align-items: baseline; font-size: 15px; line-height: 1.75; color: ${ctx.colors.text};">${prefix}<span>${r(item)}</span></section>`
      }).join('')
      return `<section style="margin: 0 0 16px 0; padding-left: 4px;">${html}</section>`
    },
  },
]

// 引用插槽 — 8种变体（支持平台缩放）
import { type QuoteSlotVariant, px } from './index'
import { renderInline } from '../../render/markdown'

function r(text: string): string {
  return renderInline(text)
}

export const quoteSlots: QuoteSlotVariant[] = [
  // ── Q01 左竖线 ──
  {
    id: 'left-bar',
    name: '左竖线',
    tags: ['minimal', 'clean', 'professional'],
    render: (content, ctx) =>
      `<section style="margin: 0 0 ${px(16, ctx)} 0; border-left: ${px(3, ctx)} solid ${ctx.colors.secondary}; padding: ${px(12, ctx)} ${px(16, ctx)}; background: rgba(${ctx.isDark ? '255,255,255' : '0,0,0'},0.03); color: ${ctx.colors.text}; font-size: ${px(15, ctx)}; line-height: 1.8;">${r(content)}</section>`,
  },
  // ── Q02 圆角卡片 ──
  {
    id: 'rounded-card',
    name: '圆角卡片',
    tags: ['modern', 'card', 'friendly'],
    render: (content, ctx) =>
      `<section style="margin: 0 0 ${px(16, ctx)} 0; background: ${ctx.colors.secondary}; padding: ${px(16, ctx)} ${px(20, ctx)}; border-radius: ${px(10, ctx)}; color: ${ctx.colors.text}; font-size: ${px(15, ctx)}; line-height: 1.8;">${r(content)}</section>`,
  },
  // ── Q03 Pull-quote 居中大字 ──
  {
    id: 'pull-quote',
    name: '居中大字引述',
    tags: ['magazine', 'editorial', 'literary'],
    render: (content, ctx) =>
      `<section style="margin: ${px(24, ctx)} 0; padding: ${px(20, ctx)} ${px(32, ctx)}; text-align: center; font-size: ${px(20, ctx)}; font-style: italic; color: ${ctx.colors.primary}; line-height: 1.6; border-top: ${px(1, ctx)} solid ${ctx.colors.secondary}; border-bottom: ${px(1, ctx)} solid ${ctx.colors.secondary};">${r(content)}</section>`,
  },
  // ── Q04 双线框 ──
  {
    id: 'double-border',
    name: '双线框',
    tags: ['academic', 'serious', 'structured'],
    render: (content, ctx) =>
      `<section style="margin: 0 0 ${px(16, ctx)} 0; border: ${px(2, ctx)} double ${ctx.colors.secondary}; padding: ${px(16, ctx)}; color: ${ctx.colors.text}; font-size: ${px(15, ctx)}; line-height: 1.8;">${r(content)}</section>`,
  },
  // ── Q05 大引号 ──
  {
    id: 'big-quotes',
    name: '大引号',
    tags: ['literary', 'decorative', 'elegant'],
    render: (content, ctx) =>
      `<section style="margin: 0 0 ${px(16, ctx)} 0; padding: ${px(16, ctx)} ${px(20, ctx)} ${px(16, ctx)} ${px(40, ctx)}; position: relative; color: ${ctx.colors.text}; font-size: ${px(15, ctx)}; line-height: 1.8;">
  <span style="position: absolute; left: ${px(8, ctx)}; top: ${px(4, ctx)}; font-size: ${px(48, ctx)}; color: ${ctx.colors.primary}; opacity: 0.25; font-family: Georgia, serif; line-height: 1;">"</span>
  ${r(content)}
</section>`,
  },
  // ── Q06 虚线框 ──
  {
    id: 'dashed-frame',
    name: '虚线框',
    tags: ['japanese', 'minimal', 'clean'],
    render: (content, ctx) =>
      `<section style="margin: 0 0 ${px(16, ctx)} 0; border: ${px(1, ctx)} dashed ${ctx.colors.secondary}; padding: ${px(14, ctx)} ${px(18, ctx)}; color: ${ctx.colors.textMuted}; font-size: ${px(14, ctx)}; line-height: 1.8;">${r(content)}</section>`,
  },
  // ── Q07 气泡对话 ──
  {
    id: 'bubble',
    name: '气泡对话',
    tags: ['friendly', 'cute', 'warm'],
    render: (content, ctx) =>
      `<section style="margin: 0 0 ${px(16, ctx)} 0; background: ${ctx.colors.secondary}; padding: ${px(14, ctx)} ${px(18, ctx)}; border-radius: ${px(16, ctx)} ${px(16, ctx)} ${px(16, ctx)} ${px(4, ctx)}; color: ${ctx.colors.text}; font-size: ${px(15, ctx)}; line-height: 1.8;">${r(content)}</section>`,
  },
  // ── Q08 摘要框 ──
  {
    id: 'summary-box',
    name: '摘要框',
    tags: ['structured', 'tutorial', 'professional'],
    render: (content, ctx) =>
      `<section style="margin: 0 0 ${px(16, ctx)} 0; border: ${px(1, ctx)} solid ${ctx.colors.secondary}; border-left: ${px(4, ctx)} solid ${ctx.colors.primary}; padding: ${px(14, ctx)} ${px(18, ctx)}; background: rgba(${ctx.isDark ? '255,255,255' : '0,0,0'},0.02); color: ${ctx.colors.text}; font-size: ${px(14, ctx)}; line-height: 1.8;">
  <span style="display: block; font-size: ${px(12, ctx)}; color: ${ctx.colors.primary}; font-weight: 600; margin-bottom: ${px(6, ctx)}; letter-spacing: ${px(1, ctx)};">📌 摘要</span>
  ${r(content)}
</section>`,
  },
]

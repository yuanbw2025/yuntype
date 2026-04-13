// 引用插槽 — 8种变体
import { type QuoteSlotVariant } from './index'
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
      `<section style="margin: 0 0 16px 0; border-left: 3px solid ${ctx.colors.secondary}; padding: 12px 16px; background: rgba(${ctx.isDark ? '255,255,255' : '0,0,0'},0.03); color: ${ctx.colors.text}; font-size: 15px; line-height: 1.8;">${r(content)}</section>`,
  },
  // ── Q02 圆角卡片 ──
  {
    id: 'rounded-card',
    name: '圆角卡片',
    tags: ['modern', 'card', 'friendly'],
    render: (content, ctx) =>
      `<section style="margin: 0 0 16px 0; background: ${ctx.colors.secondary}; padding: 16px 20px; border-radius: 10px; color: ${ctx.colors.text}; font-size: 15px; line-height: 1.8;">${r(content)}</section>`,
  },
  // ── Q03 Pull-quote 居中大字 ──
  {
    id: 'pull-quote',
    name: '居中大字引述',
    tags: ['magazine', 'editorial', 'literary'],
    render: (content, ctx) =>
      `<section style="margin: 24px 0; padding: 20px 32px; text-align: center; font-size: 20px; font-style: italic; color: ${ctx.colors.primary}; line-height: 1.6; border-top: 1px solid ${ctx.colors.secondary}; border-bottom: 1px solid ${ctx.colors.secondary};">${r(content)}</section>`,
  },
  // ── Q04 双线框 ──
  {
    id: 'double-border',
    name: '双线框',
    tags: ['academic', 'serious', 'structured'],
    render: (content, ctx) =>
      `<section style="margin: 0 0 16px 0; border: 2px double ${ctx.colors.secondary}; padding: 16px; color: ${ctx.colors.text}; font-size: 15px; line-height: 1.8;">${r(content)}</section>`,
  },
  // ── Q05 大引号 ──
  {
    id: 'big-quotes',
    name: '大引号',
    tags: ['literary', 'decorative', 'elegant'],
    render: (content, ctx) =>
      `<section style="margin: 0 0 16px 0; padding: 16px 20px 16px 40px; position: relative; color: ${ctx.colors.text}; font-size: 15px; line-height: 1.8;">
  <span style="position: absolute; left: 8px; top: 4px; font-size: 48px; color: ${ctx.colors.primary}; opacity: 0.25; font-family: Georgia, serif; line-height: 1;">"</span>
  ${r(content)}
</section>`,
  },
  // ── Q06 虚线框 ──
  {
    id: 'dashed-frame',
    name: '虚线框',
    tags: ['japanese', 'minimal', 'clean'],
    render: (content, ctx) =>
      `<section style="margin: 0 0 16px 0; border: 1px dashed ${ctx.colors.secondary}; padding: 14px 18px; color: ${ctx.colors.textMuted}; font-size: 14px; line-height: 1.8;">${r(content)}</section>`,
  },
  // ── Q07 气泡对话 ──
  {
    id: 'bubble',
    name: '气泡对话',
    tags: ['friendly', 'chat', 'warm'],
    render: (content, ctx) =>
      `<section style="margin: 0 0 16px 0; background: ${ctx.colors.secondary}; padding: 14px 18px; border-radius: 16px 16px 16px 4px; color: ${ctx.colors.text}; font-size: 15px; line-height: 1.8;">${r(content)}</section>`,
  },
  // ── Q08 摘要高亮框 ──
  {
    id: 'highlight-box',
    name: '摘要高亮框',
    tags: ['structured', 'tutorial', 'highlight'],
    render: (content, ctx) =>
      `<section style="margin: 0 0 16px 0; background: ${ctx.colors.secondary}; border-left: 4px solid ${ctx.colors.primary}; padding: 14px 18px; border-radius: 0 6px 6px 0; color: ${ctx.colors.text}; font-size: 15px; line-height: 1.8;">
  <span style="font-weight: bold; color: ${ctx.colors.primary}; font-size: 13px; display: block; margin-bottom: 6px;">💡 摘要</span>
  ${r(content)}
</section>`,
  },
]

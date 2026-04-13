// 段落插槽 — 6种变体
import { type ParagraphSlotVariant } from './index'
import { renderInline } from '../../render/markdown'

function r(text: string): string {
  return renderInline(text)
}

export const paragraphSlots: ParagraphSlotVariant[] = [
  // ── P01 无缩进紧凑 ──
  {
    id: 'compact',
    name: '无缩进紧凑',
    tags: ['modern', 'tech', 'clean'],
    render: (text, ctx) =>
      `<p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.75; color: ${ctx.colors.text}; font-weight: ${ctx.typo.bodyWeight}; letter-spacing: ${ctx.typo.letterSpacing};">${r(text)}</p>`,
  },
  // ── P02 首行缩进 ──
  {
    id: 'indented',
    name: '首行缩进',
    tags: ['chinese', 'traditional', 'reading'],
    render: (text, ctx) =>
      `<p style="margin: 0 0 20px 0; text-indent: 2em; font-size: 16px; line-height: 2.0; color: ${ctx.colors.text}; font-weight: ${ctx.typo.bodyWeight}; letter-spacing: ${ctx.typo.letterSpacing};">${r(text)}</p>`,
  },
  // ── P03 首字下沉 ──
  {
    id: 'drop-cap',
    name: '首字下沉',
    tags: ['magazine', 'editorial', 'premium'],
    render: (text, ctx, isFirst = false) => {
      if (isFirst && text.length > 1) {
        const firstChar = text[0]
        const rest = text.slice(1)
        return `<p style="margin: 0 0 18px 0; font-size: 16px; line-height: 1.9; color: ${ctx.colors.text}; font-weight: ${ctx.typo.bodyWeight}; letter-spacing: ${ctx.typo.letterSpacing};">
  <span style="float: left; font-size: 48px; line-height: 1; font-weight: bold; color: ${ctx.colors.primary}; margin: 2px 8px 0 0; font-family: Georgia, 'Times New Roman', serif;">${firstChar}</span>${r(rest)}
</p>`
      }
      return `<p style="margin: 0 0 18px 0; font-size: 16px; line-height: 1.9; color: ${ctx.colors.text}; font-weight: ${ctx.typo.bodyWeight}; letter-spacing: ${ctx.typo.letterSpacing};">${r(text)}</p>`
    },
  },
  // ── P04 大留白舒展 ──
  {
    id: 'airy-wide',
    name: '大留白舒展',
    tags: ['japanese', 'minimal', 'elegant'],
    render: (text, ctx) =>
      `<p style="margin: 0 0 28px 0; font-size: 15px; line-height: 2.2; color: ${ctx.colors.text}; font-weight: ${ctx.typo.bodyWeight}; letter-spacing: 1px;">${r(text)}</p>`,
  },
  // ── P05 首段放大 ──
  {
    id: 'lead-paragraph',
    name: '首段放大',
    tags: ['magazine', 'editorial', 'impactful'],
    render: (text, ctx, isFirst = false) => {
      const fs = isFirst ? '18px' : '15px'
      const lh = isFirst ? '1.8' : '1.75'
      const fw = isFirst ? '500' : ctx.typo.bodyWeight
      return `<p style="margin: 0 0 ${isFirst ? '24px' : '16px'} 0; font-size: ${fs}; line-height: ${lh}; color: ${ctx.colors.text}; font-weight: ${fw}; letter-spacing: ${ctx.typo.letterSpacing};">${r(text)}</p>`
    },
  },
  // ── P06 两端对齐 ──
  {
    id: 'justified',
    name: '两端对齐',
    tags: ['academic', 'formal', 'serious'],
    render: (text, ctx) =>
      `<p style="margin: 0 0 18px 0; font-size: 15px; line-height: 1.85; color: ${ctx.colors.text}; font-weight: ${ctx.typo.bodyWeight}; letter-spacing: ${ctx.typo.letterSpacing}; text-align: justify;">${r(text)}</p>`,
  },
]

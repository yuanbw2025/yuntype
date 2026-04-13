// 标题插槽 — 10种变体（支持平台缩放）
import { type TitleSlotVariant, px } from './index'
import { renderInline } from '../../render/markdown'

function h(text: string): string {
  return renderInline(text)
}

export const titleSlots: TitleSlotVariant[] = [
  // ── T01 左对齐底线 ──
  {
    id: 'left-underline',
    name: '左对齐底线',
    tags: ['minimal', 'clean', 'professional'],
    render: (text, level, ctx) => {
      const sizes = { 1: 24, 2: 20, 3: 17 }
      const fs = sizes[level as 1 | 2 | 3] ?? 20
      const border = level <= 2
        ? `border-bottom: ${px(2, ctx)} solid ${ctx.colors.primary}; padding-bottom: ${px(8, ctx)};`
        : `border-left: ${px(3, ctx)} solid ${ctx.colors.primary}; padding-left: ${px(10, ctx)};`
      return `<section style="margin: ${px(28, ctx)} 0 ${px(16, ctx)} 0; font-size: ${px(fs, ctx)}; font-weight: ${ctx.typo.headingWeight}; color: ${ctx.colors.primary}; line-height: 1.4; ${border}">${h(text)}</section>`
    },
  },
  // ── T02 居中对称 ──
  {
    id: 'center-symmetric',
    name: '居中对称',
    tags: ['elegant', 'literary', 'formal'],
    render: (text, level, ctx) => {
      const sizes = { 1: 26, 2: 21, 3: 17 }
      const fs = sizes[level as 1 | 2 | 3] ?? 21
      return `<section style="margin: ${px(32, ctx)} 0 ${px(16, ctx)} 0; text-align: center; font-size: ${px(fs, ctx)}; font-weight: ${ctx.typo.headingWeight}; color: ${ctx.colors.primary}; line-height: 1.3; letter-spacing: ${px(2, ctx)};">
  <span style="color: ${ctx.colors.secondary}; margin-right: ${px(8, ctx)};">—</span>${h(text)}<span style="color: ${ctx.colors.secondary}; margin-left: ${px(8, ctx)};">—</span>
</section>`
    },
  },
  // ── T03 色块标签 ──
  {
    id: 'color-badge',
    name: '色块标签',
    tags: ['modern', 'colorful', 'design'],
    render: (text, level, ctx) => {
      const sizes = { 1: 22, 2: 18, 3: 15 }
      const fs = sizes[level as 1 | 2 | 3] ?? 18
      const padV = level === 1 ? 8 : level === 2 ? 6 : 4
      const padH = level === 1 ? 20 : level === 2 ? 16 : 12
      const radius = level === 1 ? 6 : 4
      return `<section style="margin: ${px(28, ctx)} 0 ${px(16, ctx)} 0; font-size: ${px(fs, ctx)}; line-height: 1.4;">
  <span style="background: ${ctx.colors.primary}; color: #FFFFFF; padding: ${px(padV, ctx)} ${px(padH, ctx)}; border-radius: ${px(radius, ctx)}; display: inline-block; font-weight: ${ctx.typo.headingWeight};">${h(text)}</span>
</section>`
    },
  },
  // ── T04 双线框 ──
  {
    id: 'double-border',
    name: '双线框',
    tags: ['academic', 'serious', 'structured'],
    render: (text, level, ctx) => {
      const sizes = { 1: 22, 2: 19, 3: 16 }
      const fs = sizes[level as 1 | 2 | 3] ?? 19
      if (level <= 2) {
        return `<section style="margin: ${px(32, ctx)} 0 ${px(16, ctx)} 0; border: ${px(2, ctx)} double ${ctx.colors.primary}; padding: ${px(10, ctx)} ${px(16, ctx)}; font-size: ${px(fs, ctx)}; font-weight: ${ctx.typo.headingWeight}; color: ${ctx.colors.primary}; text-align: center; line-height: 1.4;">${h(text)}</section>`
      }
      return `<section style="margin: ${px(24, ctx)} 0 ${px(12, ctx)} 0; border-bottom: ${px(2, ctx)} double ${ctx.colors.secondary}; padding-bottom: ${px(6, ctx)}; font-size: ${px(fs, ctx)}; font-weight: ${ctx.typo.headingWeight}; color: ${ctx.colors.primary}; line-height: 1.4;">${h(text)}</section>`
    },
  },
  // ── T05 Banner 横幅 ──
  {
    id: 'banner-full',
    name: 'Banner 横幅',
    tags: ['bold', 'magazine', 'impactful'],
    render: (text, level, ctx) => {
      const sizes = { 1: 24, 2: 20, 3: 16 }
      const fs = sizes[level as 1 | 2 | 3] ?? 20
      if (level <= 2) {
        return `<section style="margin: ${px(28, ctx)} ${px(-20, ctx)} ${px(16, ctx)} ${px(-20, ctx)}; background: ${ctx.colors.primary}; color: #FFFFFF; padding: ${px(14, ctx)} ${px(24, ctx)}; font-size: ${px(fs, ctx)}; font-weight: ${ctx.typo.headingWeight}; line-height: 1.3;">${h(text)}</section>`
      }
      return `<section style="margin: ${px(24, ctx)} 0 ${px(12, ctx)} 0; background: ${ctx.colors.secondary}; color: ${ctx.colors.primary}; padding: ${px(8, ctx)} ${px(16, ctx)}; font-size: ${px(fs, ctx)}; font-weight: ${ctx.typo.headingWeight}; line-height: 1.4;">${h(text)}</section>`
    },
  },
  // ── T06 编号序号 ──
  {
    id: 'numbered',
    name: '编号序号',
    tags: ['structured', 'tutorial', 'step-by-step'],
    render: (text, level, ctx, index = 0) => {
      const sizes = { 1: 22, 2: 19, 3: 16 }
      const fs = sizes[level as 1 | 2 | 3] ?? 19
      const numSize = level === 1 ? 32 : 26
      const num = String(index + 1).padStart(2, '0')
      return `<section style="margin: ${px(28, ctx)} 0 ${px(16, ctx)} 0; font-size: ${px(fs, ctx)}; font-weight: ${ctx.typo.headingWeight}; color: ${ctx.colors.primary}; line-height: 1.4; display: flex; align-items: baseline; gap: ${px(10, ctx)};">
  <span style="font-size: ${px(numSize, ctx)}; font-weight: 800; color: ${ctx.colors.primary}; opacity: 0.3; font-family: Georgia, serif;">${num}</span>
  <span>${h(text)}</span>
</section>`
    },
  },
  // ── T07 左色条 ──
  {
    id: 'left-bar',
    name: '左色条',
    tags: ['professional', 'clean', 'business'],
    render: (text, level, ctx) => {
      const sizes = { 1: 22, 2: 19, 3: 16 }
      const fs = sizes[level as 1 | 2 | 3] ?? 19
      const barW = level === 1 ? 5 : level === 2 ? 4 : 3
      return `<section style="margin: ${px(28, ctx)} 0 ${px(14, ctx)} 0; border-left: ${px(barW, ctx)} solid ${ctx.colors.primary}; padding-left: ${px(14, ctx)}; font-size: ${px(fs, ctx)}; font-weight: ${ctx.typo.headingWeight}; color: ${ctx.colors.primary}; line-height: 1.4;">${h(text)}</section>`
    },
  },
  // ── T08 几何前缀 ──
  {
    id: 'geometric-prefix',
    name: '几何前缀',
    tags: ['geometric', 'design', 'unique'],
    render: (text, level, ctx) => {
      const sizes = { 1: 22, 2: 19, 3: 16 }
      const fs = sizes[level as 1 | 2 | 3] ?? 19
      const icons = { 1: '◆', 2: '◇', 3: '▸' }
      const icon = icons[level as 1 | 2 | 3] ?? '▸'
      return `<section style="margin: ${px(28, ctx)} 0 ${px(14, ctx)} 0; font-size: ${px(fs, ctx)}; font-weight: ${ctx.typo.headingWeight}; color: ${ctx.colors.primary}; line-height: 1.4;">
  <span style="color: ${ctx.colors.primary}; margin-right: ${px(8, ctx)};">${icon}</span>${h(text)}
</section>`
    },
  },
  // ── T09 日式细字 ──
  {
    id: 'zen-minimal',
    name: '日式细字',
    tags: ['japanese', 'minimal', 'elegant'],
    render: (text, level, ctx) => {
      const sizes = { 1: 20, 2: 17, 3: 15 }
      const fs = sizes[level as 1 | 2 | 3] ?? 17
      return `<section style="margin: ${px(36, ctx)} 0 ${px(18, ctx)} 0; text-align: center; font-size: ${px(fs, ctx)}; font-weight: 300; color: ${ctx.colors.primary}; line-height: 1.6; letter-spacing: ${px(4, ctx)};">${h(text)}</section>`
    },
  },
  // ── T10 圆润气泡 ──
  {
    id: 'bubble',
    name: '圆润气泡',
    tags: ['friendly', 'warm', 'cute'],
    render: (text, level, ctx) => {
      const sizes = { 1: 20, 2: 18, 3: 15 }
      const fs = sizes[level as 1 | 2 | 3] ?? 18
      const padV = level === 1 ? 10 : 8
      const padH = level === 1 ? 24 : 20
      return `<section style="margin: ${px(28, ctx)} 0 ${px(14, ctx)} 0; font-size: ${px(fs, ctx)}; line-height: 1.4;">
  <span style="background: ${ctx.colors.secondary}; padding: ${px(padV, ctx)} ${px(padH, ctx)}; border-radius: ${px(20, ctx)}; display: inline-block; font-weight: ${ctx.typo.headingWeight}; color: ${ctx.colors.primary};">${h(text)}</span>
</section>`
    },
  },
]

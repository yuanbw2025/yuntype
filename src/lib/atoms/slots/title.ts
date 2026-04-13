// 标题插槽 — 10种变体
import { type TitleSlotVariant } from './index'
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
      const sizes = { 1: '24px', 2: '20px', 3: '17px' }
      const fs = sizes[level as 1 | 2 | 3] ?? '20px'
      const border = level <= 2
        ? `border-bottom: 2px solid ${ctx.colors.primary}; padding-bottom: 8px;`
        : `border-left: 3px solid ${ctx.colors.primary}; padding-left: 10px;`
      return `<section style="margin: 28px 0 16px 0; font-size: ${fs}; font-weight: ${ctx.typo.headingWeight}; color: ${ctx.colors.primary}; line-height: 1.4; ${border}">${h(text)}</section>`
    },
  },
  // ── T02 居中对称 ──
  {
    id: 'center-symmetric',
    name: '居中对称',
    tags: ['elegant', 'literary', 'formal'],
    render: (text, level, ctx) => {
      const sizes = { 1: '26px', 2: '21px', 3: '17px' }
      const fs = sizes[level as 1 | 2 | 3] ?? '21px'
      return `<section style="margin: 32px 0 16px 0; text-align: center; font-size: ${fs}; font-weight: ${ctx.typo.headingWeight}; color: ${ctx.colors.primary}; line-height: 1.3; letter-spacing: 2px;">
  <span style="color: ${ctx.colors.secondary}; margin-right: 8px;">—</span>${h(text)}<span style="color: ${ctx.colors.secondary}; margin-left: 8px;">—</span>
</section>`
    },
  },
  // ── T03 色块标签 ──
  {
    id: 'color-badge',
    name: '色块标签',
    tags: ['modern', 'colorful', 'design'],
    render: (text, level, ctx) => {
      const sizes = { 1: '22px', 2: '18px', 3: '15px' }
      const fs = sizes[level as 1 | 2 | 3] ?? '18px'
      const pad = level === 1 ? '8px 20px' : level === 2 ? '6px 16px' : '4px 12px'
      const radius = level === 1 ? '6px' : '4px'
      return `<section style="margin: 28px 0 16px 0; font-size: ${fs}; line-height: 1.4;">
  <span style="background: ${ctx.colors.primary}; color: #FFFFFF; padding: ${pad}; border-radius: ${radius}; display: inline-block; font-weight: ${ctx.typo.headingWeight};">${h(text)}</span>
</section>`
    },
  },
  // ── T04 双线框 ──
  {
    id: 'double-border',
    name: '双线框',
    tags: ['academic', 'serious', 'structured'],
    render: (text, level, ctx) => {
      const sizes = { 1: '22px', 2: '19px', 3: '16px' }
      const fs = sizes[level as 1 | 2 | 3] ?? '19px'
      if (level <= 2) {
        return `<section style="margin: 32px 0 16px 0; border: 2px double ${ctx.colors.primary}; padding: 10px 16px; font-size: ${fs}; font-weight: ${ctx.typo.headingWeight}; color: ${ctx.colors.primary}; text-align: center; line-height: 1.4;">${h(text)}</section>`
      }
      return `<section style="margin: 24px 0 12px 0; border-bottom: 2px double ${ctx.colors.secondary}; padding-bottom: 6px; font-size: ${fs}; font-weight: ${ctx.typo.headingWeight}; color: ${ctx.colors.primary}; line-height: 1.4;">${h(text)}</section>`
    },
  },
  // ── T05 Banner 横幅 ──
  {
    id: 'banner-full',
    name: 'Banner 横幅',
    tags: ['bold', 'magazine', 'impactful'],
    render: (text, level, ctx) => {
      const sizes = { 1: '24px', 2: '20px', 3: '16px' }
      const fs = sizes[level as 1 | 2 | 3] ?? '20px'
      if (level <= 2) {
        return `<section style="margin: 28px -20px 16px -20px; background: ${ctx.colors.primary}; color: #FFFFFF; padding: 14px 24px; font-size: ${fs}; font-weight: ${ctx.typo.headingWeight}; line-height: 1.3;">${h(text)}</section>`
      }
      return `<section style="margin: 24px 0 12px 0; background: ${ctx.colors.secondary}; color: ${ctx.colors.primary}; padding: 8px 16px; font-size: ${fs}; font-weight: ${ctx.typo.headingWeight}; line-height: 1.4;">${h(text)}</section>`
    },
  },
  // ── T06 编号序号 ──
  {
    id: 'numbered',
    name: '编号序号',
    tags: ['structured', 'tutorial', 'step-by-step'],
    render: (text, level, ctx, index = 0) => {
      const sizes = { 1: '22px', 2: '19px', 3: '16px' }
      const fs = sizes[level as 1 | 2 | 3] ?? '19px'
      const num = String(index + 1).padStart(2, '0')
      return `<section style="margin: 28px 0 16px 0; font-size: ${fs}; font-weight: ${ctx.typo.headingWeight}; color: ${ctx.colors.primary}; line-height: 1.4; display: flex; align-items: baseline; gap: 10px;">
  <span style="font-size: ${level === 1 ? '32px' : '26px'}; font-weight: 800; color: ${ctx.colors.primary}; opacity: 0.3; font-family: Georgia, serif;">${num}</span>
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
      const sizes = { 1: '22px', 2: '19px', 3: '16px' }
      const fs = sizes[level as 1 | 2 | 3] ?? '19px'
      const barW = level === 1 ? '5px' : level === 2 ? '4px' : '3px'
      return `<section style="margin: 28px 0 14px 0; border-left: ${barW} solid ${ctx.colors.primary}; padding-left: 14px; font-size: ${fs}; font-weight: ${ctx.typo.headingWeight}; color: ${ctx.colors.primary}; line-height: 1.4;">${h(text)}</section>`
    },
  },
  // ── T08 几何前缀 ──
  {
    id: 'geometric-prefix',
    name: '几何前缀',
    tags: ['geometric', 'design', 'unique'],
    render: (text, level, ctx) => {
      const sizes = { 1: '22px', 2: '19px', 3: '16px' }
      const fs = sizes[level as 1 | 2 | 3] ?? '19px'
      const icons = { 1: '◆', 2: '◇', 3: '▸' }
      const icon = icons[level as 1 | 2 | 3] ?? '▸'
      return `<section style="margin: 28px 0 14px 0; font-size: ${fs}; font-weight: ${ctx.typo.headingWeight}; color: ${ctx.colors.primary}; line-height: 1.4;">
  <span style="color: ${ctx.colors.primary}; margin-right: 8px;">${icon}</span>${h(text)}
</section>`
    },
  },
  // ── T09 日式细字 ──
  {
    id: 'zen-minimal',
    name: '日式细字',
    tags: ['japanese', 'minimal', 'elegant'],
    render: (text, level, ctx) => {
      const sizes = { 1: '20px', 2: '17px', 3: '15px' }
      const fs = sizes[level as 1 | 2 | 3] ?? '17px'
      return `<section style="margin: 36px 0 18px 0; text-align: center; font-size: ${fs}; font-weight: 300; color: ${ctx.colors.primary}; line-height: 1.6; letter-spacing: 4px;">${h(text)}</section>`
    },
  },
  // ── T10 圆润气泡 ──
  {
    id: 'bubble',
    name: '圆润气泡',
    tags: ['friendly', 'warm', 'cute'],
    render: (text, level, ctx) => {
      const sizes = { 1: '20px', 2: '18px', 3: '15px' }
      const fs = sizes[level as 1 | 2 | 3] ?? '18px'
      const pad = level === 1 ? '10px 24px' : '8px 20px'
      return `<section style="margin: 28px 0 14px 0; font-size: ${fs}; line-height: 1.4;">
  <span style="background: ${ctx.colors.secondary}; padding: ${pad}; border-radius: 20px; display: inline-block; font-weight: ${ctx.typo.headingWeight}; color: ${ctx.colors.primary};">${h(text)}</span>
</section>`
    },
  },
]

// 15种骨架注册表 — V2 布局引擎核心
// 骨架决定"文档结构"，插槽决定"元素表现"

import { type SlotConfig } from './slots'

// ─── 小红书专属骨架配置 ─────────────────────────────
export type CoverVariantType = 'classic' | 'bold' | 'minimal' | 'card' | 'magazine'
export type ContentLayoutType = 'standard' | 'card-wrapped' | 'alternating-bg' | 'timeline-rail'
export type PageNumberStyle = 'right' | 'center' | 'fraction' | 'dot'

export interface BlueprintXhsConfig {
  /** 封面风格偏好 */
  coverVariant: CoverVariantType
  /** 内容页布局 */
  contentLayout: ContentLayoutType
  /** 页面装饰 */
  pageDecoration: {
    headerBar: boolean
    footerLine: boolean
    pageNumberStyle: PageNumberStyle
    brandPosition: 'bottom-center' | 'bottom-right' | 'none'
  }
  /** 尾页风格 */
  endingStyle: 'standard' | 'minimal' | 'card'
}

export interface Blueprint {
  id: string
  name: string
  desc: string
  icon: string
  /** 默认插槽搭配（选骨架后一键就位） */
  defaultSlots: SlotConfig
  /** 骨架级容器样式 */
  containerStyle: (colors: { contentBg: string; text: string; pageBg: string }) => string
  /** 内容区 padding */
  contentPadding: string
  tags: string[]
  /** 小红书专属配置 */
  xhs: BlueprintXhsConfig
}

export const blueprints: Blueprint[] = [
  // ═══════════ 极简系 ═══════════
  {
    id: 'B01', name: '极简清爽', desc: '无装饰，内容为王', icon: '📝',
    defaultSlots: {
      title: 'left-underline', quote: 'left-bar', list: 'dot',
      divider: 'thin-line', paragraph: 'compact', section: 'flat-flow',
    },
    containerStyle: (c) => `background-color: ${c.contentBg}; color: ${c.text};`,
    contentPadding: '16px 20px',
    tags: ['minimal', 'clean', 'professional'],
    xhs: {
      coverVariant: 'minimal',
      contentLayout: 'standard',
      pageDecoration: { headerBar: false, footerLine: true, pageNumberStyle: 'right', brandPosition: 'bottom-center' },
      endingStyle: 'minimal',
    },
  },
  {
    id: 'B02', name: '日式留白', desc: '大量留白，禅意呼吸感', icon: '🍵',
    defaultSlots: {
      title: 'zen-minimal', quote: 'dashed-frame', list: 'dash-prefix',
      divider: 'single-circle', paragraph: 'airy-wide', section: 'flat-flow',
    },
    containerStyle: (c) => `background-color: ${c.contentBg}; color: ${c.text};`,
    contentPadding: '24px 28px',
    tags: ['japanese', 'minimal', 'elegant'],
    xhs: {
      coverVariant: 'minimal',
      contentLayout: 'standard',
      pageDecoration: { headerBar: false, footerLine: false, pageNumberStyle: 'center', brandPosition: 'bottom-center' },
      endingStyle: 'minimal',
    },
  },

  // ═══════════ 线条系 ═══════════
  {
    id: 'B03', name: '线条主导', desc: '以线条分割和强调结构', icon: '📏',
    defaultSlots: {
      title: 'left-underline', quote: 'left-bar', list: 'arrow',
      divider: 'gradient-line', paragraph: 'compact', section: 'divider-separated',
    },
    containerStyle: (c) => `background-color: ${c.contentBg}; color: ${c.text};`,
    contentPadding: '16px 20px',
    tags: ['structured', 'clean', 'professional'],
    xhs: {
      coverVariant: 'classic',
      contentLayout: 'standard',
      pageDecoration: { headerBar: true, footerLine: true, pageNumberStyle: 'right', brandPosition: 'bottom-right' },
      endingStyle: 'standard',
    },
  },
  {
    id: 'B04', name: '双线学术', desc: '双线框 + 两端对齐，论文风', icon: '🎓',
    defaultSlots: {
      title: 'double-border', quote: 'double-border', list: 'circle-number',
      divider: 'double-line', paragraph: 'justified', section: 'flat-flow',
    },
    containerStyle: (c) => `background-color: ${c.contentBg}; color: ${c.text};`,
    contentPadding: '20px 24px',
    tags: ['academic', 'formal', 'serious'],
    xhs: {
      coverVariant: 'magazine',
      contentLayout: 'standard',
      pageDecoration: { headerBar: true, footerLine: true, pageNumberStyle: 'fraction', brandPosition: 'bottom-center' },
      endingStyle: 'standard',
    },
  },

  // ═══════════ 色块系 ═══════════
  {
    id: 'B05', name: '色块标签', desc: '标题用色块高亮，现代感强', icon: '🏷️',
    defaultSlots: {
      title: 'color-badge', quote: 'rounded-card', list: 'square',
      divider: 'thick-line', paragraph: 'compact', section: 'flat-flow',
    },
    containerStyle: (c) => `background-color: ${c.contentBg}; color: ${c.text};`,
    contentPadding: '16px 20px',
    tags: ['modern', 'colorful', 'design'],
    xhs: {
      coverVariant: 'bold',
      contentLayout: 'standard',
      pageDecoration: { headerBar: true, footerLine: false, pageNumberStyle: 'right', brandPosition: 'bottom-right' },
      endingStyle: 'standard',
    },
  },
  {
    id: 'B06', name: '交替色带', desc: '奇偶节区交替底色', icon: '🌈',
    defaultSlots: {
      title: 'left-bar', quote: 'rounded-card', list: 'dot',
      divider: 'thin-line', paragraph: 'compact', section: 'alternating-bands',
    },
    containerStyle: (c) => `background-color: ${c.contentBg}; color: ${c.text};`,
    contentPadding: '16px 20px',
    tags: ['structured', 'colorful', 'magazine'],
    xhs: {
      coverVariant: 'classic',
      contentLayout: 'alternating-bg',
      pageDecoration: { headerBar: false, footerLine: true, pageNumberStyle: 'center', brandPosition: 'bottom-center' },
      endingStyle: 'standard',
    },
  },

  // ═══════════ 卡片系 ═══════════
  {
    id: 'B07', name: '卡片模块', desc: '每节独立卡片，清晰分区', icon: '🃏',
    defaultSlots: {
      title: 'left-bar', quote: 'highlight-box', list: 'card-items',
      divider: 'dots', paragraph: 'compact', section: 'card-shadow',
    },
    containerStyle: (c) => `background-color: ${c.pageBg}; color: ${c.text};`,
    contentPadding: '12px 16px',
    tags: ['card', 'modular', 'structured'],
    xhs: {
      coverVariant: 'card',
      contentLayout: 'card-wrapped',
      pageDecoration: { headerBar: false, footerLine: false, pageNumberStyle: 'dot', brandPosition: 'bottom-center' },
      endingStyle: 'card',
    },
  },
  {
    id: 'B08', name: '气泡圆润', desc: '圆角气泡包裹，亲和力强', icon: '💬',
    defaultSlots: {
      title: 'bubble', quote: 'bubble', list: 'diamond',
      divider: 'dots', paragraph: 'compact', section: 'card-shadow',
    },
    containerStyle: (c) => `background-color: ${c.pageBg}; color: ${c.text};`,
    contentPadding: '12px 16px',
    tags: ['friendly', 'warm', 'cute'],
    xhs: {
      coverVariant: 'card',
      contentLayout: 'card-wrapped',
      pageDecoration: { headerBar: false, footerLine: false, pageNumberStyle: 'dot', brandPosition: 'bottom-center' },
      endingStyle: 'card',
    },
  },

  // ═══════════ 杂志系 ═══════════
  {
    id: 'B09', name: '杂志编辑', desc: '首段放大 + Pull-quote 居中引述', icon: '📰',
    defaultSlots: {
      title: 'banner-full', quote: 'pull-quote', list: 'arrow',
      divider: 'gradient-line', paragraph: 'lead-paragraph', section: 'flat-flow',
    },
    containerStyle: (c) => `background-color: ${c.contentBg}; color: ${c.text};`,
    contentPadding: '20px 24px',
    tags: ['magazine', 'editorial', 'premium'],
    xhs: {
      coverVariant: 'magazine',
      contentLayout: 'standard',
      pageDecoration: { headerBar: true, footerLine: true, pageNumberStyle: 'fraction', brandPosition: 'bottom-right' },
      endingStyle: 'standard',
    },
  },
  {
    id: 'B10', name: '首字下沉', desc: '首段首字放大，古典杂志感', icon: '🔤',
    defaultSlots: {
      title: 'center-symmetric', quote: 'big-quotes', list: 'dot',
      divider: 'ornament', paragraph: 'drop-cap', section: 'divider-separated',
    },
    containerStyle: (c) => `background-color: ${c.contentBg}; color: ${c.text};`,
    contentPadding: '20px 24px',
    tags: ['literary', 'editorial', 'classic'],
    xhs: {
      coverVariant: 'classic',
      contentLayout: 'standard',
      pageDecoration: { headerBar: false, footerLine: true, pageNumberStyle: 'center', brandPosition: 'bottom-center' },
      endingStyle: 'standard',
    },
  },

  // ═══════════ 结构系 ═══════════
  {
    id: 'B11', name: '编号步骤', desc: '标题自动编号，教程风格', icon: '🔢',
    defaultSlots: {
      title: 'numbered', quote: 'highlight-box', list: 'checklist',
      divider: 'thin-line', paragraph: 'compact', section: 'flat-flow',
    },
    containerStyle: (c) => `background-color: ${c.contentBg}; color: ${c.text};`,
    contentPadding: '16px 20px',
    tags: ['tutorial', 'step-by-step', 'structured'],
    xhs: {
      coverVariant: 'bold',
      contentLayout: 'standard',
      pageDecoration: { headerBar: true, footerLine: false, pageNumberStyle: 'right', brandPosition: 'bottom-right' },
      endingStyle: 'standard',
    },
  },
  {
    id: 'B12', name: '时间线', desc: '左侧轨道 + 圆点节点', icon: '📍',
    defaultSlots: {
      title: 'left-bar', quote: 'left-bar', list: 'arrow',
      divider: 'dots', paragraph: 'compact', section: 'timeline',
    },
    containerStyle: (c) => `background-color: ${c.contentBg}; color: ${c.text};`,
    contentPadding: '16px 20px 16px 8px',
    tags: ['timeline', 'step-by-step', 'structured'],
    xhs: {
      coverVariant: 'classic',
      contentLayout: 'timeline-rail',
      pageDecoration: { headerBar: false, footerLine: true, pageNumberStyle: 'right', brandPosition: 'bottom-center' },
      endingStyle: 'standard',
    },
  },

  // ═══════════ 文学系 ═══════════
  {
    id: 'B13', name: '文艺散文', desc: '居中标题 + 首行缩进 + 大引号', icon: '✒️',
    defaultSlots: {
      title: 'center-symmetric', quote: 'big-quotes', list: 'dash-prefix',
      divider: 'ornament', paragraph: 'indented', section: 'flat-flow',
    },
    containerStyle: (c) => `background-color: ${c.contentBg}; color: ${c.text};`,
    contentPadding: '20px 28px',
    tags: ['literary', 'poetic', 'elegant'],
    xhs: {
      coverVariant: 'minimal',
      contentLayout: 'standard',
      pageDecoration: { headerBar: false, footerLine: false, pageNumberStyle: 'center', brandPosition: 'bottom-center' },
      endingStyle: 'minimal',
    },
  },

  // ═══════════ 商务系 ═══════════
  {
    id: 'B14', name: '商务左标签', desc: '左侧竖排标签 + 右侧内容', icon: '💼',
    defaultSlots: {
      title: 'left-bar', quote: 'highlight-box', list: 'square',
      divider: 'thin-line', paragraph: 'justified', section: 'left-label',
    },
    containerStyle: (c) => `background-color: ${c.contentBg}; color: ${c.text};`,
    contentPadding: '16px 20px',
    tags: ['business', 'professional', 'clean'],
    xhs: {
      coverVariant: 'classic',
      contentLayout: 'standard',
      pageDecoration: { headerBar: true, footerLine: true, pageNumberStyle: 'right', brandPosition: 'bottom-right' },
      endingStyle: 'standard',
    },
  },

  // ═══════════ 几何系 ═══════════
  {
    id: 'B15', name: '几何装饰', desc: '◆▸◇ 几何图形点缀', icon: '🔷',
    defaultSlots: {
      title: 'geometric-prefix', quote: 'double-border', list: 'arrow',
      divider: 'diamond', paragraph: 'compact', section: 'flat-flow',
    },
    containerStyle: (c) => `background-color: ${c.contentBg}; color: ${c.text};`,
    contentPadding: '16px 20px',
    tags: ['geometric', 'unique', 'design'],
    xhs: {
      coverVariant: 'bold',
      contentLayout: 'standard',
      pageDecoration: { headerBar: true, footerLine: true, pageNumberStyle: 'right', brandPosition: 'bottom-right' },
      endingStyle: 'standard',
    },
  },
]

/** 根据 ID 获取骨架 */
export function getBlueprint(id: string): Blueprint {
  return blueprints.find(b => b.id === id) ?? blueprints[0]
}

// 插槽系统 — V2 骨架引擎的核心
// 每种插槽定义一类元素的渲染变体

import { type ColorScheme } from '../colors'
import { type TypographySet } from '../typography'
import { titleSlots } from './title'
import { quoteSlots } from './quote'
import { listSlots } from './list'
import { dividerSlots } from './divider'
import { paragraphSlots } from './paragraph'
import { sectionSlots } from './section'

// ─── 渲染上下文（传给每个插槽渲染函数）─────────────────
export interface RenderContext {
  colors: ColorScheme['colors']
  typo: TypographySet['wechat']
  isDark: boolean
}

// ─── 各插槽的渲染函数签名 ─────────────────────────────
export interface TitleSlotVariant {
  id: string
  name: string
  tags: string[]
  render: (text: string, level: number, ctx: RenderContext, index?: number) => string
}

export interface QuoteSlotVariant {
  id: string
  name: string
  tags: string[]
  render: (content: string, ctx: RenderContext) => string
}

export interface ListSlotVariant {
  id: string
  name: string
  tags: string[]
  render: (items: string[], ordered: boolean, ctx: RenderContext) => string
}

export interface DividerSlotVariant {
  id: string
  name: string
  tags: string[]
  render: (ctx: RenderContext) => string
}

export interface ParagraphSlotVariant {
  id: string
  name: string
  tags: string[]
  render: (text: string, ctx: RenderContext, isFirst?: boolean) => string
}

export interface SectionSlotVariant {
  id: string
  name: string
  tags: string[]
  render: (innerHtml: string, heading: string | null, ctx: RenderContext, index: number) => string
}

// ─── 插槽类型联合 ──────────────────────────────────────
export type SlotType = 'title' | 'quote' | 'list' | 'divider' | 'paragraph' | 'section'

export type SlotVariant = TitleSlotVariant | QuoteSlotVariant | ListSlotVariant | DividerSlotVariant | ParagraphSlotVariant | SectionSlotVariant

// ─── 统一注册表 ─────────────────────────────────────────
export const slotRegistry = {
  title: titleSlots,
  quote: quoteSlots,
  list: listSlots,
  divider: dividerSlots,
  paragraph: paragraphSlots,
  section: sectionSlots,
} as const

// ─── 查询函数 ───────────────────────────────────────────

/** 根据类型和 ID 获取插槽变体 */
export function getSlot<T extends SlotType>(type: T, id: string): (typeof slotRegistry)[T][number] {
  const slots = slotRegistry[type]
  return (slots.find((s: { id: string }) => s.id === id) ?? slots[0]) as (typeof slotRegistry)[T][number]
}

/** 获取某类型所有变体（用于下拉菜单） */
export function listSlotVariants(type: SlotType): { id: string; name: string }[] {
  return slotRegistry[type].map((s: { id: string; name: string }) => ({ id: s.id, name: s.name }))
}

// ─── 插槽配置 ───────────────────────────────────────────
export interface SlotConfig {
  title: string
  quote: string
  list: string
  divider: string
  paragraph: string
  section: string
}

export interface SlotLocks {
  title: boolean
  quote: boolean
  list: boolean
  divider: boolean
  paragraph: boolean
  section: boolean
}

// ─── 导出所有子模块 ─────────────────────────────────────
export { titleSlots } from './title'
export { quoteSlots } from './quote'
export { listSlots } from './list'
export { dividerSlots } from './divider'
export { paragraphSlots } from './paragraph'
export { sectionSlots } from './section'

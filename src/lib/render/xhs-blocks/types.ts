// XHS 构建块系统 — 类型定义

import type { ColorScheme } from '../../atoms/colors'
import type { BlueprintXhsConfig } from '../../atoms/blueprints'
import type { XhsConfig } from '../xiaohongshu'

/** 渲染上下文 — 所有 block 共享 */
export interface BlockContext {
  colors: ColorScheme['colors']
  config: XhsConfig
  xhs: BlueprintXhsConfig
  pageIndex: number
  totalPages: number
  pageType: 'cover' | 'content' | 'ending'
}

/** 标题块数据 */
export interface TitleData {
  text: string
  level: number          // 1 = H1 封面 / 2 = H2 节标题 / 3 = H3 小标题
  subtitle?: string
  index?: number          // 可选编号（供 numbered-badge 使用）
}

/** 段落块数据 */
export interface ParagraphData {
  text: string            // 已经 inline-render 过的 HTML
}

/** 列表块数据 */
export interface ListData {
  items: string[]         // inline-render 过的 HTML
  ordered: boolean
}

/** 引用块数据 */
export interface QuoteData {
  text: string
}

/** 数据联合（给 registry 内部用） */
export type BlockData = TitleData | ParagraphData | ListData | QuoteData

/** 单个 variant 渲染函数签名 */
export type VariantRenderer<D> = (ctx: BlockContext, data: D) => string

/** 注册表 — 每种 block 类型 → variant id → 渲染函数 */
export interface BlockRegistry {
  title: Record<string, VariantRenderer<TitleData>>
  paragraph: Record<string, VariantRenderer<ParagraphData>>
  list: Record<string, VariantRenderer<ListData>>
  quote: Record<string, VariantRenderer<QuoteData>>
}

/** 骨架→variant 映射 */
export interface BlueprintVariantMap {
  title: string
  paragraph: string
  list: string
  quote: string
  decorator: 'corner-circles' | 'edge-strip' | 'dot-pattern'
}

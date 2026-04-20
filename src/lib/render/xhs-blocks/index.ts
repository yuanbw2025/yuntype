// XHS 构建块 — 统一导出 + 注册表

import { titleVariants } from './title-block'
import { paragraphVariants } from './paragraph-block'
import { listVariants } from './list-block'
import { quoteVariants } from './quote-block'
import { decoratorVariants } from './decorator'
import type { BlockRegistry } from './types'

export * from './types'
export { renderTopBar, renderBottomBar } from './chrome'
export { decoratorVariants }

/** 全局查表：block.type + variant id → 渲染函数 */
export const blockRegistry: BlockRegistry = {
  title: titleVariants,
  paragraph: paragraphVariants,
  list: listVariants,
  quote: quoteVariants,
}

/** variant 不存在时的 fallback */
export const DEFAULT_VARIANTS = {
  title: 'plain',
  paragraph: 'plain-text',
  list: 'numbered-cards',
  quote: 'left-bar',
  decorator: 'corner-circles',
} as const

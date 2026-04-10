// 原子组合引擎 — 随机组合 + 按ID获取

import { colorSchemes, type ColorScheme } from './colors'
import { layoutTemplates, type LayoutTemplate } from './layouts'
import { decorationSets, type DecorationSet } from './decorations'
import { typographySets, type TypographySet } from './typography'

export type { ColorScheme, LayoutTemplate, DecorationSet, TypographySet }
export { colorSchemes, layoutTemplates, decorationSets, typographySets }

export interface StyleCombo {
  color: ColorScheme
  layout: LayoutTemplate
  decoration: DecorationSet
  typography: TypographySet
}

export interface AtomIds {
  colorId: string
  layoutId: string
  decorationId: string
  typographyId: string
}

/** 根据 ID 获取完整组合 */
export function getStyleCombo(ids: AtomIds): StyleCombo {
  return {
    color: colorSchemes.find(c => c.id === ids.colorId) ?? colorSchemes[0],
    layout: layoutTemplates.find(l => l.id === ids.layoutId) ?? layoutTemplates[0],
    decoration: decorationSets.find(d => d.id === ids.decorationId) ?? decorationSets[0],
    typography: typographySets.find(t => t.id === ids.typographyId) ?? typographySets[0],
  }
}

/** 随机选一个 */
function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** 生成随机原子ID组合 */
export function randomAtomIds(): AtomIds {
  return {
    colorId: randomPick(colorSchemes).id,
    layoutId: randomPick(layoutTemplates).id,
    decorationId: randomPick(decorationSets).id,
    typographyId: randomPick(typographySets).id,
  }
}

/** 获取组合的名称描述 */
export function getComboName(ids: AtomIds): string {
  const combo = getStyleCombo(ids)
  return `${combo.color.name} · ${combo.layout.name} · ${combo.decoration.name} · ${combo.typography.name}`
}

/** 总组合数 */
export const TOTAL_COMBOS = colorSchemes.length * layoutTemplates.length * decorationSets.length * typographySets.length

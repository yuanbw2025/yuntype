// 原子组合引擎 — V2 骨架系统

import { colorSchemes, type ColorScheme, type ColorOverride } from './colors'
import { layoutTemplates, type LayoutTemplate } from './layouts'
import { decorationSets, type DecorationSet } from './decorations'
import { typographySets, type TypographySet } from './typography'
import { blueprints, getBlueprint, type Blueprint } from './blueprints'
import { type SlotConfig, type SlotLocks } from './slots'
import { coordinatedPick, coordinatedPickWithBlueprint, coordinatedPickSlots, coordinatedPickByScene, tagAffinity, debugAffinity } from './coordination'
import { scenePresetsV2, analyzeArticleTags, recommendPresets, getScenePreset, type ScenePresetV2 } from './presets-v2'

export type { ColorScheme, ColorOverride, LayoutTemplate, DecorationSet, TypographySet, Blueprint, SlotConfig, SlotLocks, ScenePresetV2 }
export { colorSchemes, layoutTemplates, decorationSets, typographySets, blueprints, getBlueprint }
export { coordinatedPick, coordinatedPickWithBlueprint, coordinatedPickSlots, coordinatedPickByScene, tagAffinity, debugAffinity }
export { scenePresetsV2, analyzeArticleTags, recommendPresets, getScenePreset }

// ─── V2 骨架系统 ─────────────────────────────────────

/** 随机选一个（内部工具函数） */
function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export interface StyleComboV2 {
  color: ColorScheme
  typography: TypographySet
  blueprint: Blueprint
  slots: SlotConfig
}

export interface AtomIdsV2 {
  colorId: string
  typographyId: string
  blueprintId: string
  slots: SlotConfig
  colorOverride?: ColorOverride
}

/** 根据 V2 ID 获取完整组合（colorOverride 会 merge 进 colors） */
export function getStyleComboV2(ids: AtomIdsV2): StyleComboV2 {
  const bp = getBlueprint(ids.blueprintId)
  const baseColor = colorSchemes.find(c => c.id === ids.colorId) ?? colorSchemes[0]
  const color: ColorScheme = ids.colorOverride
    ? { ...baseColor, colors: { ...baseColor.colors, ...ids.colorOverride } }
    : baseColor
  return {
    color,
    typography: typographySets.find(t => t.id === ids.typographyId) ?? typographySets[0],
    blueprint: bp,
    slots: ids.slots,
  }
}

/** 生成随机 V2 原子组合（使用协调引擎，基于标签亲和度加权选择） */
export function randomAtomIdsV2(): AtomIdsV2 {
  return coordinatedPick()
}

/** 纯随机 V2（不使用协调引擎，用于对比测试） */
export function pureRandomAtomIdsV2(): AtomIdsV2 {
  const bp = randomPick(blueprints)
  return {
    colorId: randomPick(colorSchemes).id,
    typographyId: randomPick(typographySets).id,
    blueprintId: bp.id,
    slots: { ...bp.defaultSlots },
  }
}

/** V2 组合名称 */
export function getComboNameV2(ids: AtomIdsV2): string {
  const combo = getStyleComboV2(ids)
  return `${combo.blueprint.icon} ${combo.blueprint.name} · ${combo.color.name} · ${combo.typography.name}`
}

/** V2 总组合数（骨架×配色×字体，不含插槽变体） */
export const TOTAL_COMBOS_V2 = blueprints.length * colorSchemes.length * typographySets.length

/** 默认 V2 配置 */
export function defaultAtomIdsV2(): AtomIdsV2 {
  const bp = blueprints[0]
  return {
    colorId: 'L1',
    typographyId: 'F1',
    blueprintId: bp.id,
    slots: { ...bp.defaultSlots },
  }
}

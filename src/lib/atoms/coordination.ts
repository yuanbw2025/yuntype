// ═══════════════════════════════════════════════════════════════
// 协调引擎 — Phase 6
// 基于标签亲和度的智能组合选择，替代纯随机
// ═══════════════════════════════════════════════════════════════

import { blueprints, type Blueprint } from './blueprints'
import { colorSchemes, type ColorScheme } from './colors'
import { typographySets, type TypographySet } from './typography'
import { slotRegistry, type SlotType, type SlotConfig } from './slots'

// ─── 标签亲和度计算 ─────────────────────────────────────

/** 计算两组标签的亲和度分数（共享标签数量） */
export function tagAffinity(tagsA: string[], tagsB: string[]): number {
  let score = 0
  for (const t of tagsA) {
    if (tagsB.includes(t)) score++
  }
  return score
}

/** 合并多组标签为去重集合 */
function mergeTags(...tagArrays: string[][]): string[] {
  const set = new Set<string>()
  for (const tags of tagArrays) {
    for (const t of tags) set.add(t)
  }
  return [...set]
}

// ─── 加权随机选择 ────────────────────────────────────────

/**
 * 加权随机选择
 * weight(item) 返回亲和度加分（≥0）
 * 最终权重 = baseWeight + affinityBoost * weight(item)
 * baseWeight=1 保证所有候选项都有机会被选中
 * affinityBoost 控制标签匹配的影响力
 */
function weightedPick<T>(
  items: T[],
  weight: (item: T) => number,
  baseWeight = 1,
  affinityBoost = 3,
): T {
  const weights = items.map(item => baseWeight + affinityBoost * weight(item))
  const total = weights.reduce((sum, w) => sum + w, 0)
  let r = Math.random() * total
  for (let i = 0; i < items.length; i++) {
    r -= weights[i]
    if (r <= 0) return items[i]
  }
  return items[items.length - 1]
}

// ─── 协调选择器 ──────────────────────────────────────────

/** 根据种子标签选择最亲和的配色 */
function pickColor(seedTags: string[]): ColorScheme {
  return weightedPick(colorSchemes, (c) => tagAffinity(c.tags, seedTags))
}

/** 根据种子标签选择最亲和的字体 */
function pickTypography(seedTags: string[]): TypographySet {
  return weightedPick(typographySets, (t) => tagAffinity(t.tags, seedTags))
}

/** 为指定插槽类型选择最亲和的变体 */
function pickSlotVariant(type: SlotType, seedTags: string[]): string {
  const variants = slotRegistry[type] as readonly { id: string; tags: string[] }[]
  const picked = weightedPick(
    [...variants],
    (v) => tagAffinity(v.tags, seedTags),
  )
  return picked.id
}

/** 协调选择所有 6 个插槽 */
function pickAllSlots(seedTags: string[]): SlotConfig {
  return {
    title: pickSlotVariant('title', seedTags),
    quote: pickSlotVariant('quote', seedTags),
    list: pickSlotVariant('list', seedTags),
    divider: pickSlotVariant('divider', seedTags),
    paragraph: pickSlotVariant('paragraph', seedTags),
    section: pickSlotVariant('section', seedTags),
  }
}

// ─── 主入口 ──────────────────────────────────────────────

export interface CoordinationResult {
  colorId: string
  typographyId: string
  blueprintId: string
  slots: SlotConfig
}

/**
 * 协调引擎主函数 — 基于标签亲和度生成美学协调的组合
 *
 * 流程：
 *   1. 随机选取骨架 Blueprint 作为风格种子
 *   2. 基于骨架标签 → 加权选配色（共享标签越多概率越高）
 *   3. 合并骨架+配色标签 → 加权选字体
 *   4. 合并全部标签 → 加权选每个插槽变体
 *
 * 特性：
 *   - baseWeight=1 保证"意外惊喜"（任何组合都可能出现）
 *   - affinityBoost=3 让标签匹配项获得 3× 额外权重
 *   - 例: 骨架 tags=['literary','poetic','elegant']
 *         → 配色 L5(literary,art,poetic) 亲和度=2 → 权重=1+3×2=7
 *         → 配色 L4(business,tech,minimal) 亲和度=0 → 权重=1+3×0=1
 *         → L5 被选中概率约为 L4 的 7 倍
 */
export function coordinatedPick(): CoordinationResult {
  // Step 1: 随机种子骨架
  const bp = blueprints[Math.floor(Math.random() * blueprints.length)]

  // Step 2: 基于骨架标签选配色
  const color = pickColor(bp.tags)

  // Step 3: 合并骨架+配色标签 → 选字体
  const tagsL2 = mergeTags(bp.tags, color.tags)
  const typo = pickTypography(tagsL2)

  // Step 4: 合并全部标签 → 选每个插槽
  const tagsL3 = mergeTags(bp.tags, color.tags, typo.tags)
  const slots = pickAllSlots(tagsL3)

  return {
    colorId: color.id,
    typographyId: typo.id,
    blueprintId: bp.id,
    slots,
  }
}

/**
 * 在指定骨架上协调选择配色、字体、插槽
 * 用于用户锁定骨架后 re-roll 其他维度
 */
export function coordinatedPickWithBlueprint(bp: Blueprint): CoordinationResult {
  const color = pickColor(bp.tags)
  const tagsL2 = mergeTags(bp.tags, color.tags)
  const typo = pickTypography(tagsL2)
  const tagsL3 = mergeTags(bp.tags, color.tags, typo.tags)
  const slots = pickAllSlots(tagsL3)

  return {
    colorId: color.id,
    typographyId: typo.id,
    blueprintId: bp.id,
    slots,
  }
}

/**
 * 在已有组合上重新协调插槽（保持骨架、配色、字体不变）
 * 用于用户只想刷新插槽搭配
 */
export function coordinatedPickSlots(
  bpTags: string[],
  colorTags: string[],
  typoTags: string[],
): SlotConfig {
  const allTags = mergeTags(bpTags, colorTags, typoTags)
  return pickAllSlots(allTags)
}

// ─── 场景驱动协调 ────────────────────────────────────────

/**
 * 基于场景标签生成协调组合
 * 与 coordinatedPick() 不同的是，种子标签来自外部（如文章分析）
 * 而不是随机骨架
 */
export function coordinatedPickByScene(sceneTags: string[]): CoordinationResult {
  // 基于场景标签选骨架
  const bp = weightedPick(blueprints, (b) => tagAffinity(b.tags, sceneTags))

  // 合并骨架+场景标签选配色
  const combinedTags = mergeTags(bp.tags, sceneTags)
  const color = pickColor(combinedTags)

  // 合并全部标签选字体
  const tagsL2 = mergeTags(combinedTags, color.tags)
  const typo = pickTypography(tagsL2)

  // 合并全部标签选插槽
  const tagsL3 = mergeTags(tagsL2, typo.tags)
  const slots = pickAllSlots(tagsL3)

  return {
    colorId: color.id,
    typographyId: typo.id,
    blueprintId: bp.id,
    slots,
  }
}

// ─── 调试 / 可视化 ──────────────────────────────────────

/** 输出亲和度详情（开发调试用） */
export function debugAffinity(bpId: string): {
  blueprint: string
  colors: { id: string; name: string; score: number }[]
  typography: { id: string; name: string; score: number }[]
} {
  const bp = blueprints.find(b => b.id === bpId) ?? blueprints[0]
  return {
    blueprint: `${bp.icon} ${bp.name} [${bp.tags.join(', ')}]`,
    colors: colorSchemes.map(c => ({
      id: c.id,
      name: c.name,
      score: tagAffinity(c.tags, bp.tags),
    })).sort((a, b) => b.score - a.score),
    typography: typographySets.map(t => ({
      id: t.id,
      name: t.name,
      score: tagAffinity(t.tags, bp.tags),
    })).sort((a, b) => b.score - a.score),
  }
}

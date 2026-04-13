// localStorage 存储模块 — 品牌预设 + 历史记录

import type { AtomIds, AtomIdsV2 } from './atoms'
import type { TuneParams } from './atoms/presets'

// ═══════════════════════════════════════
//  品牌预设（用户保存的常用组合）
// ═══════════════════════════════════════

export interface BrandPreset {
  id: string
  name: string
  atomIds: AtomIds
  tuneParams: TuneParams
  createdAt: number
}

const BRAND_KEY = 'yuntype_brand_presets'

export function loadBrandPresets(): BrandPreset[] {
  try {
    const raw = localStorage.getItem(BRAND_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function saveBrandPresets(presets: BrandPreset[]): void {
  localStorage.setItem(BRAND_KEY, JSON.stringify(presets))
}

export function addBrandPreset(name: string, atomIds: AtomIds, tuneParams: TuneParams): BrandPreset {
  const presets = loadBrandPresets()
  const preset: BrandPreset = {
    id: `bp_${Date.now()}`,
    name,
    atomIds,
    tuneParams,
    createdAt: Date.now(),
  }
  presets.unshift(preset)
  // 最多保存 20 个
  if (presets.length > 20) presets.pop()
  saveBrandPresets(presets)
  return preset
}

export function removeBrandPreset(id: string): void {
  const presets = loadBrandPresets().filter(p => p.id !== id)
  saveBrandPresets(presets)
}

// ═══════════════════════════════════════
//  历史记录（最近10次排版方案）
// ═══════════════════════════════════════

export interface HistoryEntry {
  atomIds: AtomIds
  tuneParams: TuneParams
  timestamp: number
  comboName: string
}

const HISTORY_KEY = 'yuntype_history'
const MAX_HISTORY = 10

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function pushHistory(entry: Omit<HistoryEntry, 'timestamp'>): void {
  const history = loadHistory()

  // 避免重复：如果最近一条和新的一样就跳过
  if (history.length > 0) {
    const last = history[0]
    if (
      last.atomIds.colorId === entry.atomIds.colorId &&
      last.atomIds.layoutId === entry.atomIds.layoutId &&
      last.atomIds.decorationId === entry.atomIds.decorationId &&
      last.atomIds.typographyId === entry.atomIds.typographyId
    ) {
      return // 重复，不记录
    }
  }

  history.unshift({ ...entry, timestamp: Date.now() })
  if (history.length > MAX_HISTORY) history.pop()
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

// ═══════════════════════════════════════
//  V2 品牌预设
// ═══════════════════════════════════════

export interface BrandPresetV2 {
  id: string
  name: string
  atomIdsV2: AtomIdsV2
  createdAt: number
}

const BRAND_V2_KEY = 'yuntype_brand_presets_v2'

export function loadBrandPresetsV2(): BrandPresetV2[] {
  try {
    const raw = localStorage.getItem(BRAND_V2_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function saveBrandPresetsV2(presets: BrandPresetV2[]): void {
  localStorage.setItem(BRAND_V2_KEY, JSON.stringify(presets))
}

export function addBrandPresetV2(name: string, atomIdsV2: AtomIdsV2): BrandPresetV2 {
  const presets = loadBrandPresetsV2()
  const preset: BrandPresetV2 = {
    id: `bpv2_${Date.now()}`,
    name,
    atomIdsV2,
    createdAt: Date.now(),
  }
  presets.unshift(preset)
  if (presets.length > 20) presets.pop()
  saveBrandPresetsV2(presets)
  return preset
}

export function removeBrandPresetV2(id: string): void {
  const presets = loadBrandPresetsV2().filter(p => p.id !== id)
  saveBrandPresetsV2(presets)
}

// ═══════════════════════════════════════
//  新手引导标记
// ═══════════════════════════════════════

const GUIDE_KEY = 'yuntype_guide_done'

export function isGuideDone(): boolean {
  return localStorage.getItem(GUIDE_KEY) === '1'
}

export function markGuideDone(): void {
  localStorage.setItem(GUIDE_KEY, '1')
}

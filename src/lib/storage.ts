// localStorage 存储模块 — V2 品牌预设

import type { AtomIdsV2 } from './atoms'

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

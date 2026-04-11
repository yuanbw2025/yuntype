// 风格面板 — 四维度选择器 + 预设 + 微调滑条 + 品牌预设 + 历史

import { useState, useEffect } from 'react'
import {
  colorSchemes,
  layoutTemplates,
  decorationSets,
  typographySets,
  type AtomIds,
} from '../lib/atoms'
import {
  stylePresets,
  type TuneParams,
  defaultTuneParams,
} from '../lib/atoms/presets'
import {
  loadBrandPresets,
  addBrandPreset,
  removeBrandPreset,
  loadHistory,
  type BrandPreset,
  type HistoryEntry,
} from '../lib/storage'

interface StylePanelProps {
  atomIds: AtomIds
  tuneParams: TuneParams
  onAtomIdsChange: (ids: AtomIds) => void
  onTuneChange: (params: TuneParams) => void
  onShuffle: () => void
}

type Tab = 'presets' | 'atoms' | 'tune' | 'brand' | 'history'

// ═══════════════════════════════════════
//  样式常量
// ═══════════════════════════════════════
const panelBg = '#FAFAFA'
const cardBg = '#FFFFFF'
const borderColor = '#E8E8E8'
const activeBorderColor = '#4F46E5'
const activeColor = '#4F46E5'
const mutedColor = '#888'
const textColor = '#333'

export default function StylePanel({
  atomIds,
  tuneParams,
  onAtomIdsChange,
  onTuneChange,
  onShuffle,
}: StylePanelProps) {
  const [tab, setTab] = useState<Tab>('presets')

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: panelBg,
      borderRight: `1px solid ${borderColor}`,
      fontSize: '13px',
    }}>
      {/* 顶部标题 */}
      <div style={{
        padding: '12px 14px',
        borderBottom: `1px solid ${borderColor}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: cardBg,
      }}>
        <span style={{ fontWeight: 700, color: textColor }}>🎨 风格控制</span>
        <button onClick={onShuffle} style={{
          padding: '4px 12px',
          fontSize: '12px',
          background: activeColor,
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 600,
        }}>
          🎲 随机
        </button>
      </div>

      {/* Tab 切换 — 两行 */}
      <div style={{
        borderBottom: `1px solid ${borderColor}`,
        background: cardBg,
      }}>
        <div style={{ display: 'flex' }}>
          {([
            ['presets', '⭐ 预设'],
            ['atoms', '🧩 四维度'],
            ['tune', '🎚️ 微调'],
          ] as [Tab, string][]).map(([key, label]) => (
            <TabButton key={key} tab={tab} value={key} label={label} onClick={setTab} />
          ))}
        </div>
        <div style={{ display: 'flex' }}>
          {([
            ['brand', '💼 我的'],
            ['history', '🕐 历史'],
          ] as [Tab, string][]).map(([key, label]) => (
            <TabButton key={key} tab={tab} value={key} label={label} onClick={setTab} />
          ))}
        </div>
      </div>

      {/* 内容区 */}
      <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
        {tab === 'presets' && (
          <PresetsTab atomIds={atomIds} onChange={onAtomIdsChange} />
        )}
        {tab === 'atoms' && (
          <AtomsTab atomIds={atomIds} onChange={onAtomIdsChange} />
        )}
        {tab === 'tune' && (
          <TuneTab params={tuneParams} onChange={onTuneChange} />
        )}
        {tab === 'brand' && (
          <BrandTab
            atomIds={atomIds}
            tuneParams={tuneParams}
            onLoad={(ids, tune) => { onAtomIdsChange(ids); onTuneChange(tune) }}
          />
        )}
        {tab === 'history' && (
          <HistoryTab
            onLoad={(ids, tune) => { onAtomIdsChange(ids); onTuneChange(tune) }}
          />
        )}
      </div>
    </div>
  )
}

function TabButton({ tab, value, label, onClick }: {
  tab: Tab; value: Tab; label: string; onClick: (t: Tab) => void
}) {
  return (
    <button
      onClick={() => onClick(value)}
      style={{
        flex: 1,
        padding: '8px 0',
        fontSize: '11px',
        fontWeight: tab === value ? 700 : 400,
        color: tab === value ? activeColor : mutedColor,
        background: 'none',
        border: 'none',
        borderBottom: tab === value ? `2px solid ${activeColor}` : '2px solid transparent',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      {label}
    </button>
  )
}

// ═══════════════════════════════════════
//  预设 Tab
// ═══════════════════════════════════════
function PresetsTab({ atomIds, onChange }: {
  atomIds: AtomIds
  onChange: (ids: AtomIds) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {stylePresets.map((preset) => {
        const isActive =
          preset.ids.colorId === atomIds.colorId &&
          preset.ids.layoutId === atomIds.layoutId &&
          preset.ids.decorationId === atomIds.decorationId &&
          preset.ids.typographyId === atomIds.typographyId
        return (
          <button
            key={preset.name}
            onClick={() => onChange(preset.ids)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              background: isActive ? '#EEF0FF' : cardBg,
              border: `1.5px solid ${isActive ? activeBorderColor : borderColor}`,
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: '20px' }}>{preset.emoji}</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: '13px', color: isActive ? activeColor : textColor }}>
                {preset.name}
              </div>
              <div style={{ fontSize: '11px', color: mutedColor, marginTop: '2px' }}>
                {preset.nameEn} · {preset.ids.colorId} + {preset.ids.layoutId} + {preset.ids.decorationId} + {preset.ids.typographyId}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════
//  四维度 Tab
// ═══════════════════════════════════════
function AtomsTab({ atomIds, onChange }: {
  atomIds: AtomIds
  onChange: (ids: AtomIds) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <DimensionSection
        title="🌈 配色"
        items={colorSchemes.map(c => ({
          id: c.id, label: c.name, color: c.colors.primary, category: c.category,
        }))}
        activeId={atomIds.colorId}
        onSelect={(id) => onChange({ ...atomIds, colorId: id })}
        renderItem={(item, isActive) => (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 10px',
            background: isActive ? '#EEF0FF' : cardBg,
            border: `1.5px solid ${isActive ? activeBorderColor : borderColor}`,
            borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s',
          }}>
            <span style={{
              width: '14px', height: '14px', borderRadius: '50%',
              background: item.color, border: '1px solid rgba(0,0,0,0.1)', flexShrink: 0,
            }} />
            <span style={{
              fontSize: '12px', fontWeight: isActive ? 600 : 400,
              color: isActive ? activeColor : textColor, whiteSpace: 'nowrap',
            }}>{item.label}</span>
          </div>
        )}
      />
      <DimensionSection
        title="📐 排版"
        items={layoutTemplates.map(l => ({ id: l.id, label: l.name }))}
        activeId={atomIds.layoutId}
        onSelect={(id) => onChange({ ...atomIds, layoutId: id })}
      />
      <DimensionSection
        title="🎭 装饰"
        items={decorationSets.map(d => ({ id: d.id, label: d.name }))}
        activeId={atomIds.decorationId}
        onSelect={(id) => onChange({ ...atomIds, decorationId: id })}
      />
      <DimensionSection
        title="✒️ 字体"
        items={typographySets.map(t => ({ id: t.id, label: t.name }))}
        activeId={atomIds.typographyId}
        onSelect={(id) => onChange({ ...atomIds, typographyId: id })}
      />
    </div>
  )
}

// ═══════════════════════════════════════
//  维度选择小组件
// ═══════════════════════════════════════
interface DimensionItem { id: string; label: string; color?: string; category?: string }

function DimensionSection({ title, items, activeId, onSelect, renderItem }: {
  title: string; items: DimensionItem[]; activeId: string
  onSelect: (id: string) => void
  renderItem?: (item: DimensionItem, isActive: boolean) => React.ReactNode
}) {
  return (
    <div>
      <div style={{ fontSize: '12px', fontWeight: 700, color: textColor, marginBottom: '8px' }}>{title}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {items.map((item) => {
          const isActive = item.id === activeId
          if (renderItem) {
            return <div key={item.id} onClick={() => onSelect(item.id)}>{renderItem(item, isActive)}</div>
          }
          return (
            <button key={item.id} onClick={() => onSelect(item.id)} style={{
              padding: '6px 12px', fontSize: '12px',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? activeColor : textColor,
              background: isActive ? '#EEF0FF' : cardBg,
              border: `1.5px solid ${isActive ? activeBorderColor : borderColor}`,
              borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s',
            }}>
              {item.id} {item.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════
//  微调 Tab
// ═══════════════════════════════════════
function TuneTab({ params, onChange }: {
  params: TuneParams; onChange: (p: TuneParams) => void
}) {
  const handleReset = () => onChange(defaultTuneParams)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <TuneSlider label="🔤 字号大小" value={params.fontSizeScale} min={0.8} max={1.3} step={0.05}
        displayValue={`${Math.round(params.fontSizeScale * 100)}%`}
        onChange={(v) => onChange({ ...params, fontSizeScale: v })} />
      <TuneSlider label="↕️ 段落间距" value={params.spacingScale} min={0.5} max={1.8} step={0.1}
        displayValue={`${Math.round(params.spacingScale * 100)}%`}
        onChange={(v) => onChange({ ...params, spacingScale: v })} />
      <TuneSlider label="📏 行高调整" value={params.lineHeightAdd} min={-0.3} max={0.5} step={0.05}
        displayValue={params.lineHeightAdd >= 0 ? `+${params.lineHeightAdd.toFixed(2)}` : params.lineHeightAdd.toFixed(2)}
        onChange={(v) => onChange({ ...params, lineHeightAdd: v })} />
      <button onClick={handleReset} style={{
        padding: '8px', fontSize: '12px', color: mutedColor,
        background: cardBg, border: `1px solid ${borderColor}`,
        borderRadius: '6px', cursor: 'pointer', marginTop: '4px',
      }}>↩️ 重置微调</button>
    </div>
  )
}

// ═══════════════════════════════════════
//  品牌预设 Tab
// ═══════════════════════════════════════
function BrandTab({ atomIds, tuneParams, onLoad }: {
  atomIds: AtomIds; tuneParams: TuneParams
  onLoad: (ids: AtomIds, tune: TuneParams) => void
}) {
  const [presets, setPresets] = useState<BrandPreset[]>([])
  const [newName, setNewName] = useState('')
  const [showInput, setShowInput] = useState(false)

  useEffect(() => { setPresets(loadBrandPresets()) }, [])

  const handleSave = () => {
    if (!newName.trim()) return
    addBrandPreset(newName.trim(), atomIds, tuneParams)
    setPresets(loadBrandPresets())
    setNewName('')
    setShowInput(false)
  }

  const handleDelete = (id: string) => {
    removeBrandPreset(id)
    setPresets(loadBrandPresets())
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* 保存按钮 */}
      {!showInput ? (
        <button onClick={() => setShowInput(true)} style={{
          padding: '10px', fontSize: '12px', fontWeight: 600,
          color: activeColor, background: '#F8F8FF',
          border: `1px dashed ${activeColor}`, borderRadius: '8px', cursor: 'pointer',
        }}>
          💾 保存当前风格为品牌预设
        </button>
      ) : (
        <div style={{
          display: 'flex', gap: '6px', padding: '8px',
          background: '#F8F8FF', borderRadius: '8px', border: `1px solid ${activeColor}30`,
        }}>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="输入预设名称"
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
            autoFocus
            style={{
              flex: 1, padding: '6px 10px', fontSize: '12px',
              border: `1px solid ${borderColor}`, borderRadius: '6px', outline: 'none',
            }}
          />
          <button onClick={handleSave} style={{
            padding: '6px 12px', fontSize: '12px', fontWeight: 600,
            background: activeColor, color: '#fff', border: 'none',
            borderRadius: '6px', cursor: 'pointer',
          }}>保存</button>
          <button onClick={() => setShowInput(false)} style={{
            padding: '6px 8px', fontSize: '12px', background: 'none',
            border: 'none', cursor: 'pointer', color: mutedColor,
          }}>✕</button>
        </div>
      )}

      {/* 预设列表 */}
      {presets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 0', color: mutedColor, fontSize: '12px' }}>
          还没有保存过品牌预设<br />调好风格后点击上方保存
        </div>
      ) : (
        presets.map((p) => (
          <div key={p.id} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 12px', background: cardBg,
            border: `1px solid ${borderColor}`, borderRadius: '8px',
          }}>
            <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => onLoad(p.atomIds, p.tuneParams)}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: textColor }}>{p.name}</div>
              <div style={{ fontSize: '10px', color: mutedColor, marginTop: '2px' }}>
                {p.atomIds.colorId}+{p.atomIds.layoutId}+{p.atomIds.decorationId}+{p.atomIds.typographyId}
                · {new Date(p.createdAt).toLocaleDateString()}
              </div>
            </div>
            <button onClick={() => handleDelete(p.id)} style={{
              padding: '2px 6px', fontSize: '11px', color: '#E53E3E',
              background: 'none', border: 'none', cursor: 'pointer',
            }}>🗑️</button>
          </div>
        ))
      )}
    </div>
  )
}

// ═══════════════════════════════════════
//  历史记录 Tab
// ═══════════════════════════════════════
function HistoryTab({ onLoad }: {
  onLoad: (ids: AtomIds, tune: TuneParams) => void
}) {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  useEffect(() => { setHistory(loadHistory()) }, [])

  if (history.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '24px 0', color: mutedColor, fontSize: '12px' }}>
        暂无历史记录<br />切换排版风格后自动记录
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ fontSize: '11px', color: mutedColor, marginBottom: '4px' }}>
        最近 {history.length} 次排版方案
      </div>
      {history.map((h, i) => {
        const timeStr = new Date(h.timestamp).toLocaleString('zh-CN', {
          month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit',
        })
        return (
          <button
            key={i}
            onClick={() => onLoad(h.atomIds, h.tuneParams)}
            style={{
              display: 'flex', flexDirection: 'column', gap: '2px',
              padding: '8px 12px', background: cardBg,
              border: `1px solid ${borderColor}`, borderRadius: '8px',
              cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 500, color: textColor }}>
              {h.comboName}
            </div>
            <div style={{ fontSize: '10px', color: mutedColor }}>{timeStr}</div>
          </button>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════
//  滑条组件
// ═══════════════════════════════════════
function TuneSlider({ label, value, min, max, step, displayValue, onChange }: {
  label: string; value: number; min: number; max: number; step: number
  displayValue: string; onChange: (v: number) => void
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: textColor }}>{label}</span>
        <span style={{ fontSize: '12px', fontWeight: 600, color: activeColor, fontFamily: 'JetBrains Mono, monospace' }}>
          {displayValue}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', height: '4px', accentColor: activeColor, cursor: 'pointer' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: mutedColor, marginTop: '2px' }}>
        <span>{min}</span><span>{max}</span>
      </div>
    </div>
  )
}

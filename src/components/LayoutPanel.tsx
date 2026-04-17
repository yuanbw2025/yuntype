// 骨架 + 插槽选择面板 — V2 布局系统 UI（Phase 7: 场景预设 + AI协调 + 品牌预设）
import { useState, useEffect, useMemo } from 'react'
import {
  type AtomIdsV2, type ColorOverride, blueprints, getBlueprint,
  colorSchemes, typographySets,
  scenePresetsV2, recommendPresets, coordinatedPickByScene,
  coordinatedPickWithBlueprint,
} from '../lib/atoms'
import ColorCustomDialog from './ColorCustomDialog'
import { analyzeArticleTags } from '../lib/atoms/presets-v2'
import { listSlotVariants, type SlotType, type SlotConfig } from '../lib/atoms/slots'
import {
  loadBrandPresetsV2, addBrandPresetV2, removeBrandPresetV2,
  type BrandPresetV2,
} from '../lib/storage'

interface Props {
  atomIdsV2: AtomIdsV2
  onChange: (ids: AtomIdsV2) => void
  onShuffle: () => void
  /** 文章内容（用于 AI 推荐） */
  article?: string
}

type PanelTab = 'scenes' | 'atoms' | 'brand'

const SLOT_LABELS: { key: SlotType; label: string; icon: string }[] = [
  { key: 'title', label: '标题', icon: '🔤' },
  { key: 'quote', label: '引用', icon: '💬' },
  { key: 'list', label: '列表', icon: '📋' },
  { key: 'divider', label: '分割线', icon: '➖' },
  { key: 'paragraph', label: '段落', icon: '📄' },
  { key: 'section', label: '节区', icon: '📦' },
]

// ═══════════════════════════════════════
//  样式常量
// ═══════════════════════════════════════
const activeColor = '#4F46E5'
const mutedColor = '#999'
const borderColor = '#e5e5e5'
const cardBg = '#fff'

export default function LayoutPanel({ atomIdsV2, onChange, onShuffle, article }: Props) {
  const [tab, setTab] = useState<PanelTab>('scenes')
  const currentBp = getBlueprint(atomIdsV2.blueprintId)

  const setBlueprintId = (id: string) => {
    const bp = getBlueprint(id)
    onChange({ ...atomIdsV2, blueprintId: id, slots: { ...bp.defaultSlots } })
  }

  const setSlot = (key: SlotType, value: string) => {
    onChange({ ...atomIdsV2, slots: { ...atomIdsV2.slots, [key]: value } })
  }

  const setColorId = (id: string) => onChange({ ...atomIdsV2, colorId: id })
  const setTypoId = (id: string) => onChange({ ...atomIdsV2, typographyId: id })

  const setColorCustom = (colorId: string, override: ColorOverride | undefined) => {
    onChange({ ...atomIdsV2, colorId, colorOverride: override })
  }

  const resetSlots = () => {
    onChange({ ...atomIdsV2, slots: { ...currentBp.defaultSlots } })
  }

  /** 协调随机：保持骨架，重选配色+字体+插槽 */
  const handleCoordinatedShuffle = () => {
    const result = coordinatedPickWithBlueprint(currentBp)
    onChange(result)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontSize: '13px' }}>
      {/* 顶部标题 */}
      <div style={{
        padding: '10px 14px',
        borderBottom: `1px solid ${borderColor}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: cardBg,
        flexShrink: 0,
      }}>
        <span style={{ fontWeight: 700, color: '#333' }}>🏗️ V2 骨架引擎</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button onClick={handleCoordinatedShuffle} title="保持骨架，协调刷新其他" style={{
            padding: '4px 8px', fontSize: '11px', fontWeight: 600,
            background: '#f0f0f0', color: '#666', border: '1px solid #ddd',
            borderRadius: '4px', cursor: 'pointer',
          }}>🔄 协调</button>
          <button onClick={onShuffle} style={{
            padding: '4px 10px', fontSize: '11px', fontWeight: 600,
            background: activeColor, color: '#fff', border: 'none',
            borderRadius: '4px', cursor: 'pointer',
          }}>🎲 随机</button>
        </div>
      </div>

      {/* Tab 切换 */}
      <div style={{
        display: 'flex',
        borderBottom: `1px solid ${borderColor}`,
        background: cardBg,
        flexShrink: 0,
      }}>
        {([
          ['scenes', '⭐ 场景'],
          ['atoms', '🧩 组合'],
          ['brand', '💼 我的'],
        ] as [PanelTab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              flex: 1, padding: '8px 0', fontSize: '11px',
              fontWeight: tab === key ? 700 : 400,
              color: tab === key ? activeColor : mutedColor,
              background: 'none', border: 'none',
              borderBottom: tab === key ? `2px solid ${activeColor}` : '2px solid transparent',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >{label}</button>
        ))}
      </div>

      {/* 内容区 */}
      <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
        {tab === 'scenes' && (
          <ScenesTab
            atomIdsV2={atomIdsV2}
            onChange={onChange}
            article={article}
          />
        )}
        {tab === 'atoms' && (
          <AtomsTab
            atomIdsV2={atomIdsV2}
            currentBp={currentBp}
            setBlueprintId={setBlueprintId}
            setColorId={setColorId}
            setTypoId={setTypoId}
            setSlot={setSlot}
            resetSlots={resetSlots}
            setColorCustom={setColorCustom}
          />
        )}
        {tab === 'brand' && (
          <BrandTabV2
            atomIdsV2={atomIdsV2}
            onChange={onChange}
          />
        )}
      </div>

      {/* 当前配置摘要 */}
      <div style={{
        padding: '8px 14px',
        borderTop: `1px solid ${borderColor}`,
        background: '#f8f8f8',
        fontSize: '11px',
        color: '#888',
        flexShrink: 0,
      }}>
        <div>{currentBp.icon} <strong>{currentBp.name}</strong> — {currentBp.desc}</div>
        <div style={{ marginTop: '2px' }}>
          {colorSchemes.find(c => c.id === atomIdsV2.colorId)?.name} · {typographySets.find(t => t.id === atomIdsV2.typographyId)?.name}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════
//  场景预设 Tab
// ═══════════════════════════════════════
function ScenesTab({ atomIdsV2, onChange, article }: {
  atomIdsV2: AtomIdsV2
  onChange: (ids: AtomIdsV2) => void
  article?: string
}) {
  // AI 推荐：基于文章内容分析
  const aiRecommended = useMemo(() => {
    if (!article || article.length < 20) return null
    return recommendPresets(article)
  }, [article])

  const articleTags = useMemo(() => {
    if (!article || article.length < 20) return []
    return analyzeArticleTags(article).slice(0, 6)
  }, [article])

  /** 应用场景预设 */
  const applyPreset = (ids: AtomIdsV2) => {
    onChange({ ...ids })
  }

  /** 基于文章标签生成协调组合 */
  const handleAICoordinate = () => {
    if (articleTags.length === 0) return
    const result = coordinatedPickByScene(articleTags)
    onChange(result)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* AI 推荐区 */}
      {aiRecommended && aiRecommended.length > 0 && (
        <div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '8px',
          }}>
            <span style={{ fontWeight: 700, fontSize: '12px', color: '#059669' }}>
              🤖 AI 推荐
            </span>
            <button
              onClick={handleAICoordinate}
              style={{
                padding: '3px 8px', fontSize: '10px', fontWeight: 600,
                color: '#059669', background: '#ECFDF5',
                border: '1px solid #05966930', borderRadius: '4px', cursor: 'pointer',
              }}
            >
              🎯 智能生成
            </button>
          </div>
          {articleTags.length > 0 && (
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px',
            }}>
              {articleTags.map(tag => (
                <span key={tag} style={{
                  padding: '1px 6px', fontSize: '10px',
                  background: '#ECFDF5', color: '#059669',
                  borderRadius: '8px', border: '1px solid #05966920',
                }}>{tag}</span>
              ))}
            </div>
          )}
          {aiRecommended.slice(0, 3).map(preset => (
            <PresetCard
              key={preset.id}
              preset={preset}
              isActive={atomIdsV2.blueprintId === preset.ids.blueprintId && atomIdsV2.colorId === preset.ids.colorId}
              onClick={() => applyPreset(preset.ids)}
              badge="AI"
            />
          ))}
          <div style={{
            height: '1px', background: '#e5e5e5', margin: '4px 0',
          }} />
        </div>
      )}

      {/* 全部场景预设 */}
      <div>
        <div style={{ fontWeight: 700, fontSize: '12px', color: '#333', marginBottom: '8px' }}>
          🎭 场景预设（{scenePresetsV2.length}套）
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {scenePresetsV2.map(preset => (
            <PresetCard
              key={preset.id}
              preset={preset}
              isActive={atomIdsV2.blueprintId === preset.ids.blueprintId && atomIdsV2.colorId === preset.ids.colorId}
              onClick={() => applyPreset(preset.ids)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/** 场景预设卡片 */
function PresetCard({ preset, isActive, onClick, badge }: {
  preset: { emoji: string; name: string; nameEn: string; desc: string }
  isActive: boolean
  onClick: () => void
  badge?: string
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '8px 10px', width: '100%',
        background: isActive ? '#EEF0FF' : cardBg,
        border: `1.5px solid ${isActive ? activeColor : borderColor}`,
        borderRadius: '8px', cursor: 'pointer',
        textAlign: 'left', transition: 'all 0.15s',
      }}
    >
      <span style={{ fontSize: '20px', flexShrink: 0 }}>{preset.emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{
            fontWeight: 600, fontSize: '12px',
            color: isActive ? activeColor : '#333',
          }}>{preset.name}</span>
          {badge && (
            <span style={{
              fontSize: '9px', fontWeight: 700,
              color: '#059669', background: '#ECFDF5',
              padding: '0 4px', borderRadius: '4px',
            }}>{badge}</span>
          )}
        </div>
        <div style={{
          fontSize: '10px', color: mutedColor, marginTop: '1px',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{preset.desc}</div>
      </div>
    </button>
  )
}

// ═══════════════════════════════════════
//  组合调整 Tab（原 atoms 面板）
// ═══════════════════════════════════════
function AtomsTab({ atomIdsV2, currentBp, setBlueprintId, setColorId, setTypoId, setSlot, resetSlots, setColorCustom }: {
  atomIdsV2: AtomIdsV2
  currentBp: ReturnType<typeof getBlueprint>
  setBlueprintId: (id: string) => void
  setColorId: (id: string) => void
  setTypoId: (id: string) => void
  setSlot: (key: SlotType, value: string) => void
  resetSlots: () => void
  setColorCustom: (colorId: string, override: ColorOverride | undefined) => void
}) {
  const [colorDialogOpen, setColorDialogOpen] = useState(false)
  const hasOverride = !!(atomIdsV2.colorOverride && Object.keys(atomIdsV2.colorOverride).length > 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* ── 骨架选择 ── */}
      <div>
        <div style={{ fontWeight: 700, marginBottom: '8px', color: '#333' }}>🏗️ 骨架（{blueprints.length}种）</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
          {blueprints.map(bp => (
            <button
              key={bp.id}
              onClick={() => setBlueprintId(bp.id)}
              title={bp.desc}
              style={{
                padding: '6px 4px', fontSize: '11px', lineHeight: 1.2,
                border: atomIdsV2.blueprintId === bp.id ? '2px solid #4F46E5' : '1px solid #e0e0e0',
                borderRadius: '6px',
                background: atomIdsV2.blueprintId === bp.id ? '#EEF0FF' : '#fff',
                cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
              }}
            >
              <div style={{ fontSize: '16px' }}>{bp.icon}</div>
              <div style={{ marginTop: '2px', color: atomIdsV2.blueprintId === bp.id ? '#4F46E5' : '#666' }}>{bp.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ── 配色 + 字体 ── */}
      <div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, marginBottom: '4px', color: '#555' }}>🎨 配色</div>
            <select
              value={atomIdsV2.colorId}
              onChange={e => setColorId(e.target.value)}
              style={{ width: '100%', padding: '5px 8px', fontSize: '12px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              {colorSchemes.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, marginBottom: '4px', color: '#555' }}>✏️ 字体</div>
            <select
              value={atomIdsV2.typographyId}
              onChange={e => setTypoId(e.target.value)}
              style={{ width: '100%', padding: '5px 8px', fontSize: '12px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              {typographySets.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.id})</option>
              ))}
            </select>
          </div>
        </div>
        {/* 自定义配色按钮 */}
        <button
          onClick={() => setColorDialogOpen(true)}
          style={{
            marginTop: '6px', width: '100%', padding: '6px',
            fontSize: '11px', fontWeight: 600,
            background: hasOverride ? '#EEF0FF' : '#f8f8f8',
            color: hasOverride ? '#4F46E5' : '#666',
            border: `1px solid ${hasOverride ? '#4F46E580' : '#e0e0e0'}`,
            borderRadius: '6px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
          }}
        >
          🎨 自定义配色
          {hasOverride && (
            <span style={{
              fontSize: '10px', background: '#4F46E5', color: '#fff',
              padding: '1px 5px', borderRadius: '8px',
            }}>
              已定制
            </span>
          )}
        </button>
      </div>

      {/* 配色自定义弹窗 */}
      <ColorCustomDialog
        visible={colorDialogOpen}
        onClose={() => setColorDialogOpen(false)}
        colorId={atomIdsV2.colorId}
        colorOverride={atomIdsV2.colorOverride}
        onChange={(id, override) => setColorCustom(id, override)}
      />

      {/* ── 插槽微调 ── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontWeight: 700, color: '#333' }}>🔧 插槽微调</span>
          <button
            onClick={resetSlots}
            style={{ fontSize: '11px', color: '#999', background: 'none', border: '1px solid #ddd', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer' }}
          >
            ↩️ 恢复默认
          </button>
        </div>
        {SLOT_LABELS.map(({ key, label, icon }) => {
          const variants = listSlotVariants(key)
          return (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <span style={{ width: '60px', fontSize: '12px', color: '#666' }}>{icon} {label}</span>
              <select
                value={(atomIdsV2.slots as SlotConfig)[key]}
                onChange={e => setSlot(key, e.target.value)}
                style={{ flex: 1, padding: '4px 6px', fontSize: '11px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                {variants.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
          )
        })}
      </div>

      {/* 标签信息 */}
      <div style={{
        padding: '8px', background: '#f8f8f8', borderRadius: '6px',
        fontSize: '10px', color: '#aaa',
      }}>
        <div>骨架标签: {currentBp.tags.join(', ')}</div>
        <div>配色标签: {colorSchemes.find(c => c.id === atomIdsV2.colorId)?.tags.join(', ')}</div>
        <div>字体标签: {typographySets.find(t => t.id === atomIdsV2.typographyId)?.tags.join(', ')}</div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════
//  品牌预设 Tab（V2）
// ═══════════════════════════════════════
function BrandTabV2({ atomIdsV2, onChange }: {
  atomIdsV2: AtomIdsV2
  onChange: (ids: AtomIdsV2) => void
}) {
  const [presets, setPresets] = useState<BrandPresetV2[]>([])
  const [newName, setNewName] = useState('')
  const [showInput, setShowInput] = useState(false)

  useEffect(() => { setPresets(loadBrandPresetsV2()) }, [])

  const handleSave = () => {
    if (!newName.trim()) return
    addBrandPresetV2(newName.trim(), atomIdsV2)
    setPresets(loadBrandPresetsV2())
    setNewName('')
    setShowInput(false)
  }

  const handleDelete = (id: string) => {
    removeBrandPresetV2(id)
    setPresets(loadBrandPresetsV2())
  }

  const currentBp = getBlueprint(atomIdsV2.blueprintId)

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

      {/* 当前配置预览 */}
      <div style={{
        padding: '8px 10px', background: '#f5f5f5', borderRadius: '6px',
        fontSize: '11px', color: '#888',
      }}>
        当前: {currentBp.icon} {currentBp.name} · {colorSchemes.find(c => c.id === atomIdsV2.colorId)?.name} · {typographySets.find(t => t.id === atomIdsV2.typographyId)?.name}
      </div>

      {/* 预设列表 */}
      {presets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 0', color: mutedColor, fontSize: '12px' }}>
          还没有保存过品牌预设<br />调好风格后点击上方保存
        </div>
      ) : (
        presets.map((p) => {
          const bp = getBlueprint(p.atomIdsV2.blueprintId)
          return (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 12px', background: cardBg,
              border: `1px solid ${borderColor}`, borderRadius: '8px',
            }}>
              <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => onChange(p.atomIdsV2)}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#333' }}>
                  {bp.icon} {p.name}
                </div>
                <div style={{ fontSize: '10px', color: mutedColor, marginTop: '2px' }}>
                  {bp.name} · {colorSchemes.find(c => c.id === p.atomIdsV2.colorId)?.name}
                  · {new Date(p.createdAt).toLocaleDateString()}
                </div>
              </div>
              <button onClick={() => handleDelete(p.id)} style={{
                padding: '2px 6px', fontSize: '11px', color: '#E53E3E',
                background: 'none', border: 'none', cursor: 'pointer',
              }}>🗑️</button>
            </div>
          )
        })
      )}
    </div>
  )
}

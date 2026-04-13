// 骨架 + 插槽选择面板 — V2 布局系统 UI
import { type AtomIdsV2, blueprints, getBlueprint, colorSchemes, typographySets } from '../lib/atoms'
import { listSlotVariants, type SlotType, type SlotConfig } from '../lib/atoms/slots'

interface Props {
  atomIdsV2: AtomIdsV2
  onChange: (ids: AtomIdsV2) => void
  onShuffle: () => void
}

const SLOT_LABELS: { key: SlotType; label: string; icon: string }[] = [
  { key: 'title', label: '标题', icon: '🔤' },
  { key: 'quote', label: '引用', icon: '💬' },
  { key: 'list', label: '列表', icon: '📋' },
  { key: 'divider', label: '分割线', icon: '➖' },
  { key: 'paragraph', label: '段落', icon: '📄' },
  { key: 'section', label: '节区', icon: '📦' },
]

export default function LayoutPanel({ atomIdsV2, onChange, onShuffle }: Props) {
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

  const resetSlots = () => {
    onChange({ ...atomIdsV2, slots: { ...currentBp.defaultSlots } })
  }

  return (
    <div style={{ padding: '12px', fontSize: '13px', overflowY: 'auto', height: '100%' }}>

      {/* ── 骨架选择 ── */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ fontWeight: 700, marginBottom: '8px', color: '#333' }}>🏗️ 骨架（{blueprints.length}种）</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
          {blueprints.map(bp => (
            <button
              key={bp.id}
              onClick={() => setBlueprintId(bp.id)}
              title={bp.desc}
              style={{
                padding: '6px 4px',
                fontSize: '11px',
                lineHeight: 1.2,
                border: atomIdsV2.blueprintId === bp.id ? '2px solid #4F46E5' : '1px solid #e0e0e0',
                borderRadius: '6px',
                background: atomIdsV2.blueprintId === bp.id ? '#EEF0FF' : '#fff',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ fontSize: '16px' }}>{bp.icon}</div>
              <div style={{ marginTop: '2px', color: atomIdsV2.blueprintId === bp.id ? '#4F46E5' : '#666' }}>{bp.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ── 配色 + 字体 ── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
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

      {/* ── 插槽微调 ── */}
      <div style={{ marginBottom: '14px' }}>
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

      {/* ── 快速操作 ── */}
      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          onClick={onShuffle}
          style={{
            flex: 1, padding: '8px', fontSize: '12px', fontWeight: 600,
            background: '#4F46E5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer',
          }}
        >
          🎲 随机全部
        </button>
      </div>

      {/* ── 当前配置摘要 ── */}
      <div style={{ marginTop: '12px', padding: '8px', background: '#f8f8f8', borderRadius: '6px', fontSize: '11px', color: '#888' }}>
        <div>{currentBp.icon} <strong>{currentBp.name}</strong> — {currentBp.desc}</div>
        <div style={{ marginTop: '4px' }}>
          {colorSchemes.find(c => c.id === atomIdsV2.colorId)?.name} · {typographySets.find(t => t.id === atomIdsV2.typographyId)?.name}
        </div>
      </div>
    </div>
  )
}

import { useMemo, useState } from 'react'
import {
  type AtomIdsV2,
  type ColorOverride,
  blueprints,
  getBlueprint,
  colorSchemes,
  typographySets,
  scenePresetsV2,
  recommendPresets,
  coordinatedPickByScene,
  coordinatedPickWithBlueprint,
} from '../../lib/atoms'
import { analyzeArticleTags } from '../../lib/atoms/presets-v2'
import { listSlotVariants, type SlotConfig, type SlotType } from '../../lib/atoms/slots'
import ColorCustomDialog from '../ColorCustomDialog'

interface StyleGalleryPanelProps {
  atomIdsV2: AtomIdsV2
  onChange: (ids: AtomIdsV2) => void
  onShuffle: () => void
  article?: string
}

type StyleTab = 'scene' | 'blueprint' | 'color' | 'detail'

const SLOT_META: { key: SlotType; label: string; icon: string }[] = [
  { key: 'title', label: '标题', icon: 'T' },
  { key: 'quote', label: '引用', icon: '“' },
  { key: 'list', label: '列表', icon: '•' },
  { key: 'divider', label: '分割', icon: '—' },
  { key: 'paragraph', label: '段落', icon: '¶' },
  { key: 'section', label: '节区', icon: '▣' },
]

export default function StyleGalleryPanel({ atomIdsV2, onChange, onShuffle, article }: StyleGalleryPanelProps) {
  const [tab, setTab] = useState<StyleTab>('blueprint')
  const [colorDialogOpen, setColorDialogOpen] = useState(false)
  const currentBp = getBlueprint(atomIdsV2.blueprintId)

  const articleTags = useMemo(() => {
    if (!article || article.length < 20) return []
    return analyzeArticleTags(article).slice(0, 5)
  }, [article])

  const recommended = useMemo(() => {
    if (!article || article.length < 20) return []
    return recommendPresets(article).slice(0, 3)
  }, [article])

  const setBlueprint = (blueprintId: string) => {
    const bp = getBlueprint(blueprintId)
    onChange({ ...atomIdsV2, blueprintId, slots: { ...bp.defaultSlots } })
  }

  const setColor = (colorId: string, colorOverride?: ColorOverride) => {
    onChange({ ...atomIdsV2, colorId, colorOverride })
  }

  const setTypography = (typographyId: string) => {
    onChange({ ...atomIdsV2, typographyId })
  }

  const setSlot = (key: SlotType, value: string) => {
    onChange({ ...atomIdsV2, slots: { ...atomIdsV2.slots, [key]: value } })
  }

  const handleCoordinate = () => {
    const result = coordinatedPickWithBlueprint(currentBp)
    onChange(result)
  }

  const handleSceneCoordinate = () => {
    if (articleTags.length === 0) return
    onChange(coordinatedPickByScene(articleTags))
  }

  return (
    <div className="style-gallery">
      <div className="style-gallery-actions">
        <button onClick={handleCoordinate}>🔄 协调</button>
        <button className="is-primary" onClick={onShuffle}>🎲 随机</button>
      </div>

      <div className="style-tabs">
        {([
          ['scene', '场景'],
          ['blueprint', '骨架'],
          ['color', '配色'],
          ['detail', '细节'],
        ] as [StyleTab, string][]).map(([key, label]) => (
          <button key={key} className={tab === key ? 'is-active' : ''} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </div>

      <div className="style-gallery-scroll">
        {tab === 'scene' && (
          <SceneTab
            atomIdsV2={atomIdsV2}
            articleTags={articleTags}
            recommended={recommended}
            onApply={onChange}
            onCoordinate={handleSceneCoordinate}
          />
        )}
        {tab === 'blueprint' && (
          <BlueprintTab activeId={atomIdsV2.blueprintId} onSelect={setBlueprint} />
        )}
        {tab === 'color' && (
          <ColorTab
            atomIdsV2={atomIdsV2}
            onSelectColor={setColor}
            onSelectTypography={setTypography}
            onOpenCustom={() => setColorDialogOpen(true)}
          />
        )}
        {tab === 'detail' && (
          <DetailTab atomIdsV2={atomIdsV2} currentBp={currentBp} onChange={onChange} onSetSlot={setSlot} />
        )}
      </div>

      <ColorCustomDialog
        visible={colorDialogOpen}
        onClose={() => setColorDialogOpen(false)}
        colorId={atomIdsV2.colorId}
        colorOverride={atomIdsV2.colorOverride}
        onChange={setColor}
      />
    </div>
  )
}

function SceneTab({
  atomIdsV2,
  articleTags,
  recommended,
  onApply,
  onCoordinate,
}: {
  atomIdsV2: AtomIdsV2
  articleTags: string[]
  recommended: typeof scenePresetsV2
  onApply: (ids: AtomIdsV2) => void
  onCoordinate: () => void
}) {
  const cards = recommended.length > 0 ? recommended : scenePresetsV2

  return (
    <div className="style-section">
      <div className="section-row">
        <div>
          <h3>{recommended.length > 0 ? 'AI 推荐' : '场景预设'}</h3>
          <p>{recommended.length > 0 ? '根据文章内容匹配' : `${scenePresetsV2.length} 套常用内容场景`}</p>
        </div>
        <button className="mini-btn" onClick={onCoordinate} disabled={articleTags.length === 0}>智能生成</button>
      </div>

      {articleTags.length > 0 && (
        <div className="tag-row">
          {articleTags.map(tag => <span key={tag}>{tag}</span>)}
        </div>
      )}

      <div className="preset-list">
        {cards.map(preset => (
          <button
            key={preset.id}
            className={`preset-card${atomIdsV2.blueprintId === preset.ids.blueprintId && atomIdsV2.colorId === preset.ids.colorId ? ' is-active' : ''}`}
            onClick={() => onApply({ ...preset.ids })}
          >
            <span>{preset.emoji}</span>
            <div>
              <strong>{preset.name}</strong>
              <small>{preset.desc}</small>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function BlueprintTab({ activeId, onSelect }: { activeId: string; onSelect: (id: string) => void }) {
  return (
    <div className="style-section">
      <div className="section-row">
        <div>
          <h3>15 套蓝图</h3>
          <p>点击切换文档结构</p>
        </div>
      </div>
      <div className="blueprint-grid">
        {blueprints.map(bp => (
          <button
            key={bp.id}
            className={`blueprint-card${activeId === bp.id ? ' is-active' : ''}`}
            onClick={() => onSelect(bp.id)}
            title={bp.desc}
          >
            <BlueprintThumb id={bp.id} />
            <div className="blueprint-meta">
              <strong>{bp.name}</strong>
              <small>{bp.tags.slice(0, 2).join(' · ')}</small>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function ColorTab({
  atomIdsV2,
  onSelectColor,
  onSelectTypography,
  onOpenCustom,
}: {
  atomIdsV2: AtomIdsV2
  onSelectColor: (id: string) => void
  onSelectTypography: (id: string) => void
  onOpenCustom: () => void
}) {
  const lightColors = colorSchemes.filter(c => c.category === 'light')
  const darkColors = colorSchemes.filter(c => c.category === 'dark')

  return (
    <div className="style-section">
      <div className="section-row">
        <div>
          <h3>配色</h3>
          <p>浅色 8 套 + 深色 3 套</p>
        </div>
        <button className="mini-btn" onClick={onOpenCustom}>自定义</button>
      </div>

      <ColorGrid colors={lightColors} activeId={atomIdsV2.colorId} onSelect={onSelectColor} />

      <h3 className="subhead">深色系</h3>
      <ColorGrid colors={darkColors} activeId={atomIdsV2.colorId} onSelect={onSelectColor} />

      <h3 className="subhead">字体</h3>
      <div className="font-grid">
        {typographySets.map(font => (
          <button
            key={font.id}
            className={`font-card${atomIdsV2.typographyId === font.id ? ' is-active' : ''}`}
            onClick={() => onSelectTypography(font.id)}
          >
            <strong>{font.name}</strong>
            <span style={{
              fontWeight: Number(font.wechat.headingWeight),
              letterSpacing: font.wechat.letterSpacing,
            }}>云中书 Aa</span>
            <small>{font.tags.slice(0, 2).join(' · ')}</small>
          </button>
        ))}
      </div>
    </div>
  )
}

function ColorGrid({ colors, activeId, onSelect }: { colors: typeof colorSchemes; activeId: string; onSelect: (id: string) => void }) {
  return (
    <div className="color-grid">
      {colors.map(color => (
        <button
          key={color.id}
          className={`color-card${activeId === color.id ? ' is-active' : ''}`}
          onClick={() => onSelect(color.id)}
        >
          <span className="color-swatch" style={{ background: color.colors.pageBg }}>
            <i style={{ background: color.colors.primary }} />
          </span>
          <strong>{color.name}</strong>
        </button>
      ))}
    </div>
  )
}

function DetailTab({
  atomIdsV2,
  currentBp,
  onChange,
  onSetSlot,
}: {
  atomIdsV2: AtomIdsV2
  currentBp: ReturnType<typeof getBlueprint>
  onChange: (ids: AtomIdsV2) => void
  onSetSlot: (key: SlotType, value: string) => void
}) {
  const resetSlots = () => onChange({ ...atomIdsV2, slots: { ...currentBp.defaultSlots } })

  return (
    <div className="style-section">
      <div className="section-row">
        <div>
          <h3>插槽微调</h3>
          <p>只调整局部元素样式</p>
        </div>
        <button className="mini-btn" onClick={resetSlots}>恢复默认</button>
      </div>
      <div className="slot-list">
        {SLOT_META.map(meta => {
          const variants = listSlotVariants(meta.key)
          return (
            <label key={meta.key} className="slot-row">
              <span><i>{meta.icon}</i>{meta.label}</span>
              <select
                value={(atomIdsV2.slots as SlotConfig)[meta.key]}
                onChange={e => onSetSlot(meta.key, e.target.value)}
              >
                {variants.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </label>
          )
        })}
      </div>
      <div className="style-tags">
        <span>{currentBp.icon} {currentBp.name}</span>
        {currentBp.tags.map(tag => <em key={tag}>{tag}</em>)}
      </div>
    </div>
  )
}

function BlueprintThumb({ id }: { id: string }) {
  const pattern = Number(id.replace('B', '')) % 5
  return (
    <div className="blueprint-thumb">
      <svg viewBox="0 0 160 92" aria-hidden="true">
        <rect x="0" y="0" width="160" height="92" rx="0" fill="var(--bg-surface2)" />
        {pattern === 0 && (
          <>
            <rect x="24" y="16" width="78" height="8" rx="2" />
            <rect x="24" y="34" width="112" height="4" rx="2" opacity=".28" />
            <rect x="24" y="44" width="94" height="4" rx="2" opacity=".22" />
            <rect x="24" y="60" width="112" height="16" rx="4" opacity=".16" />
          </>
        )}
        {pattern === 1 && (
          <>
            <rect x="52" y="16" width="56" height="7" rx="2" />
            <rect x="34" y="36" width="92" height="4" rx="2" opacity=".28" />
            <rect x="44" y="48" width="72" height="4" rx="2" opacity=".22" />
            <circle cx="80" cy="68" r="4" opacity=".55" />
          </>
        )}
        {pattern === 2 && (
          <>
            <rect x="22" y="16" width="6" height="54" rx="3" />
            <rect x="40" y="16" width="82" height="8" rx="2" />
            <rect x="40" y="34" width="98" height="4" rx="2" opacity=".28" />
            <rect x="40" y="44" width="70" height="4" rx="2" opacity=".22" />
            <rect x="40" y="58" width="98" height="4" rx="2" opacity=".18" />
          </>
        )}
        {pattern === 3 && (
          <>
            <rect x="22" y="18" width="48" height="50" rx="5" opacity=".18" />
            <rect x="84" y="18" width="52" height="50" rx="5" opacity=".18" />
            <rect x="31" y="30" width="28" height="5" rx="2" />
            <rect x="93" y="30" width="32" height="5" rx="2" />
            <rect x="31" y="44" width="26" height="3" rx="2" opacity=".25" />
            <rect x="93" y="44" width="30" height="3" rx="2" opacity=".25" />
          </>
        )}
        {pattern === 4 && (
          <>
            <rect x="22" y="16" width="92" height="15" rx="3" opacity=".32" />
            <rect x="34" y="44" width="102" height="4" rx="2" opacity=".26" />
            <rect x="34" y="54" width="80" height="4" rx="2" opacity=".22" />
            <rect x="34" y="66" width="94" height="4" rx="2" opacity=".18" />
          </>
        )}
      </svg>
    </div>
  )
}

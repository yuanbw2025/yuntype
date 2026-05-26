import { useMemo, useRef, useState } from 'react'
import { loadChatConfig } from '../../lib/ai/client'
import { arrangeMediaWithAI } from '../../lib/ai/media-placement'
import {
  createSmartPlacements,
  getNodeLabel,
  makeMediaId,
  parseAnchoredMarkdown,
  type MediaAsset,
  type MediaLayout,
  type MediaPlacement,
  type MediaPlacementPosition,
  type MediaPlatform,
} from '../../lib/media'

interface MediaPanelProps {
  markdown: string
  assets: MediaAsset[]
  placements: MediaPlacement[]
  onAssetsChange: (assets: MediaAsset[]) => void
  onPlacementsChange: (placements: MediaPlacement[]) => void
}

const LAYOUTS: { id: MediaLayout; label: string }[] = [
  { id: 'full', label: '全宽' },
  { id: 'card', label: '卡片' },
  { id: 'split', label: '图文' },
  { id: 'background', label: '背景' },
]

const POSITIONS: { id: MediaPlacementPosition; label: string }[] = [
  { id: 'before', label: '前' },
  { id: 'after', label: '后' },
]

export default function MediaPanel({ markdown, assets, placements, onAssetsChange, onPlacementsChange }: MediaPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [activeAssetId, setActiveAssetId] = useState<string | null>(assets[0]?.id ?? null)
  const [arranging, setArranging] = useState(false)
  const [arrangeNote, setArrangeNote] = useState('')
  const nodes = useMemo(() => parseAnchoredMarkdown(markdown), [markdown])
  const activeAsset = assets.find(asset => asset.id === activeAssetId) ?? assets[0]

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return
    const nextAssets = await Promise.all(Array.from(files).map(readImageFile))
    onAssetsChange([...assets, ...nextAssets])
    setActiveAssetId(nextAssets[0]?.id ?? activeAssetId)
    if (inputRef.current) inputRef.current.value = ''
  }

  const updateAsset = (id: string, patch: Partial<MediaAsset>) => {
    onAssetsChange(assets.map(asset => asset.id === id ? { ...asset, ...patch } : asset))
  }

  const removeAsset = (id: string) => {
    onAssetsChange(assets.filter(asset => asset.id !== id))
    onPlacementsChange(placements.filter(placement => placement.assetId !== id))
    if (activeAssetId === id) setActiveAssetId(null)
  }

  const addPlacement = (assetId: string, anchorIndex = nodes[0]?.anchorIndex ?? 0) => {
    onPlacementsChange([
      ...placements,
      {
        id: makeMediaId('place'),
        assetId,
        anchorIndex,
        position: 'after',
        platforms: ['wechat', 'xhs'],
        layout: 'full',
        caption: assets.find(asset => asset.id === assetId)?.caption,
      },
    ])
  }

  const updatePlacement = (id: string, patch: Partial<MediaPlacement>) => {
    onPlacementsChange(placements.map(placement => placement.id === id ? { ...placement, ...patch } : placement))
  }

  const removePlacement = (id: string) => {
    onPlacementsChange(placements.filter(placement => placement.id !== id))
  }

  const togglePlatform = (placement: MediaPlacement, platform: MediaPlatform) => {
    const has = placement.platforms.includes(platform)
    const platforms = has
      ? placement.platforms.filter(item => item !== platform)
      : [...placement.platforms, platform]
    updatePlacement(placement.id, { platforms })
  }

  const smartArrange = async () => {
    if (!assets.length || !markdown.trim() || arranging) return
    setArranging(true)
    setArrangeNote('')
    const config = loadChatConfig()
    if (!config?.apiKey) {
      onPlacementsChange(createSmartPlacements(markdown, assets, placements))
      setArrangeNote('未配置 API Key，已使用本地编排。')
      setArranging(false)
      return
    }

    const result = await arrangeMediaWithAI(config, markdown, assets, placements)
    onPlacementsChange(result.placements)
    setArrangeNote(result.reason ? `${result.reason} 已使用本地编排。` : 'AI 编排已完成。')
    setArranging(false)
  }

  return (
    <div className="media-panel">
      <div className="media-panel-actions">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={event => handleUpload(event.target.files)}
        />
        <button onClick={() => inputRef.current?.click()}>上传图片</button>
        <button onClick={smartArrange} disabled={!assets.length || !markdown.trim() || arranging}>
          {arranging ? '编排中...' : '智能编排'}
        </button>
      </div>
      {arrangeNote && <div className="media-arrange-note">{arrangeNote}</div>}

      <div className="media-assets">
        {assets.length === 0 ? (
          <div className="media-empty">上传图片后，可以插入到公众号和小红书排版中。</div>
        ) : assets.map(asset => (
          <button
            key={asset.id}
            className={`media-asset-card ${activeAsset?.id === asset.id ? 'is-active' : ''}`}
            onClick={() => setActiveAssetId(asset.id)}
          >
            <img src={asset.url} alt={asset.caption || asset.name} />
            <span>{asset.caption || asset.name}</span>
          </button>
        ))}
      </div>

      {activeAsset && (
        <section className="media-section">
          <div className="media-section-title">
            <strong>当前图片</strong>
            <button onClick={() => removeAsset(activeAsset.id)}>删除</button>
          </div>
          <label>
            图注
            <input
              value={activeAsset.caption ?? ''}
              placeholder="可选，导出时显示在图片下方"
              onChange={event => updateAsset(activeAsset.id, { caption: event.target.value })}
            />
          </label>
          <button className="media-primary" onClick={() => addPlacement(activeAsset.id)}>
            插入到文章
          </button>
        </section>
      )}

      <section className="media-section media-placement-list">
        <div className="media-section-title">
          <strong>编排</strong>
          <span>{placements.length} 处</span>
        </div>
        {placements.length === 0 ? (
          <div className="media-empty">还没有图片位置。可以选择图片后手动插入，或使用智能编排。</div>
        ) : placements.map(placement => {
          const asset = assets.find(item => item.id === placement.assetId)
          return (
            <div key={placement.id} className="media-placement-card">
              <div className="media-placement-head">
                <strong>{asset?.caption || asset?.name || '图片'}</strong>
                <button onClick={() => removePlacement(placement.id)}>移除</button>
              </div>
              <select
                value={placement.anchorIndex}
                onChange={event => updatePlacement(placement.id, { anchorIndex: Number(event.target.value) })}
              >
                {nodes.map(node => (
                  <option key={node.anchorIndex} value={node.anchorIndex}>
                    {node.anchorIndex + 1}. {getNodeLabel(node, node.anchorIndex).slice(0, 36)}
                  </option>
                ))}
              </select>
              <div className="media-segment-row">
                {POSITIONS.map(item => (
                  <button
                    key={item.id}
                    className={placement.position === item.id ? 'is-active' : ''}
                    onClick={() => updatePlacement(placement.id, { position: item.id })}
                  >
                    {item.label}
                  </button>
                ))}
                {LAYOUTS.map(item => (
                  <button
                    key={item.id}
                    className={placement.layout === item.id ? 'is-active' : ''}
                    onClick={() => updatePlacement(placement.id, { layout: item.id })}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="media-platform-row">
                {(['wechat', 'xhs'] as MediaPlatform[]).map(platform => (
                  <label key={platform}>
                    <input
                      type="checkbox"
                      checked={placement.platforms.includes(platform)}
                      onChange={() => togglePlatform(placement, platform)}
                    />
                    {platform === 'wechat' ? '公众号' : '小红书'}
                  </label>
                ))}
                <label>
                  <input
                    type="checkbox"
                    checked={!!placement.locked}
                    onChange={event => updatePlacement(placement.id, { locked: event.target.checked })}
                  />
                  锁定
                </label>
              </div>
            </div>
          )
        })}
      </section>
    </div>
  )
}

function readImageFile(file: File): Promise<MediaAsset> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onload = () => {
      const url = String(reader.result)
      const img = new Image()
      img.onload = () => {
        resolve({
          id: makeMediaId(),
          name: file.name,
          url,
          width: img.naturalWidth,
          height: img.naturalHeight,
          createdAt: Date.now(),
        })
      }
      img.onerror = () => resolve({
        id: makeMediaId(),
        name: file.name,
        url,
        width: 1,
        height: 1,
        createdAt: Date.now(),
      })
      img.src = url
    }
    reader.readAsDataURL(file)
  })
}

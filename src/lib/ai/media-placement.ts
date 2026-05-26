import { chat, type AIClientConfig } from './client'
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
} from '../media'

interface AIPlacementItem {
  assetId: string
  anchorIndex: number
  position?: MediaPlacementPosition
  platforms?: MediaPlatform[]
  layout?: MediaLayout
  caption?: string
}

const SYSTEM_PROMPT = `你是公众号和小红书图文排版策划。用户会给你文章结构和用户上传图片元信息。请判断每张图片最适合插入到哪个内容块前后。
只返回 JSON，不要解释：
{
  "placements": [
    {
      "assetId": "图片ID",
      "anchorIndex": 2,
      "position": "after",
      "platforms": ["wechat", "xhs"],
      "layout": "full",
      "caption": "可选图注"
    }
  ]
}
规则：
1. anchorIndex 必须来自候选内容块。
2. assetId 必须来自候选图片。
3. position 只能是 before 或 after，默认 after。
4. platforms 只能包含 wechat 和 xhs。
5. layout 只能是 full、card、split、background。公众号优先 full/card，小红书可用 card/split。
6. 不要把太多图片集中到开头，优先放在观点转换、案例、数据、结论前后。
7. 如果图片信息不足，按文章节奏均匀安排。`

export async function arrangeMediaWithAI(
  config: AIClientConfig,
  markdown: string,
  assets: MediaAsset[],
  existing: MediaPlacement[],
): Promise<{ placements: MediaPlacement[]; reason?: string }> {
  const nodes = parseAnchoredMarkdown(markdown)
  if (nodes.length === 0 || assets.length === 0) return { placements: existing }

  const locked = existing.filter(placement => placement.locked)
  const usedAssetIds = new Set(locked.map(placement => placement.assetId))
  const availableAssets = assets.filter(asset => !usedAssetIds.has(asset.id))
  if (availableAssets.length === 0) return { placements: locked }

  const anchors = nodes
    .filter(node => node.type === 'heading' || node.type === 'paragraph' || node.type === 'blockquote' || node.type === 'list')
    .map(node => ({
      anchorIndex: node.anchorIndex,
      label: getNodeLabel(node, node.anchorIndex).slice(0, 120),
      type: node.type,
    }))

  const imageMeta = availableAssets.map(asset => ({
    id: asset.id,
    name: asset.name,
    caption: asset.caption ?? '',
    width: asset.width,
    height: asset.height,
    orientation: asset.width >= asset.height ? 'landscape' : 'portrait',
  }))

  const result = await chat(config, [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: JSON.stringify({
        article: markdown.slice(0, 6000),
        anchors,
        images: imageMeta,
        lockedPlacements: locked.map(({ id: _id, ...placement }) => placement),
      }),
    },
  ])

  if (!result.success || !result.content) {
    return { placements: createSmartPlacements(markdown, assets, existing), reason: result.error }
  }

  const parsed = parsePlacementResponse(result.content)
  if (!parsed.length) {
    return { placements: createSmartPlacements(markdown, assets, existing), reason: 'AI 未返回有效图片位置' }
  }

  const anchorSet = new Set(anchors.map(anchor => anchor.anchorIndex))
  const assetSet = new Set(availableAssets.map(asset => asset.id))
  const placements = parsed
    .filter(item => assetSet.has(item.assetId) && anchorSet.has(Number(item.anchorIndex)))
    .map(item => ({
      id: makeMediaId('place'),
      assetId: item.assetId,
      anchorIndex: Number(item.anchorIndex),
      position: item.position === 'before' ? 'before' as const : 'after' as const,
      platforms: normalizePlatforms(item.platforms),
      layout: normalizeLayout(item.layout),
      caption: item.caption,
    }))

  if (!placements.length) {
    return { placements: createSmartPlacements(markdown, assets, existing), reason: 'AI 位置不在候选范围内' }
  }

  return { placements: [...locked, ...placements] }
}

function parsePlacementResponse(content: string): AIPlacementItem[] {
  try {
    const jsonText = content.match(/\{[\s\S]*\}/)?.[0] ?? content
    const parsed = JSON.parse(jsonText)
    return Array.isArray(parsed?.placements) ? parsed.placements : []
  } catch {
    return []
  }
}

function normalizePlatforms(platforms: AIPlacementItem['platforms']): MediaPlatform[] {
  if (!Array.isArray(platforms)) return ['wechat', 'xhs']
  const valid = platforms.filter(platform => platform === 'wechat' || platform === 'xhs')
  return valid.length ? valid : ['wechat', 'xhs']
}

function normalizeLayout(layout: AIPlacementItem['layout']): MediaLayout {
  if (layout === 'card' || layout === 'split' || layout === 'background') return layout
  return 'full'
}

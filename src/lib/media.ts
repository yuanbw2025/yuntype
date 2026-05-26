import { parseMarkdown, type MarkdownNode } from './render/markdown'

export type MediaPlatform = 'wechat' | 'xhs' | 'slides'
export type MediaPlacementPosition = 'before' | 'after' | 'cover' | 'background'
export type MediaLayout = 'full' | 'card' | 'split' | 'background'

export interface MediaAsset {
  id: string
  name: string
  url: string
  width: number
  height: number
  caption?: string
  createdAt: number
}

export interface MediaPlacement {
  id: string
  assetId: string
  anchorIndex: number
  position: MediaPlacementPosition
  platforms: MediaPlatform[]
  layout: MediaLayout
  caption?: string
  locked?: boolean
}

export interface AnchoredMarkdownNode extends MarkdownNode {
  anchorIndex: number
}

export function makeMediaId(prefix = 'media'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export function parseAnchoredMarkdown(markdown: string): AnchoredMarkdownNode[] {
  return parseMarkdown(markdown).map((node, anchorIndex) => ({ ...node, anchorIndex }))
}

export function getNodeLabel(node: MarkdownNode, index: number): string {
  if (node.type === 'heading') return `H${node.level ?? 2} ${node.text ?? '标题'}`
  if (node.type === 'paragraph') return node.text || `段落 ${index + 1}`
  if (node.type === 'blockquote') return `引用：${node.text ?? ''}`
  if (node.type === 'list') return `列表：${node.children?.[0] ?? ''}`
  if (node.type === 'image') return `图片：${node.alt ?? ''}`
  if (node.type === 'table') return '表格'
  if (node.type === 'code') return '代码块'
  return `内容 ${index + 1}`
}

export function getPlacementAsset(assets: MediaAsset[], placement: MediaPlacement): MediaAsset | undefined {
  return assets.find(asset => asset.id === placement.assetId)
}

export function placementsForAnchor(
  placements: MediaPlacement[],
  platform: MediaPlatform,
  anchorIndex: number,
  position: MediaPlacementPosition,
): MediaPlacement[] {
  return placements.filter(placement =>
    placement.anchorIndex === anchorIndex &&
    placement.position === position &&
    placement.platforms.includes(platform)
  )
}

export function createSmartPlacements(
  markdown: string,
  assets: MediaAsset[],
  existing: MediaPlacement[],
  platforms: MediaPlatform[] = ['wechat', 'xhs'],
): MediaPlacement[] {
  const nodes = parseAnchoredMarkdown(markdown)
  if (nodes.length === 0 || assets.length === 0) return existing

  const locked = existing.filter(placement => placement.locked)
  const usedAssetIds = new Set(locked.map(placement => placement.assetId))
  const availableAssets = assets.filter(asset => !usedAssetIds.has(asset.id))
  if (availableAssets.length === 0) return locked

  const anchors = nodes
    .filter(node => node.type === 'heading' || node.type === 'paragraph' || node.type === 'blockquote')
    .map(node => node.anchorIndex)

  if (anchors.length === 0) return locked

  const step = Math.max(1, Math.floor(anchors.length / (availableAssets.length + 1)))
  const generated = availableAssets.map((asset, index) => {
    const anchorIndex = anchors[Math.min(anchors.length - 1, (index + 1) * step)]
    const isLandscape = asset.width >= asset.height
    return {
      id: makeMediaId('place'),
      assetId: asset.id,
      anchorIndex,
      position: 'after' as const,
      platforms,
      layout: isLandscape ? 'full' as const : 'card' as const,
      caption: asset.caption,
    }
  })

  return [...locked, ...generated]
}

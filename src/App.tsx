// 云中书 YunType — Preview First 主应用布局

import { lazy, Suspense, useState, useMemo, useEffect, useCallback } from 'react'
import ApiConfigDialog from './components/ApiConfigDialog'
import GuideOverlay from './components/GuideOverlay'
import AppHeader, { type ModeMeta } from './components/shell/AppHeader'
import IconSidebar, { type ShellPanel } from './components/shell/IconSidebar'
import ShellPanelFrame from './components/shell/ShellPanelFrame'
import FloatingActionBar from './components/shell/FloatingActionBar'
import { randomAtomIdsV2, getStyleComboV2, getComboNameV2, TOTAL_COMBOS_V2, defaultAtomIdsV2, type AtomIdsV2 } from './lib/atoms'
import type { MediaAsset, MediaPlacement } from './lib/media'

const ArticleEditorPanel = lazy(() => import('./components/panels/ArticleEditorPanel'))
const MediaPanel = lazy(() => import('./components/panels/MediaPanel'))
const StyleGalleryPanel = lazy(() => import('./components/panels/StyleGalleryPanel'))
const WechatPreview = lazy(() => import('./components/WechatPreview'))
const ExportPanel = lazy(() => import('./components/ExportPanel'))
const XiaohongshuPreview = lazy(() => import('./components/XiaohongshuPreview'))
const InfographicPanel = lazy(() => import('./components/InfographicPanel'))
const WebGenPanel = lazy(() => import('./components/WebGenPanel'))
const ImageGenPanel = lazy(() => import('./components/ImageGenPanel'))
const PresentationPanel = lazy(() => import('./components/PresentationPanel'))
const SlidesEditorPanel = lazy(() => import('./components/SlidesEditorPanel'))

export type AppMode = 'wechat' | 'xiaohongshu' | 'infographic' | 'webpage' | 'imagegen' | 'presentation' | 'slides'

const MODES: ModeMeta[] = [
  { key: 'wechat', icon: '📝', label: '公众号', color: '#07C160' },
  { key: 'xiaohongshu', icon: '📸', label: '小红书', color: '#E8294A' },
  { key: 'infographic', icon: '📊', label: '信息图', color: '#7C3AED' },
  { key: 'imagegen', icon: '🎨', label: '配图', color: '#0284C7' },
  { key: 'webpage', icon: '🌐', label: '网页', color: '#059669' },
  { key: 'presentation', icon: '🎬', label: '演示', color: '#D97706' },
  { key: 'slides', icon: '🎞', label: '幻灯片', color: '#0891B2' },
]

export default function App() {
  const [article, setArticle] = useState('')
  const [atomIdsV2, setAtomIdsV2] = useState<AtomIdsV2>(() => {
    try {
      const raw = localStorage.getItem('yuntype-atom-ids-v2')
      if (raw) return JSON.parse(raw) as AtomIdsV2
    } catch {}
    return defaultAtomIdsV2()
  })
  const [mode, setMode] = useState<AppMode>('wechat')
  const [activePanel, setActivePanel] = useState<ShellPanel>('style')
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([])
  const [mediaPlacements, setMediaPlacements] = useState<MediaPlacement[]>([])
  const [showApiConfig, setShowApiConfig] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('yuntype-dark-mode') === 'true'
    }
    return false
  })

  // 深色模式持久化
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    localStorage.setItem('yuntype-dark-mode', String(darkMode))
  }, [darkMode])

  // 排版配置持久化（含 colorOverride）
  useEffect(() => {
    localStorage.setItem('yuntype-atom-ids-v2', JSON.stringify(atomIdsV2))
  }, [atomIdsV2])

  const handleShuffle = useCallback(() => {
    setAtomIdsV2(randomAtomIdsV2())
  }, [])

  useEffect(() => {
    if (mode === 'wechat' || mode === 'xiaohongshu') {
      setActivePanel(prev => prev ?? 'style')
    } else {
      setActivePanel(null)
    }
  }, [mode])

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+R — 随机排版
      if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        e.preventDefault()
        handleShuffle()
      }
      // Ctrl+E — 导出（触发导出面板下载）
      if (e.ctrlKey && !e.shiftKey && e.key === 'e') {
        e.preventDefault()
        // 触发导出按钮点击
        const exportBtn = document.querySelector('[data-export-btn]') as HTMLButtonElement
        if (exportBtn) exportBtn.click()
      }
      // Ctrl+D — 深色模式切换
      if (e.ctrlKey && !e.shiftKey && e.key === 'd') {
        e.preventDefault()
        setDarkMode(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleShuffle])

  // 注册 Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/yuntype/sw.js', { scope: '/yuntype/' }).catch(() => {})
    }
  }, [])

  const finalStyle = useMemo(() => getStyleComboV2(atomIdsV2), [atomIdsV2])

  const comboName = getComboNameV2(atomIdsV2)
  const totalCombos = TOTAL_COMBOS_V2
  const showTypesettingPanel = mode === 'wechat' || mode === 'xiaohongshu'
  const visiblePanel = showTypesettingPanel ? activePanel : null

  return (
    <div className="yt-app">
      {/* 新手引导 */}
      <GuideOverlay />

      {/* AI 文章分析对话框 */}
      <ApiConfigDialog
        visible={showApiConfig}
        onClose={() => setShowApiConfig(false)}
        article={article}
        onApplyRecommendation={(ids) => {
          setAtomIdsV2(ids)
          setShowApiConfig(false)
        }}
      />

      <AppHeader
        mode={mode}
        modes={MODES}
        darkMode={darkMode}
        comboName={`${totalCombos}+ · ${comboName}`}
        onModeChange={setMode}
        onAnalyze={() => setShowApiConfig(true)}
        onToggleDark={() => setDarkMode(prev => !prev)}
      />

      {/* 主内容区 */}
      <div className="yt-workspace">
        <IconSidebar mode={mode} activePanel={visiblePanel} onToggle={setActivePanel} />

        {visiblePanel === 'article' && (
          <ShellPanelFrame title="文章编辑" subtitle="粘贴 Markdown 或纯文本">
            <Suspense fallback={<PanelLoading />}>
              <ArticleEditorPanel value={article} onChange={setArticle} />
            </Suspense>
          </ShellPanelFrame>
        )}

        {visiblePanel === 'style' && (
          <ShellPanelFrame title="风格选择" subtitle="场景预设、骨架、配色和插槽">
            <Suspense fallback={<PanelLoading />}>
              <StyleGalleryPanel
                atomIdsV2={atomIdsV2}
                onChange={setAtomIdsV2}
                onShuffle={handleShuffle}
                article={article}
              />
            </Suspense>
          </ShellPanelFrame>
        )}

        {visiblePanel === 'media' && (
          <ShellPanelFrame title="图片素材" subtitle="上传图片并编排到文章中">
            <Suspense fallback={<PanelLoading />}>
              <MediaPanel
                markdown={article}
                assets={mediaAssets}
                placements={mediaPlacements}
                onAssetsChange={setMediaAssets}
                onPlacementsChange={setMediaPlacements}
              />
            </Suspense>
          </ShellPanelFrame>
        )}

        {visiblePanel === 'export' && mode === 'wechat' && (
          <ShellPanelFrame title="导出" subtitle="复制富文本或下载 HTML">
            <Suspense fallback={<PanelLoading />}>
              <ExportPanel markdown={article} style={finalStyle} mediaAssets={mediaAssets} mediaPlacements={mediaPlacements} />
            </Suspense>
          </ShellPanelFrame>
        )}

        {/* 右栏：预览 + 导出（根据模式切换） */}
        <main className="yt-canvas">
          <div className="yt-canvas-content">
            <Suspense fallback={<CanvasLoading />}>
              {mode === 'wechat' && (
                <WechatPreview
                  markdown={article}
                  style={finalStyle}
                  comboName={comboName}
                  mediaAssets={mediaAssets}
                  mediaPlacements={mediaPlacements}
                />
              )}
              {mode === 'xiaohongshu' && (
                <XiaohongshuPreview
                  markdown={article}
                  style={finalStyle}
                  comboName={comboName}
                  atomIdsV2={atomIdsV2}
                  mediaAssets={mediaAssets}
                  mediaPlacements={mediaPlacements}
                  onShuffle={handleShuffle}
                  onColorChange={(colorId, override) =>
                    setAtomIdsV2({ ...atomIdsV2, colorId, colorOverride: override })
                  }
                />
              )}
              {mode === 'infographic' && (
                <InfographicPanel style={finalStyle} />
              )}
              {mode === 'imagegen' && (
                <ImageGenPanel />
              )}
              {mode === 'webpage' && (
                <WebGenPanel />
              )}
              {mode === 'presentation' && (
                <PresentationPanel />
              )}
              {mode === 'slides' && (
                <SlidesEditorPanel />
              )}
            </Suspense>
          </div>
          <FloatingActionBar
            mode={mode}
            markdown={article}
            style={finalStyle}
            mediaAssets={mediaAssets}
            mediaPlacements={mediaPlacements}
            onShuffle={handleShuffle}
            onOpenPanel={setActivePanel}
          />
        </main>
      </div>
    </div>
  )
}

function PanelLoading() {
  return <div className="yt-panel-loading">加载中...</div>
}

function CanvasLoading() {
  return <div className="yt-canvas-loading">加载中...</div>
}

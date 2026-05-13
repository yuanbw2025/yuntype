// 云中书 YunType — 主应用布局（三栏：输入 | 风格 | 预览）

import { useState, useMemo, useEffect, useCallback } from 'react'
import ArticleInput from './components/ArticleInput'
import LayoutPanel from './components/LayoutPanel'
import WechatPreview from './components/WechatPreview'
import ExportPanel from './components/ExportPanel'
import XiaohongshuPreview from './components/XiaohongshuPreview'
import InfographicPanel from './components/InfographicPanel'
import WebGenPanel from './components/WebGenPanel'
import ImageGenPanel from './components/ImageGenPanel'
import PresentationPanel from './components/PresentationPanel'
import ApiConfigDialog from './components/ApiConfigDialog'
import GuideOverlay from './components/GuideOverlay'
import { randomAtomIdsV2, getStyleComboV2, getComboNameV2, TOTAL_COMBOS_V2, defaultAtomIdsV2, type AtomIdsV2 } from './lib/atoms'

type AppMode = 'wechat' | 'xiaohongshu' | 'infographic' | 'webpage' | 'imagegen' | 'presentation'

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

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: '#f5f5f5',
    }}>
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

      {/* 顶栏 */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 20px',
        background: '#fff',
        borderBottom: '1px solid #e5e5e5',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>☁️</span>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#333' }}>云中书 YunType</span>
          <span style={{ fontSize: '12px', color: '#999', marginLeft: '8px' }}>
            {totalCombos}+ 种排版组合
          </span>
        </div>

        {/* 模式切换 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {([
            { key: 'wechat' as AppMode, label: '📝 公众号', color: '#07C160' },
            { key: 'xiaohongshu' as AppMode, label: '📸 小红书', color: '#FF2442' },
            { key: 'infographic' as AppMode, label: '📊 信息图', color: '#4F46E5' },
            { key: 'imagegen' as AppMode, label: '🎨 配图', color: '#4F46E5' },
            { key: 'webpage' as AppMode, label: '🌐 网页', color: '#059669' },
            { key: 'presentation' as AppMode, label: '🎬 演示', color: '#7C3AED' },
          ]).map(({ key, label, color }, i, arr) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: mode === key ? 700 : 400,
                color: mode === key ? '#fff' : '#666',
                background: mode === key ? color : '#f0f0f0',
                border: 'none',
                borderRadius: i === 0 ? '6px 0 0 6px' : i === arr.length - 1 ? '0 6px 6px 0' : '0',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* AI 分析按钮 — 仅排版模式下显示 */}
          {(mode === 'wechat' || mode === 'xiaohongshu') && (
            <button
              onClick={() => setShowApiConfig(true)}
              style={{
                padding: '5px 12px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#059669',
                background: '#ECFDF5',
                border: '1px solid #05966930',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              🤖 AI分析
            </button>
          )}
          {/* 深色模式切换 */}
          <button
            onClick={() => setDarkMode(prev => !prev)}
            title="Ctrl+D 切换深色模式"
            style={{
              padding: '4px 8px',
              fontSize: '14px',
              background: 'none',
              border: '1px solid #e5e5e5',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          {(mode === 'wechat' || mode === 'xiaohongshu') && (
            <div style={{ fontSize: '12px', color: '#999' }}>
              当前: {comboName}
            </div>
          )}
        </div>
      </header>

      {/* 主内容区 */}
      <div style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
      }}>
        {/* 左栏：文章输入（信息图/网页模式下隐藏） */}
        {mode !== 'infographic' && mode !== 'webpage' && mode !== 'imagegen' && mode !== 'presentation' && (
          <div style={{
            width: '30%',
            minWidth: '280px',
            background: '#fff',
            borderRight: '1px solid #e5e5e5',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <ArticleInput value={article} onChange={setArticle} />
          </div>
        )}

        {/* 中栏：风格面板（信息图/网页/配图模式下隐藏） */}
        {mode !== 'infographic' && mode !== 'webpage' && mode !== 'imagegen' && mode !== 'presentation' && (
          <div style={{
            width: '260px',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            background: '#fff',
            borderRight: '1px solid #e5e5e5',
            overflow: 'hidden',
          }}>
            <LayoutPanel
              atomIdsV2={atomIdsV2}
              onChange={setAtomIdsV2}
              onShuffle={handleShuffle}
              article={article}
            />
          </div>
        )}

        {/* 右栏：预览 + 导出（根据模式切换） */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {mode === 'wechat' && (
            <>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <WechatPreview
                  markdown={article}
                  style={finalStyle}
                  comboName={comboName}
                />
              </div>
              <ExportPanel markdown={article} style={finalStyle} />
            </>
          )}
          {mode === 'xiaohongshu' && (
            <XiaohongshuPreview
              markdown={article}
              style={finalStyle}
              comboName={comboName}
              atomIdsV2={atomIdsV2}
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
        </div>
      </div>
    </div>
  )
}

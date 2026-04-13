// 云中书 YunType — 主应用布局（三栏：输入 | 风格 | 预览）

import { useState, useMemo, useEffect, useCallback } from 'react'
import ArticleInput from './components/ArticleInput'
import StylePanel from './components/StylePanel'
import LayoutPanel from './components/LayoutPanel'
import WechatPreview from './components/WechatPreview'
import ExportPanel from './components/ExportPanel'
import XiaohongshuPreview from './components/XiaohongshuPreview'
import InfographicPanel from './components/InfographicPanel'
import AIImageDialog from './components/AIImageDialog'
import ApiConfigDialog from './components/ApiConfigDialog'
import GuideOverlay from './components/GuideOverlay'
import { randomAtomIds, getStyleCombo, getComboName, TOTAL_COMBOS, type AtomIds, randomAtomIdsV2, getStyleComboV2, getComboNameV2, TOTAL_COMBOS_V2, defaultAtomIdsV2, type AtomIdsV2 } from './lib/atoms'
import { defaultTuneParams, applyTuning, type TuneParams } from './lib/atoms/presets'
import { pushHistory } from './lib/storage'

type AppMode = 'wechat' | 'xiaohongshu' | 'infographic'

export default function App() {
  const [article, setArticle] = useState('')
  const [atomIds, setAtomIds] = useState<AtomIds>(randomAtomIds)
  const [tuneParams, setTuneParams] = useState<TuneParams>(defaultTuneParams)
  const [atomIdsV2, setAtomIdsV2] = useState<AtomIdsV2>(defaultAtomIdsV2)
  const [useV2, setUseV2] = useState(true) // 默认启用 V2
  const [mode, setMode] = useState<AppMode>('wechat')
  const [showAIImage, setShowAIImage] = useState(false)
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

  const handleShuffle = useCallback(() => {
    if (useV2) {
      setAtomIdsV2(randomAtomIdsV2())
    } else {
      setAtomIds(randomAtomIds())
      setTuneParams(defaultTuneParams)
    }
  }, [useV2])

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

  // 计算最终样式（原子 + 微调）
  const finalStyle = useMemo(() => {
    const base = getStyleCombo(atomIds)
    return applyTuning(base, tuneParams)
  }, [atomIds, tuneParams])

  const finalStyleV2 = useMemo(() => getStyleComboV2(atomIdsV2), [atomIdsV2])

  const comboName = useV2 ? getComboNameV2(atomIdsV2) : getComboName(atomIds)
  const totalCombos = useV2 ? TOTAL_COMBOS_V2 : TOTAL_COMBOS

  // 记录历史（atomIds变化时）
  useEffect(() => {
    pushHistory({ atomIds, tuneParams, comboName })
  }, [atomIds.colorId, atomIds.layoutId, atomIds.decorationId, atomIds.typographyId])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: '#f5f5f5',
    }}>
      {/* 新手引导 */}
      <GuideOverlay />

      {/* AI 生图对话框 */}
      <AIImageDialog
        visible={showAIImage}
        onClose={() => setShowAIImage(false)}
        style={finalStyle}
        selectedText={article.slice(0, 200)}
      />

      {/* AI 文章分析对话框 */}
      <ApiConfigDialog
        visible={showApiConfig}
        onClose={() => setShowApiConfig(false)}
        article={article}
        onApplyRecommendation={(ids, tune) => {
          setAtomIds(ids)
          if (tune) setTuneParams(tune)
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

        {/* V1/V2 切换 + 模式切换 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setUseV2(!useV2)}
            style={{
              padding: '5px 10px', fontSize: '11px', fontWeight: 600,
              color: useV2 ? '#4F46E5' : '#999',
              background: useV2 ? '#EEF0FF' : '#f5f5f5',
              border: `1px solid ${useV2 ? '#4F46E530' : '#ddd'}`,
              borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            {useV2 ? '🏗️ V2 骨架' : '⚙️ V1 经典'}
          </button>
          {([
            { key: 'wechat' as AppMode, label: '📝 公众号', color: '#07C160' },
            { key: 'xiaohongshu' as AppMode, label: '📸 小红书', color: '#FF2442' },
            { key: 'infographic' as AppMode, label: '📊 信息图', color: '#4F46E5' },
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
          {/* AI 分析按钮 */}
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
          {/* AI 生图按钮 */}
          <button
            onClick={() => setShowAIImage(true)}
            style={{
              padding: '5px 12px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#4F46E5',
              background: '#EEF0FF',
              border: '1px solid #4F46E530',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            🎨 AI生图
          </button>
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
          <div style={{ fontSize: '12px', color: '#999' }}>
            当前: {comboName}
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <div style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
      }}>
        {/* 左栏：文章输入（信息图模式下隐藏） */}
        {mode !== 'infographic' && (
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

        {/* 中栏：风格面板（信息图模式下隐藏） */}
        {mode !== 'infographic' && (
          <div style={{
            width: '260px',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            background: '#fff',
            borderRight: '1px solid #e5e5e5',
            overflow: 'hidden',
          }}>
            {useV2 ? (
              <LayoutPanel
                atomIdsV2={atomIdsV2}
                onChange={setAtomIdsV2}
                onShuffle={handleShuffle}
                article={article}
              />
            ) : (
              <StylePanel
                atomIds={atomIds}
                tuneParams={tuneParams}
                onAtomIdsChange={setAtomIds}
                onTuneChange={setTuneParams}
                onShuffle={handleShuffle}
              />
            )}
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
                  styleV2={finalStyleV2}
                  useV2={useV2}
                  comboName={comboName}
                  atomIds={atomIds}
                />
              </div>
              <ExportPanel markdown={article} style={finalStyle} />
            </>
          )}
          {mode === 'xiaohongshu' && (
            <XiaohongshuPreview
              markdown={article}
              style={finalStyle}
              styleV2={finalStyleV2}
              useV2={useV2}
              comboName={comboName}
              atomIds={atomIds}
            />
          )}
          {mode === 'infographic' && (
            <InfographicPanel style={finalStyle} />
          )}
        </div>
      </div>
    </div>
  )
}

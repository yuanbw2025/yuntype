// 云中书 YunType — 主应用布局（三栏：输入 | 风格 | 预览）

import { useState, useMemo, useEffect } from 'react'
import ArticleInput from './components/ArticleInput'
import StylePanel from './components/StylePanel'
import WechatPreview from './components/WechatPreview'
import ExportPanel from './components/ExportPanel'
import XiaohongshuPreview from './components/XiaohongshuPreview'
import InfographicPanel from './components/InfographicPanel'
import AIImageDialog from './components/AIImageDialog'
import ApiConfigDialog from './components/ApiConfigDialog'
import GuideOverlay from './components/GuideOverlay'
import { randomAtomIds, getStyleCombo, getComboName, TOTAL_COMBOS, type AtomIds } from './lib/atoms'
import { defaultTuneParams, applyTuning, type TuneParams } from './lib/atoms/presets'
import { pushHistory } from './lib/storage'

type AppMode = 'wechat' | 'xiaohongshu' | 'infographic'

export default function App() {
  const [article, setArticle] = useState('')
  const [atomIds, setAtomIds] = useState<AtomIds>(randomAtomIds)
  const [tuneParams, setTuneParams] = useState<TuneParams>(defaultTuneParams)
  const [mode, setMode] = useState<AppMode>('wechat')
  const [showAIImage, setShowAIImage] = useState(false)
  const [showApiConfig, setShowApiConfig] = useState(false)

  const handleShuffle = () => {
    setAtomIds(randomAtomIds())
    setTuneParams(defaultTuneParams)
  }

  // 计算最终样式（原子 + 微调）
  const finalStyle = useMemo(() => {
    const base = getStyleCombo(atomIds)
    return applyTuning(base, tuneParams)
  }, [atomIds, tuneParams])

  const comboName = getComboName(atomIds)

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
            {TOTAL_COMBOS} 种排版组合
          </span>
        </div>

        {/* 模式切换 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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
            width: '240px',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
          }}>
            <StylePanel
              atomIds={atomIds}
              tuneParams={tuneParams}
              onAtomIdsChange={setAtomIds}
              onTuneChange={setTuneParams}
              onShuffle={handleShuffle}
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

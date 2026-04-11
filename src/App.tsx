// 云中书 YunType — 主应用布局（三栏：输入 | 风格 | 预览）

import { useState, useMemo } from 'react'
import ArticleInput from './components/ArticleInput'
import StylePanel from './components/StylePanel'
import WechatPreview from './components/WechatPreview'
import ExportPanel from './components/ExportPanel'
import XiaohongshuPreview from './components/XiaohongshuPreview'
import { randomAtomIds, getStyleCombo, getComboName, TOTAL_COMBOS, type AtomIds } from './lib/atoms'
import { defaultTuneParams, applyTuning, type TuneParams } from './lib/atoms/presets'

type AppMode = 'wechat' | 'xiaohongshu'

export default function App() {
  const [article, setArticle] = useState('')
  const [atomIds, setAtomIds] = useState<AtomIds>(randomAtomIds)
  const [tuneParams, setTuneParams] = useState<TuneParams>(defaultTuneParams)
  const [mode, setMode] = useState<AppMode>('wechat')

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

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: '#f5f5f5',
    }}>
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
          <button
            onClick={() => setMode('wechat')}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: mode === 'wechat' ? 700 : 400,
              color: mode === 'wechat' ? '#fff' : '#666',
              background: mode === 'wechat' ? '#07C160' : '#f0f0f0',
              border: 'none',
              borderRadius: '6px 0 0 6px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            📝 公众号
          </button>
          <button
            onClick={() => setMode('xiaohongshu')}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: mode === 'xiaohongshu' ? 700 : 400,
              color: mode === 'xiaohongshu' ? '#fff' : '#666',
              background: mode === 'xiaohongshu' ? '#FF2442' : '#f0f0f0',
              border: 'none',
              borderRadius: '0 6px 6px 0',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            📸 小红书
          </button>
        </div>

        <div style={{ fontSize: '12px', color: '#999' }}>
          当前: {comboName}
        </div>
      </header>

      {/* 主内容区：三栏 */}
      <div style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
      }}>
        {/* 左栏：文章输入 */}
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

        {/* 中栏：风格面板 */}
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

        {/* 右栏：预览 + 导出（根据模式切换） */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {mode === 'wechat' ? (
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
          ) : (
            <XiaohongshuPreview
              markdown={article}
              style={finalStyle}
              comboName={comboName}
              atomIds={atomIds}
            />
          )}
        </div>
      </div>
    </div>
  )
}

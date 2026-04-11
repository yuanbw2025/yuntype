// 云中书 YunType — 主应用布局（三栏：输入 | 风格 | 预览）

import { useState, useMemo } from 'react'
import ArticleInput from './components/ArticleInput'
import StylePanel from './components/StylePanel'
import WechatPreview from './components/WechatPreview'
import ExportPanel from './components/ExportPanel'
import { randomAtomIds, getStyleCombo, getComboName, TOTAL_COMBOS, type AtomIds } from './lib/atoms'
import { defaultTuneParams, applyTuning, type TuneParams } from './lib/atoms/presets'

export default function App() {
  const [article, setArticle] = useState('')
  const [atomIds, setAtomIds] = useState<AtomIds>(randomAtomIds)
  const [tuneParams, setTuneParams] = useState<TuneParams>(defaultTuneParams)

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

        {/* 右栏：预览 + 导出 */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <WechatPreview
              markdown={article}
              style={finalStyle}
              comboName={comboName}
              atomIds={atomIds}
            />
          </div>
          <ExportPanel markdown={article} style={finalStyle} />
        </div>
      </div>
    </div>
  )
}

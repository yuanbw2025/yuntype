// 云中书 YunType — 主应用布局

import { useState } from 'react'
import ArticleInput from './components/ArticleInput'
import WechatPreview from './components/WechatPreview'
import ExportPanel from './components/ExportPanel'
import { randomAtomIds, TOTAL_COMBOS, type AtomIds } from './lib/atoms'

export default function App() {
  const [article, setArticle] = useState('')
  const [atomIds, setAtomIds] = useState<AtomIds>(randomAtomIds)

  const handleShuffle = () => {
    setAtomIds(randomAtomIds())
  }

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
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>☁️</span>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#333' }}>云中书 YunType</span>
          <span style={{ fontSize: '12px', color: '#999', marginLeft: '8px' }}>
            {TOTAL_COMBOS} 种排版组合
          </span>
        </div>
        <div style={{ fontSize: '12px', color: '#999' }}>
          公众号排版模式
        </div>
      </header>

      {/* 主内容区：左右分栏 */}
      <div style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
      }}>
        {/* 左侧：输入 */}
        <div style={{
          width: '40%',
          minWidth: '300px',
          background: '#fff',
          borderRight: '1px solid #e5e5e5',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <ArticleInput value={article} onChange={setArticle} />
          </div>
        </div>

        {/* 右侧：预览 + 导出 */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <WechatPreview
              markdown={article}
              atomIds={atomIds}
              onShuffle={handleShuffle}
            />
          </div>
          <ExportPanel markdown={article} atomIds={atomIds} />
        </div>
      </div>
    </div>
  )
}

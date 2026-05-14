// 字体选择面板 — 在 StylePanel 中作为新 Tab 展示

import { useState, useEffect } from 'react'
import {
  fontRegistry,
  loadFont,
  isFontLoaded,
  getFontsByCategory,
  loadCustomFontConfig,
  saveCustomFontConfig,
  type FontInfo,
} from '../lib/fonts'

interface FontPanelProps {
  onFontChange?: (titleFont: string, bodyFont: string) => void
}

type Category = 'all' | 'sans' | 'serif' | 'display' | 'handwriting'

const categoryLabels: Record<Category, string> = {
  all: '全部',
  sans: '无衬线',
  serif: '衬线',
  display: '展示',
  handwriting: '手写',
}

export default function FontPanel({ onFontChange }: FontPanelProps) {
  const [category, setCategory] = useState<Category>('all')
  const [titleFontId, setTitleFontId] = useState('system-sans')
  const [bodyFontId, setBodyFontId] = useState('system-sans')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [, forceUpdate] = useState(0)

  // 加载已保存配置
  useEffect(() => {
    const saved = loadCustomFontConfig()
    if (saved) {
      setTitleFontId(saved.titleFont)
      setBodyFontId(saved.bodyFont)
    }
  }, [])

  const fonts = category === 'all'
    ? fontRegistry
    : getFontsByCategory(category as FontInfo['category'])

  const handleSelectFont = async (fontId: string, target: 'title' | 'body') => {
    // 如果字体未加载，先加载
    if (!isFontLoaded(fontId)) {
      setLoadingId(fontId)
      try {
        await loadFont(fontId)
        forceUpdate(n => n + 1)
      } catch (e) {
        alert('字体加载失败: ' + (e instanceof Error ? e.message : '未知错误'))
      } finally {
        setLoadingId(null)
      }
    }

    const newTitle = target === 'title' ? fontId : titleFontId
    const newBody = target === 'body' ? fontId : bodyFontId

    if (target === 'title') setTitleFontId(fontId)
    else setBodyFontId(fontId)

    saveCustomFontConfig({ titleFont: newTitle, bodyFont: newBody })

    const titleFont = fontRegistry.find(f => f.id === newTitle)
    const bodyFont = fontRegistry.find(f => f.id === newBody)
    if (titleFont && bodyFont) {
      onFontChange?.(titleFont.css, bodyFont.css)
    }
  }

  return (
    <div style={{ padding: '12px', fontSize: '12px' }}>
      {/* 当前选择 */}
      <div style={{
        padding: '10px',
        background: '#F0F4FF',
        borderRadius: '8px',
        marginBottom: '12px',
      }}>
        <div style={{ fontWeight: 600, marginBottom: '6px', color: '#4F46E5' }}>🔤 当前字体</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#888', fontSize: '10px', marginBottom: '2px' }}>标题</div>
            <div style={{ color: '#333', fontWeight: 600 }}>
              {fontRegistry.find(f => f.id === titleFontId)?.name || '系统默认'}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#888', fontSize: '10px', marginBottom: '2px' }}>正文</div>
            <div style={{ color: '#333', fontWeight: 600 }}>
              {fontRegistry.find(f => f.id === bodyFontId)?.name || '系统默认'}
            </div>
          </div>
        </div>
      </div>

      {/* 分类筛选 */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '12px', flexWrap: 'wrap' }}>
        {(Object.entries(categoryLabels) as [Category, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setCategory(key)}
            style={{
              padding: '3px 8px',
              fontSize: '11px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              background: category === key ? '#4F46E5' : '#f0f0f0',
              color: category === key ? '#fff' : '#666',
              fontWeight: category === key ? 600 : 400,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 字体列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {fonts.map(font => {
          const isLoaded = isFontLoaded(font.id)
          const isLoading = loadingId === font.id
          const isTitleSelected = titleFontId === font.id
          const isBodySelected = bodyFontId === font.id

          return (
            <div
              key={font.id}
              style={{
                padding: '10px',
                background: (isTitleSelected || isBodySelected) ? '#F5F3FF' : '#fff',
                border: `1px solid ${(isTitleSelected || isBodySelected) ? '#4F46E530' : '#e8e8e8'}`,
                borderRadius: '8px',
              }}
            >
              {/* 字体名称 + 状态 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <div>
                  <span style={{ fontWeight: 600, color: '#333' }}>{font.name}</span>
                  <span style={{ color: '#999', marginLeft: '6px', fontSize: '10px' }}>{font.nameEn}</span>
                </div>
                <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                  {isLoading && <span style={{ fontSize: '10px', color: '#4F46E5' }}>加载中...</span>}
                  {!font.url && <span style={{ fontSize: '9px', color: '#22C55E', background: '#F0FDF4', padding: '1px 4px', borderRadius: '3px' }}>系统</span>}
                  {font.url && isLoaded && <span style={{ fontSize: '9px', color: '#4F46E5', background: '#EEF0FF', padding: '1px 4px', borderRadius: '3px' }}>已加载</span>}
                  {font.url && !isLoaded && !isLoading && <span style={{ fontSize: '9px', color: '#999', background: '#f5f5f5', padding: '1px 4px', borderRadius: '3px' }}>CDN</span>}
                </div>
              </div>

              {/* 预览文字 */}
              <div style={{
                fontFamily: isLoaded ? font.css : 'inherit',
                fontSize: '14px',
                color: '#555',
                marginBottom: '6px',
                lineHeight: 1.6,
              }}>
                {isLoaded ? '云中书排版工具 ABC 123' : '点击加载预览字体'}
              </div>

              {/* 描述 */}
              <div style={{ fontSize: '10px', color: '#999', marginBottom: '6px' }}>{font.description}</div>

              {/* 操作按钮 */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => handleSelectFont(font.id, 'title')}
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    padding: '4px',
                    fontSize: '10px',
                    fontWeight: isTitleSelected ? 700 : 400,
                    border: `1px solid ${isTitleSelected ? '#4F46E5' : '#ddd'}`,
                    borderRadius: '4px',
                    background: isTitleSelected ? '#4F46E5' : '#fff',
                    color: isTitleSelected ? '#fff' : '#666',
                    cursor: isLoading ? 'wait' : 'pointer',
                  }}
                >
                  {isTitleSelected ? '✓ 标题字体' : '设为标题'}
                </button>
                <button
                  onClick={() => handleSelectFont(font.id, 'body')}
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    padding: '4px',
                    fontSize: '10px',
                    fontWeight: isBodySelected ? 700 : 400,
                    border: `1px solid ${isBodySelected ? '#059669' : '#ddd'}`,
                    borderRadius: '4px',
                    background: isBodySelected ? '#059669' : '#fff',
                    color: isBodySelected ? '#fff' : '#666',
                    cursor: isLoading ? 'wait' : 'pointer',
                  }}
                >
                  {isBodySelected ? '✓ 正文字体' : '设为正文'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

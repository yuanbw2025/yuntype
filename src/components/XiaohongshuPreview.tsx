// 小红书预览组件 — 缩略图网格 + 大图预览

import { useState, useMemo } from 'react'
import { splitToPages, renderXhsPageHTML, XHS_PRESETS, type XhsConfig } from '../lib/render/xiaohongshu'
import { exportAllPagesAsZip, downloadSinglePage } from '../lib/export/image'
import type { StyleCombo, AtomIds } from '../lib/atoms'

interface XhsPreviewProps {
  markdown: string
  style: StyleCombo
  comboName: string
  atomIds: AtomIds
}

type AspectRatio = '3:4' | '1:1' | '16:9'

export default function XiaohongshuPreview({ markdown, style, comboName, atomIds: _atomIds }: XhsPreviewProps) {
  const [ratio, setRatio] = useState<AspectRatio>('3:4')
  const [selectedPage, setSelectedPage] = useState(0)
  const [exporting, setExporting] = useState(false)
  const [progress, setProgress] = useState(0)

  const config: XhsConfig = XHS_PRESETS[ratio]

  const pages = useMemo(() => {
    if (!markdown.trim()) return []
    return splitToPages(markdown, config)
  }, [markdown, config])

  const selectedPageHtml = useMemo(() => {
    if (pages.length === 0) return ''
    const page = pages[Math.min(selectedPage, pages.length - 1)]
    return renderXhsPageHTML(page, style, config)
  }, [pages, selectedPage, style, config])

  const handleExportZip = async () => {
    if (pages.length === 0) return
    setExporting(true)
    setProgress(0)
    try {
      await exportAllPagesAsZip(pages, style, config, (p) => setProgress(p))
    } catch (e) {
      console.error('导出失败:', e)
    } finally {
      setExporting(false)
    }
  }

  const handleDownloadSingle = async () => {
    if (pages.length === 0) return
    const page = pages[Math.min(selectedPage, pages.length - 1)]
    setExporting(true)
    try {
      await downloadSinglePage(page, style, config)
    } catch (e) {
      console.error('下载失败:', e)
    } finally {
      setExporting(false)
    }
  }

  // 缩略图尺寸
  const thumbW = 100
  const thumbH = Math.round(thumbW * (config.height / config.width))
  const previewScale = Math.min(400 / config.width, 550 / config.height, 1)

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#f5f5f5',
    }}>
      {/* 顶部工具栏 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 16px',
        background: '#fff',
        borderBottom: '1px solid #e5e5e5',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>📸 小红书图片组</span>
          <span style={{ fontSize: '12px', color: '#999' }}>
            {pages.length > 0 ? `${pages.length} 张` : '暂无'}
          </span>
        </div>

        {/* 比例选择 */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {(['3:4', '1:1', '16:9'] as AspectRatio[]).map((r) => (
            <button
              key={r}
              onClick={() => { setRatio(r); setSelectedPage(0) }}
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: ratio === r ? 700 : 400,
                color: ratio === r ? '#fff' : '#666',
                background: ratio === r ? '#4F46E5' : '#f0f0f0',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* 主内容区 */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* 左侧：缩略图列表 */}
        <div style={{
          width: `${thumbW + 24}px`,
          flexShrink: 0,
          overflow: 'auto',
          padding: '12px',
          background: '#fafafa',
          borderRight: '1px solid #e5e5e5',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          {pages.length === 0 ? (
            <div style={{ fontSize: '11px', color: '#999', textAlign: 'center', padding: '20px 0' }}>
              输入文章后<br />自动分页
            </div>
          ) : (
            pages.map((page, i) => (
              <div
                key={i}
                onClick={() => setSelectedPage(i)}
                style={{
                  width: `${thumbW}px`,
                  height: `${thumbH}px`,
                  background: style.color.colors.pageBg,
                  border: `2px solid ${selectedPage === i ? '#4F46E5' : '#ddd'}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                {/* 页码标签 */}
                <div style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '4px',
                  fontSize: '10px',
                  color: style.color.colors.textMuted,
                  fontWeight: 600,
                }}>
                  {page.type === 'cover' ? '封面' : page.type === 'ending' ? '尾页' : `${i + 1}`}
                </div>
                {/* 简易内容示意 */}
                <div style={{
                  padding: '6px',
                  fontSize: '6px',
                  lineHeight: '1.4',
                  color: style.color.colors.text,
                  overflow: 'hidden',
                }}>
                  {page.type === 'cover' && (
                    <div style={{ fontWeight: 700, fontSize: '8px', textAlign: 'center', marginTop: '10px' }}>
                      {page.elements[0]?.content.slice(0, 20)}
                    </div>
                  )}
                  {page.type === 'content' && page.elements.map((el, j) => (
                    <div key={j} style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginBottom: '1px',
                    }}>
                      {el.content.slice(0, 30)}
                    </div>
                  ))}
                  {page.type === 'ending' && (
                    <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '10px' }}>✨</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* 右侧：大图预览 */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '16px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}>
          {selectedPageHtml ? (
            <div style={{
              transform: `scale(${previewScale})`,
              transformOrigin: 'top center',
              flexShrink: 0,
            }}>
              <div
                dangerouslySetInnerHTML={{ __html: selectedPageHtml }}
                style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15)', borderRadius: '8px', overflow: 'hidden' }}
              />
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              color: '#999',
              fontSize: '14px',
              marginTop: '80px',
            }}>
              在左侧输入文章后，小红书图片组将显示在这里
            </div>
          )}
        </div>
      </div>

      {/* 底部导出栏 */}
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '12px 16px',
        background: '#fff',
        borderTop: '1px solid #e5e5e5',
        alignItems: 'center',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: '11px', color: '#999', marginRight: 'auto' }}>
          {comboName} · {ratio} · {config.width}×{config.height}
        </span>

        {exporting && (
          <div style={{
            fontSize: '12px',
            color: '#4F46E5',
            fontWeight: 600,
          }}>
            {Math.round(progress * 100)}%
          </div>
        )}

        <button
          onClick={handleDownloadSingle}
          disabled={pages.length === 0 || exporting}
          style={{
            padding: '8px 14px',
            fontSize: '12px',
            fontWeight: 600,
            background: pages.length === 0 ? '#eee' : '#f0f0f0',
            color: pages.length === 0 ? '#999' : '#333',
            border: '1px solid #ddd',
            borderRadius: '6px',
            cursor: pages.length === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          📥 下载当前页
        </button>

        <button
          onClick={handleExportZip}
          disabled={pages.length === 0 || exporting}
          style={{
            padding: '8px 14px',
            fontSize: '12px',
            fontWeight: 600,
            background: pages.length === 0 ? '#ccc' : '#4F46E5',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: pages.length === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          {exporting ? '⏳ 导出中...' : `📦 打包下载 ZIP (${pages.length}张)`}
        </button>
      </div>
    </div>
  )
}

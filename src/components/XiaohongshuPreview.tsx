// 小红书预览组件 — 缩略图网格 + 大图预览

import { useState, useMemo, useRef } from 'react'
import { splitToPagesV2, renderXhsPageV2, XHS_PRESETS, type XhsConfig, type PageTemplateType } from '../lib/render/xiaohongshu'
import { exportAllPagesAsZip, downloadSinglePage } from '../lib/export/image'
import type { StyleComboV2 } from '../lib/atoms'

const TEMPLATE_OPTIONS: { value: PageTemplateType; label: string }[] = [
  { value: 'standard',       label: '📄 标准' },
  { value: 'card-list',      label: '🃏 卡片列表' },
  { value: 'feature-grid',   label: '🔲 特性网格' },
  { value: 'workflow',       label: '🔢 流程步骤' },
  { value: 'text-highlight', label: '💬 文字高亮' },
]

interface XhsPreviewProps {
  markdown: string
  style: StyleComboV2
  comboName: string
}

type AspectRatio = '3:4' | '1:1' | '16:9'

export default function XiaohongshuPreview({ markdown, style, comboName }: XhsPreviewProps) {
  const [ratio, setRatio] = useState<AspectRatio>('3:4')
  const [selectedPage, setSelectedPage] = useState(0)
  const [exporting, setExporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [pageOrder, setPageOrder] = useState<number[]>([])
  const [templateOverrides, setTemplateOverrides] = useState<Record<number, PageTemplateType>>({})
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)
  const dragItemRef = useRef<number | null>(null)
  const dragOverRef = useRef<number | null>(null)

  const config: XhsConfig = XHS_PRESETS[ratio]

  const rawPages = useMemo(() => {
    if (!markdown.trim()) return []
    return splitToPagesV2(markdown, config, style)
  }, [markdown, config, style])

  // 页面排序 + 模板覆盖：当原始页面变化时重置
  useMemo(() => {
    setPageOrder(rawPages.map((_, i) => i))
    setTemplateOverrides({})
    setShowTemplatePicker(false)
  }, [rawPages.length])

  // 按用户排列顺序得到的页面
  const pages = useMemo(() => {
    if (pageOrder.length !== rawPages.length) return rawPages
    return pageOrder.map(i => rawPages[i]).filter(Boolean)
  }, [rawPages, pageOrder])

  // 应用模板覆盖
  const pagesWithOverrides = useMemo(() => {
    return pages.map((page, i) => {
      if (page.type !== 'content') return page
      const override = templateOverrides[i]
      if (!override) return page
      return { ...page, templateType: override }
    })
  }, [pages, templateOverrides])

  // 拖拽排序
  const handleDragStart = (idx: number) => { dragItemRef.current = idx }
  const handleDragEnter = (idx: number) => { dragOverRef.current = idx }
  const handleDragEnd = () => {
    if (dragItemRef.current === null || dragOverRef.current === null) return
    if (dragItemRef.current === dragOverRef.current) return
    const newOrder = [...pageOrder]
    const [removed] = newOrder.splice(dragItemRef.current, 1)
    newOrder.splice(dragOverRef.current, 0, removed)
    setPageOrder(newOrder)
    setSelectedPage(dragOverRef.current)
    dragItemRef.current = null
    dragOverRef.current = null
  }

  const selectedPageHtml = useMemo(() => {
    if (pagesWithOverrides.length === 0) return ''
    const page = pagesWithOverrides[Math.min(selectedPage, pagesWithOverrides.length - 1)]
    return renderXhsPageV2(page, style, config)
  }, [pagesWithOverrides, selectedPage, style, config])

  const handleExportZip = async () => {
    if (pagesWithOverrides.length === 0) return
    setExporting(true)
    setProgress(0)
    try {
      await exportAllPagesAsZip(pagesWithOverrides, style, config, (p) => setProgress(p))
    } catch (e) {
      console.error('导出失败:', e)
    } finally {
      setExporting(false)
    }
  }

  const handleDownloadSingle = async () => {
    if (pagesWithOverrides.length === 0) return
    const page = pagesWithOverrides[Math.min(selectedPage, pagesWithOverrides.length - 1)]
    setExporting(true)
    try {
      await downloadSinglePage(page, style, config)
    } catch (e) {
      console.error('下载失败:', e)
    } finally {
      setExporting(false)
    }
  }

  const activeColors = style.color.colors

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
            {pagesWithOverrides.length > 0 ? `${pagesWithOverrides.length} 张` : '暂无'}
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
          {pagesWithOverrides.length === 0 ? (
            <div style={{ fontSize: '11px', color: '#999', textAlign: 'center', padding: '20px 0' }}>
              输入文章后<br />自动分页
            </div>
          ) : (
            pagesWithOverrides.map((page, i) => (
              <div
                key={`page-${i}`}
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragEnter={() => handleDragEnter(i)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => setSelectedPage(i)}
                style={{
                  width: `${thumbW}px`,
                  height: `${thumbH}px`,
                  background: activeColors.pageBg,
                  border: `2px solid ${selectedPage === i ? '#4F46E5' : '#ddd'}`,
                  borderRadius: '4px',
                  cursor: 'grab',
                  position: 'relative',
                  overflow: 'hidden',
                  flexShrink: 0,
                  transition: 'transform 0.15s',
                }}
              >
                {/* 页码标签 */}
                <div style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '4px',
                  fontSize: '10px',
                  color: activeColors.textMuted,
                  fontWeight: 600,
                }}>
                  {page.type === 'cover' ? '封面' : page.type === 'ending' ? '尾页' : `${i + 1}`}
                </div>
                {/* 简易内容示意 */}
                <div style={{
                  padding: '6px',
                  fontSize: '6px',
                  lineHeight: '1.4',
                  color: activeColors.text,
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
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          {selectedPageHtml ? (
            <>
              {/* 模板切换工具栏（仅 content 页显示） */}
              {(() => {
                const curPage = pagesWithOverrides[Math.min(selectedPage, pagesWithOverrides.length - 1)]
                if (!curPage || curPage.type !== 'content') return null
                const curTemplate = curPage.templateType ?? 'standard'
                const curLabel = TEMPLATE_OPTIONS.find(o => o.value === curTemplate)?.label ?? '模板'
                const hasOverride = templateOverrides[selectedPage] !== undefined
                return (
                  <div style={{ position: 'relative', marginBottom: '8px', alignSelf: 'flex-end' }}>
                    <button
                      onClick={() => setShowTemplatePicker(p => !p)}
                      style={{
                        padding: '5px 12px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: hasOverride ? '#4F46E5' : '#666',
                        background: hasOverride ? '#EEF0FF' : '#f0f0f0',
                        border: `1px solid ${hasOverride ? '#4F46E5' : '#ddd'}`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      🔄 {curLabel}
                      {hasOverride && <span style={{ fontSize: '9px', color: '#4F46E5' }}>已覆盖</span>}
                    </button>
                    {showTemplatePicker && (
                      <div style={{
                        position: 'absolute',
                        right: 0,
                        top: '100%',
                        marginTop: '4px',
                        background: '#fff',
                        border: '1px solid #e5e5e5',
                        borderRadius: '8px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                        zIndex: 100,
                        minWidth: '160px',
                        overflow: 'hidden',
                      }}>
                        {TEMPLATE_OPTIONS.map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => {
                              setTemplateOverrides(prev => ({ ...prev, [selectedPage]: opt.value }))
                              setShowTemplatePicker(false)
                            }}
                            style={{
                              display: 'block',
                              width: '100%',
                              textAlign: 'left',
                              padding: '8px 14px',
                              fontSize: '12px',
                              fontWeight: opt.value === curTemplate ? 700 : 400,
                              color: opt.value === curTemplate ? '#4F46E5' : '#333',
                              background: opt.value === curTemplate ? '#EEF0FF' : 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            {opt.label}
                          </button>
                        ))}
                        {hasOverride && (
                          <>
                            <div style={{ height: '1px', background: '#e5e5e5', margin: '2px 0' }} />
                            <button
                              onClick={() => {
                                setTemplateOverrides(prev => {
                                  const next = { ...prev }
                                  delete next[selectedPage]
                                  return next
                                })
                                setShowTemplatePicker(false)
                              }}
                              style={{
                                display: 'block',
                                width: '100%',
                                textAlign: 'left',
                                padding: '8px 14px',
                                fontSize: '11px',
                                color: '#999',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              ↩ 恢复自动模板
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )
              })()}

              <div
                onClick={() => setShowTemplatePicker(false)}
                style={{
                  width: `${Math.round(config.width * previewScale)}px`,
                  height: `${Math.round(config.height * previewScale)}px`,
                  position: 'relative',
                  flexShrink: 0,
                  overflow: 'hidden',
                }}
              >
                <div style={{
                  width: `${config.width}px`,
                  height: `${config.height}px`,
                  transform: `scale(${previewScale})`,
                  transformOrigin: 'top left',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}>
                  <div
                    dangerouslySetInnerHTML={{ __html: selectedPageHtml }}
                    style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15)', borderRadius: '8px', overflow: 'hidden' }}
                  />
                </div>
              </div>
            </>
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
          disabled={pagesWithOverrides.length === 0 || exporting}
          style={{
            padding: '8px 14px',
            fontSize: '12px',
            fontWeight: 600,
            background: pagesWithOverrides.length === 0 ? '#eee' : '#f0f0f0',
            color: pagesWithOverrides.length === 0 ? '#999' : '#333',
            border: '1px solid #ddd',
            borderRadius: '6px',
            cursor: pagesWithOverrides.length === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          📥 下载当前页
        </button>

        <button
          onClick={handleExportZip}
          disabled={pagesWithOverrides.length === 0 || exporting}
          style={{
            padding: '8px 14px',
            fontSize: '12px',
            fontWeight: 600,
            background: pagesWithOverrides.length === 0 ? '#ccc' : '#4F46E5',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: pagesWithOverrides.length === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          {exporting ? '⏳ 导出中...' : `📦 打包下载 ZIP (${pagesWithOverrides.length}张)`}
        </button>
      </div>
    </div>
  )
}

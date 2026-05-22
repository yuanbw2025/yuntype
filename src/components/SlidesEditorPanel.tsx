// 幻灯片可视化编辑器 — 拖拽移动 / 缩放 / 文字编辑 / AI生成 / 导出PPTX

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import {
  type Slide, type SlidesDeck, type SlideLayout, type SlideElement, type ElementRole,
  SLIDE_THEMES, SLIDES_PRESETS,
  createDefaultDeck, createEmptySlide, makeId,
  generateSlidesDeck, exportToPptx,
  getElementColor,
} from '../lib/ai/slides-gen'
import { loadChatConfig, saveChatConfig, chatProviderPresets, type AIClientConfig } from '../lib/ai/client'
import { APIConfigForm } from './APIConfigForm'

// ═══════════════════════════════════════
//  상수 & 타입
// ═══════════════════════════════════════

const HANDLE_DIRS = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'] as const
type HandleDir = typeof HANDLE_DIRS[number]

type DragState =
  | { type: 'none' }
  | { type: 'move'; elId: string; startMX: number; startMY: number; startX: number; startY: number; cW: number; cH: number }
  | { type: 'resize'; elId: string; dir: HandleDir; startMX: number; startMY: number; startX: number; startY: number; startW: number; startH: number; cW: number; cH: number }

// ═══════════════════════════════════════
//  缩略图
// ═══════════════════════════════════════

function SlideThumbnail({ slide, deck, index, selected, onClick, onDelete }: {
  slide: Slide; deck: SlidesDeck; index: number
  selected: boolean; onClick: () => void; onDelete: () => void
}) {
  return (
    <div onClick={onClick} style={{
      position: 'relative', cursor: 'pointer', borderRadius: 5, flexShrink: 0,
      border: selected ? '2px solid #7c3aed' : '2px solid #2a2a2a',
    }}>
      <div style={{ fontSize: 9, color: '#666', padding: '2px 5px', background: '#111' }}>{index + 1}</div>
      <div style={{ width: 160, height: 90, background: deck.theme.bg, position: 'relative', overflow: 'hidden' }}>
        {slide.elements.map(el => (
          <div key={el.id} style={{
            position: 'absolute',
            left: `${el.x}%`, top: `${el.y}%`,
            width: `${el.w}%`, height: `${el.h}%`,
            fontSize: `${el.style.fontSize * 0.9}px`,
            fontWeight: el.style.fontWeight,
            fontStyle: el.style.fontStyle,
            color: getElementColor(el.role, deck.theme, el.style.colorOverride),
            textAlign: el.style.textAlign,
            lineHeight: el.style.lineHeight,
            overflow: 'hidden', pointerEvents: 'none', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          }}>{el.text}</div>
        ))}
      </div>
      {selected && (
        <button onClick={e => { e.stopPropagation(); onDelete() }} style={{
          position: 'absolute', top: 2, right: 2, width: 16, height: 16,
          borderRadius: '50%', background: '#ef4444', border: 'none',
          color: '#fff', fontSize: 10, cursor: 'pointer', lineHeight: 1,
        }}>×</button>
      )}
    </div>
  )
}

// ═══════════════════════════════════════
//  Resize Handle
// ═══════════════════════════════════════

const HANDLE_CURSORS: Record<HandleDir, string> = {
  nw: 'nw-resize', n: 'n-resize', ne: 'ne-resize', e: 'e-resize',
  se: 'se-resize', s: 's-resize', sw: 'sw-resize', w: 'w-resize',
}
const HANDLE_POS: Record<HandleDir, { left?: string; right?: string; top?: string; bottom?: string; transform: string }> = {
  nw: { left: '-4px', top: '-4px', transform: '' },
  n:  { left: '50%',  top: '-4px', transform: 'translateX(-50%)' },
  ne: { right: '-4px', top: '-4px', transform: '' },
  e:  { right: '-4px', top: '50%', transform: 'translateY(-50%)' },
  se: { right: '-4px', bottom: '-4px', transform: '' },
  s:  { left: '50%', bottom: '-4px', transform: 'translateX(-50%)' },
  sw: { left: '-4px', bottom: '-4px', transform: '' },
  w:  { left: '-4px', top: '50%', transform: 'translateY(-50%)' },
}

// ═══════════════════════════════════════
//  幻灯片画布（可拖拽编辑）
// ═══════════════════════════════════════

interface SlideCanvasProps {
  slide: Slide
  deck: SlidesDeck
  selectedId: string | null
  editingId: string | null
  onSelect: (id: string | null) => void
  onUpdateElement: (id: string, patch: Partial<SlideElement>) => void
  onStartEdit: (id: string) => void
  onEndEdit: (id: string, text: string) => void
}

function SlideCanvas({ slide, deck, selectedId, editingId, onSelect, onUpdateElement, onStartEdit, onEndEdit }: SlideCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<DragState>({ type: 'none' })
  const editRef = useRef<HTMLDivElement | null>(null)
  const t = deck.theme

  // ── 拖拽移动 ──
  const handleElementMouseDown = useCallback((e: React.MouseEvent, elId: string) => {
    if (editingId === elId) return
    e.preventDefault()
    e.stopPropagation()
    onSelect(elId)
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const el = slide.elements.find(el => el.id === elId)!
    dragRef.current = {
      type: 'move', elId,
      startMX: e.clientX, startMY: e.clientY,
      startX: el.x, startY: el.y,
      cW: rect.width, cH: rect.height,
    }
    const onMove = (ev: MouseEvent) => {
      const d = dragRef.current
      if (d.type !== 'move') return
      const dx = (ev.clientX - d.startMX) / d.cW * 100
      const dy = (ev.clientY - d.startMY) / d.cH * 100
      onUpdateElement(d.elId, {
        x: Math.max(0, Math.min(95, d.startX + dx)),
        y: Math.max(0, Math.min(95, d.startY + dy)),
      })
    }
    const onUp = () => {
      dragRef.current = { type: 'none' }
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [slide.elements, editingId, onSelect, onUpdateElement])

  // ── 缩放 ──
  const handleResizeMouseDown = useCallback((e: React.MouseEvent, elId: string, dir: HandleDir) => {
    e.preventDefault()
    e.stopPropagation()
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const el = slide.elements.find(el => el.id === elId)!
    dragRef.current = {
      type: 'resize', elId, dir,
      startMX: e.clientX, startMY: e.clientY,
      startX: el.x, startY: el.y, startW: el.w, startH: el.h,
      cW: rect.width, cH: rect.height,
    }
    const onMove = (ev: MouseEvent) => {
      const d = dragRef.current
      if (d.type !== 'resize') return
      const dx = (ev.clientX - d.startMX) / d.cW * 100
      const dy = (ev.clientY - d.startMY) / d.cH * 100
      let { startX: x, startY: y, startW: w, startH: h } = d
      if (d.dir.includes('e')) { w = Math.max(5, w + dx) }
      if (d.dir.includes('s')) { h = Math.max(3, h + dy) }
      if (d.dir.includes('w')) { x = x + dx; w = Math.max(5, w - dx) }
      if (d.dir.includes('n')) { y = y + dy; h = Math.max(3, h - dy) }
      onUpdateElement(d.elId, { x, y, w, h })
    }
    const onUp = () => {
      dragRef.current = { type: 'none' }
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [slide.elements, onUpdateElement])

  // ── 双击进入文字编辑 ──
  const handleDoubleClick = useCallback((e: React.MouseEvent, elId: string) => {
    e.stopPropagation()
    onStartEdit(elId)
    setTimeout(() => editRef.current?.focus(), 50)
  }, [onStartEdit])

  const handleEditBlur = useCallback((elId: string) => {
    const text = editRef.current?.innerText ?? ''
    onEndEdit(elId, text)
  }, [onEndEdit])

  // ── 删除键 ──
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!selectedId || editingId) return
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // 通知父组件删除，通过update传null标记
        onUpdateElement(selectedId, { id: '__delete__' })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedId, editingId, onUpdateElement])

  // ── 装饰条（不可拖拽，纯视觉） ──
  const decoration = useMemo(() => {
    const s = slide.layout
    const acc = t.accent
    if (s === 'title') return <div style={{ position: 'absolute', left: 0, top: '72%', width: '100%', height: '0.8%', background: acc }} />
    if (s === 'closing') return <>
      <div style={{ position: 'absolute', left: '35%', top: '22%', width: '30%', height: '0.7%', background: acc }} />
      <div style={{ position: 'absolute', left: '35%', top: '88%', width: '30%', height: '0.7%', background: acc }} />
    </>
    if (s === 'quote') return <div style={{ position: 'absolute', left: '5%', top: 0, width: '1.2%', height: '100%', background: acc }} />
    if (s === 'two-column') return <>
      <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '18%', background: acc }} />
      <div style={{ position: 'absolute', left: '50%', top: '20%', width: '0.3%', height: '77%', background: acc + '55' }} />
    </>
    return <div style={{ position: 'absolute', left: '3.5%', top: '5%', width: '0.6%', height: '88%', background: acc, borderRadius: '3px' }} />
  }, [slide.layout, t.accent])

  return (
    <div
      ref={canvasRef}
      onClick={() => onSelect(null)}
      style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: t.bg, overflow: 'hidden', userSelect: 'none' }}
    >
      {/* 装饰 */}
      {decoration}

      {/* 元素 */}
      {slide.elements.map(el => {
        const isSelected = selectedId === el.id
        const isEditing = editingId === el.id
        const color = getElementColor(el.role, t, el.style.colorOverride)

        return (
          <div
            key={el.id}
            onMouseDown={e => handleElementMouseDown(e, el.id)}
            onDoubleClick={e => handleDoubleClick(e, el.id)}
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute',
              left: `${el.x}%`, top: `${el.y}%`,
              width: `${el.w}%`, height: `${el.h}%`,
              cursor: isEditing ? 'text' : 'move',
              outline: isSelected ? '1.5px solid #7c3aed' : 'none',
              boxSizing: 'border-box',
            }}
          >
            {/* 文字内容 */}
            <div
              ref={isEditing ? editRef : undefined}
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={() => isEditing && handleEditBlur(el.id)}
              style={{
                width: '100%', height: '100%',
                fontSize: `${el.style.fontSize}cqh`,
                fontWeight: el.style.fontWeight,
                fontStyle: el.style.fontStyle,
                color,
                textAlign: el.style.textAlign,
                lineHeight: el.style.lineHeight,
                letterSpacing: `${el.style.letterSpacing}em`,
                whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                overflow: 'hidden',
                outline: 'none',
                cursor: isEditing ? 'text' : 'inherit',
                pointerEvents: isEditing ? 'auto' : 'none',
              }}
            >{el.text}</div>

            {/* Resize handles */}
            {isSelected && !isEditing && HANDLE_DIRS.map(dir => (
              <div
                key={dir}
                onMouseDown={e => handleResizeMouseDown(e, el.id, dir)}
                style={{
                  position: 'absolute',
                  width: 8, height: 8,
                  background: '#7c3aed',
                  border: '1.5px solid #fff',
                  borderRadius: 2,
                  cursor: HANDLE_CURSORS[dir],
                  ...HANDLE_POS[dir],
                  zIndex: 10,
                }}
              />
            ))}
          </div>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════
//  主面板
// ═══════════════════════════════════════

export default function SlidesEditorPanel() {
  const [deck, setDeck] = useState<SlidesDeck>(createDefaultDeck)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [config, setConfig] = useState<AIClientConfig | null>(null)
  const [showConfig, setShowConfig] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [themeIdx, setThemeIdx] = useState(0)

  useEffect(() => {
    const saved = loadChatConfig()
    setConfig(saved)
    if (!saved) setShowConfig(true)
  }, [])

  const currentSlide = deck.slides[Math.min(currentIdx, deck.slides.length - 1)]

  // ── 更新单个元素 ──
  const handleUpdateElement = useCallback((id: string, patch: Partial<SlideElement>) => {
    // __delete__ 信号
    if (patch.id === '__delete__') {
      setDeck(prev => {
        const slides = [...prev.slides]
        const si = Math.min(currentIdx, slides.length - 1)
        slides[si] = { ...slides[si], elements: slides[si].elements.filter(e => e.id !== id) }
        return { ...prev, slides }
      })
      setSelectedId(null)
      return
    }
    setDeck(prev => {
      const slides = [...prev.slides]
      const si = Math.min(currentIdx, slides.length - 1)
      slides[si] = {
        ...slides[si],
        elements: slides[si].elements.map(el => el.id === id ? { ...el, ...patch } : el),
      }
      return { ...prev, slides }
    })
  }, [currentIdx])

  // ── 文字编辑结束 ──
  const handleEndEdit = useCallback((id: string, text: string) => {
    setEditingId(null)
    handleUpdateElement(id, { text })
  }, [handleUpdateElement])

  // ── 切换幻灯片 ──
  const switchSlide = useCallback((idx: number) => {
    setSelectedId(null)
    setEditingId(null)
    setCurrentIdx(idx)
  }, [])

  // ── 工具栏：更新选中元素样式 ──
  const updateStyle = useCallback((patch: Partial<SlideElement['style']>) => {
    if (!selectedId) return
    const el = currentSlide?.elements.find(e => e.id === selectedId)
    if (!el) return
    handleUpdateElement(selectedId, { style: { ...el.style, ...patch } })
  }, [selectedId, currentSlide, handleUpdateElement])

  const selectedEl = currentSlide?.elements.find(e => e.id === selectedId) ?? null

  // ── 添加元素 ──
  const addElement = (role: ElementRole) => {
    const el: SlideElement = {
      id: makeId(), role,
      text: role === 'title' ? '标题文字' : role === 'label' ? '标签' : '正文内容',
      x: 10, y: 10, w: 60, h: role === 'label' ? 8 : role === 'title' ? 18 : 40,
      style: {
        fontSize: role === 'title' ? 6 : role === 'label' ? 2.2 : 3,
        fontWeight: role === 'title' ? 'bold' : 'normal',
        fontStyle: 'normal', textAlign: 'left', lineHeight: 1.5, letterSpacing: 0,
      },
    }
    setDeck(prev => {
      const slides = [...prev.slides]
      const si = Math.min(currentIdx, slides.length - 1)
      slides[si] = { ...slides[si], elements: [...slides[si].elements, el] }
      return { ...prev, slides }
    })
    setSelectedId(el.id)
  }

  // ── 添加幻灯片 ──
  const addSlide = (layout: SlideLayout) => {
    const newSlide = createEmptySlide(layout)
    setDeck(prev => {
      const slides = [...prev.slides]
      slides.splice(currentIdx + 1, 0, newSlide)
      return { ...prev, slides }
    })
    setCurrentIdx(currentIdx + 1)
    setSelectedId(null)
  }

  // ── 删除幻灯片 ──
  const deleteSlide = (idx: number) => {
    if (deck.slides.length <= 1) return
    setDeck(prev => ({ ...prev, slides: prev.slides.filter((_, i) => i !== idx) }))
    setCurrentIdx(Math.max(0, idx - 1))
    setSelectedId(null)
  }

  // ── AI 生成 ──
  const handleGenerate = useCallback(async () => {
    if (!config || !prompt.trim()) return
    setGenerating(true)
    const res = await generateSlidesDeck(config, prompt.trim(), themeIdx)
    if (res.success && res.deck) {
      setDeck({ ...res.deck, theme: SLIDE_THEMES[themeIdx] })
      setCurrentIdx(0); setSelectedId(null)
    } else {
      alert(res.error || '生成失败，请重试')
    }
    setGenerating(false)
  }, [config, prompt, themeIdx])

  // ── 切换主题 ──
  const applyTheme = (idx: number) => {
    setThemeIdx(idx)
    setDeck(prev => ({ ...prev, theme: SLIDE_THEMES[idx] }))
  }

  // ── 导出 ──
  const handleExport = useCallback(async () => {
    setExporting(true)
    try { await exportToPptx(deck) } catch (e) { alert('导出失败：' + String(e)) }
    setExporting(false)
  }, [deck])

  // ── CSS vars ──
  const bg0 = '#0d0d0d', bg1 = '#111', bg2 = '#1a1a1a', bd = '#252525'
  const accent = '#7c3aed', mu = '#666'

  return (
    <div style={{ display: 'flex', height: '100%', background: bg0, color: '#e5e5e5', fontFamily: 'system-ui,sans-serif', overflow: 'hidden' }}>

      {/* ══ 左栏：幻灯片列表 ══ */}
      <div style={{ width: 186, background: bg1, borderRight: `1px solid ${bd}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '8px 10px 6px', fontSize: 10, color: mu, fontWeight: 700, letterSpacing: 1, borderBottom: `1px solid ${bd}` }}>
          幻灯片 · {deck.slides.length}页
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {deck.slides.map((slide, i) => (
            <SlideThumbnail key={slide.id} slide={slide} deck={deck} index={i}
              selected={i === currentIdx} onClick={() => switchSlide(i)} onDelete={() => deleteSlide(i)} />
          ))}
        </div>
        <div style={{ padding: '8px 10px', borderTop: `1px solid ${bd}` }}>
          <div style={{ fontSize: 9, color: mu, marginBottom: 5 }}>+ 新建幻灯片</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {([
              ['content', '正文'], ['bullets', '要点'], ['two-column', '双栏'],
              ['quote', '引言'], ['title', '封面'], ['closing', '结尾'],
            ] as [SlideLayout, string][]).map(([layout, label]) => (
              <button key={layout} onClick={() => addSlide(layout)} style={{
                padding: '3px 6px', fontSize: 9, cursor: 'pointer',
                background: '#222', border: `1px solid ${bd}`, borderRadius: 3, color: '#aaa',
              }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ══ 中间：画布 + 工具栏 ══ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* 顶部工具栏 */}
        <div style={{ height: 42, background: bg2, borderBottom: `1px solid ${bd}`, display: 'flex', alignItems: 'center', padding: '0 12px', gap: 6, flexShrink: 0 }}>
          {/* 文字格式（选中时显示） */}
          {selectedEl ? (<>
            <span style={{ fontSize: 10, color: mu, marginRight: 4 }}>选中元素：</span>

            {/* 字号 */}
            <select value={selectedEl.style.fontSize} onChange={e => updateStyle({ fontSize: parseFloat(e.target.value) })}
              style={{ fontSize: 10, background: '#222', border: `1px solid ${bd}`, color: '#ddd', borderRadius: 3, padding: '1px 4px' }}>
              {[1.5, 2, 2.2, 2.8, 3, 3.5, 4, 4.5, 5, 5.5, 6, 7, 8, 10].map(v => <option key={v} value={v}>{v}%</option>)}
            </select>

            {/* 粗体 */}
            <button onClick={() => updateStyle({ fontWeight: selectedEl.style.fontWeight === 'bold' ? 'normal' : 'bold' })}
              style={{ padding: '2px 7px', fontSize: 11, fontWeight: 700, background: selectedEl.style.fontWeight === 'bold' ? accent : '#222', border: `1px solid ${bd}`, borderRadius: 3, color: selectedEl.style.fontWeight === 'bold' ? '#fff' : '#aaa', cursor: 'pointer' }}>B</button>

            {/* 斜体 */}
            <button onClick={() => updateStyle({ fontStyle: selectedEl.style.fontStyle === 'italic' ? 'normal' : 'italic' })}
              style={{ padding: '2px 7px', fontSize: 11, fontStyle: 'italic', background: selectedEl.style.fontStyle === 'italic' ? accent : '#222', border: `1px solid ${bd}`, borderRadius: 3, color: selectedEl.style.fontStyle === 'italic' ? '#fff' : '#aaa', cursor: 'pointer' }}>I</button>

            {/* 对齐 */}
            {(['left', 'center', 'right'] as const).map(align => (
              <button key={align} onClick={() => updateStyle({ textAlign: align })}
                style={{ padding: '2px 6px', fontSize: 10, background: selectedEl.style.textAlign === align ? accent : '#222', border: `1px solid ${bd}`, borderRadius: 3, color: selectedEl.style.textAlign === align ? '#fff' : '#aaa', cursor: 'pointer' }}>
                {align === 'left' ? '≡' : align === 'center' ? '☰' : '≡'}
              </button>
            ))}

            {/* 颜色 */}
            <input type="color" value={selectedEl.style.colorOverride || '#ffffff'}
              onChange={e => updateStyle({ colorOverride: e.target.value })}
              style={{ width: 22, height: 22, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }} title="文字颜色" />

            {/* 双击提示 */}
            <span style={{ fontSize: 9, color: mu, marginLeft: 6 }}>双击编辑文字</span>

            {/* 添加文字元素 */}
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 9, color: mu }}>添加：</span>
            {(['title', 'body', 'label'] as ElementRole[]).map(role => (
              <button key={role} onClick={() => addElement(role)} style={{
                padding: '2px 7px', fontSize: 9, background: '#222', border: `1px solid ${bd}`, borderRadius: 3, color: '#aaa', cursor: 'pointer',
              }}>{role === 'title' ? '标题' : role === 'body' ? '正文' : '标签'}</button>
            ))}
          </>) : (<>
            <span style={{ fontSize: 11, color: '#999' }}>🎞 幻灯片编辑器 · 点击元素选中，拖拽移动，拖拽角点缩放，双击编辑文字</span>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 9, color: mu }}>添加元素：</span>
            {(['title', 'body', 'label'] as ElementRole[]).map(role => (
              <button key={role} onClick={() => addElement(role)} style={{
                padding: '2px 7px', fontSize: 9, background: '#222', border: `1px solid ${bd}`, borderRadius: 3, color: '#aaa', cursor: 'pointer',
              }}>{role === 'title' ? '标题' : role === 'body' ? '正文' : '标签'}</button>
            ))}
          </>)}
        </div>

        {/* 画布区域 */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#161616', padding: 24, overflow: 'auto', containerType: 'size' }}>
          {currentSlide ? (
            <div style={{
              width: 'min(100%, calc(100cqh * 16/9))',
              boxShadow: '0 8px 48px rgba(0,0,0,0.7)',
              borderRadius: 3, overflow: 'visible',
              containerType: 'size',
            }}>
              <SlideCanvas
                slide={currentSlide} deck={deck}
                selectedId={selectedId} editingId={editingId}
                onSelect={setSelectedId}
                onUpdateElement={handleUpdateElement}
                onStartEdit={setEditingId}
                onEndEdit={handleEndEdit}
              />
            </div>
          ) : <div style={{ color: mu }}>没有幻灯片</div>}
        </div>

        {/* 底部翻页 */}
        <div style={{ height: 34, background: bg2, borderTop: `1px solid ${bd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexShrink: 0 }}>
          <button onClick={() => switchSlide(Math.max(0, currentIdx - 1))} disabled={currentIdx === 0}
            style={{ background: 'none', border: 'none', color: currentIdx === 0 ? '#333' : '#888', fontSize: 18, cursor: currentIdx === 0 ? 'default' : 'pointer' }}>‹</button>
          <span style={{ fontSize: 11, color: mu }}>{currentIdx + 1} / {deck.slides.length}</span>
          <button onClick={() => switchSlide(Math.min(deck.slides.length - 1, currentIdx + 1))} disabled={currentIdx === deck.slides.length - 1}
            style={{ background: 'none', border: 'none', color: currentIdx === deck.slides.length - 1 ? '#333' : '#888', fontSize: 18, cursor: currentIdx === deck.slides.length - 1 ? 'default' : 'pointer' }}>›</button>
        </div>
      </div>

      {/* ══ 右栏：AI 生成 + 主题 ══ */}
      <div style={{ width: 250, background: bg2, borderLeft: `1px solid ${bd}`, display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>

        {/* AI 生成 */}
        <div style={{ padding: '10px 12px', borderBottom: `1px solid ${bd}` }}>
          <div style={{ fontSize: 10, color: mu, fontWeight: 700, letterSpacing: 1, marginBottom: 7 }}>AI 生成</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginBottom: 7 }}>
            {SLIDES_PRESETS.map(p => (
              <button key={p.id} onClick={() => { setSelectedPreset(p.id); setPrompt(p.examplePrompt) }}
                style={{ padding: '2px 7px', fontSize: 9, cursor: 'pointer',
                  background: selectedPreset === p.id ? accent : '#1a1a1a', border: `1px solid ${selectedPreset === p.id ? accent : bd}`,
                  borderRadius: 3, color: selectedPreset === p.id ? '#fff' : '#999' }}>
                {p.icon} {p.name}
              </button>
            ))}
          </div>
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
            placeholder="描述你的演示主题，AI 自动生成完整幻灯片…"
            rows={4} style={{ width: '100%', boxSizing: 'border-box', resize: 'none',
              background: '#111', border: `1px solid ${bd}`, borderRadius: 4,
              color: '#ddd', fontSize: 11, padding: '6px 8px', fontFamily: 'inherit', outline: 'none' }} />
          <button onClick={handleGenerate} disabled={generating || !config || !prompt.trim()}
            style={{ marginTop: 6, width: '100%', padding: '6px 0', fontSize: 12, fontWeight: 600,
              background: generating || !config || !prompt.trim() ? '#2a2a2a' : accent,
              border: 'none', borderRadius: 4,
              color: generating || !config || !prompt.trim() ? '#555' : '#fff',
              cursor: generating || !config || !prompt.trim() ? 'default' : 'pointer' }}>
            {generating ? '生成中…' : '✨ AI 生成'}
          </button>
          {!config && <div style={{ fontSize: 9, color: '#f59e0b', marginTop: 4 }}>⚠ 请先配置 API Key</div>}
        </div>

        {/* 主题 */}
        <div style={{ padding: '10px 12px', borderBottom: `1px solid ${bd}` }}>
          <div style={{ fontSize: 10, color: mu, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>配色主题</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {SLIDE_THEMES.map((theme, i) => (
              <button key={i} onClick={() => applyTheme(i)} style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '5px 8px', borderRadius: 4, cursor: 'pointer',
                background: themeIdx === i ? '#1e1630' : '#161616', border: `1px solid ${themeIdx === i ? accent : bd}`, textAlign: 'left',
              }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[theme.bg, theme.accent, theme.titleColor].map((c, ci) => (
                    <div key={ci} style={{ width: 10, height: 10, borderRadius: 2, background: c, border: '1px solid #333' }} />
                  ))}
                </div>
                <span style={{ fontSize: 11, color: themeIdx === i ? '#ddd' : '#888' }}>{theme.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 导出 & API */}
        <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button onClick={handleExport} disabled={exporting} style={{
            padding: '7px 0', fontSize: 12, fontWeight: 600,
            background: exporting ? '#222' : '#059669', border: 'none', borderRadius: 4,
            color: exporting ? '#555' : '#fff', cursor: exporting ? 'default' : 'pointer',
          }}>{exporting ? '导出中…' : '⬇ 导出 PPTX'}</button>
          <button onClick={() => setShowConfig(true)} style={{
            padding: '5px 0', fontSize: 10, background: '#1a1a1a', border: `1px solid ${bd}`, borderRadius: 4, color: '#888', cursor: 'pointer',
          }}>⚙️ 配置 API Key</button>
        </div>

        {/* 说明 */}
        <div style={{ padding: '0 12px 10px', flex: 1 }}>
          <div style={{ fontSize: 10, color: '#444', lineHeight: 1.9 }}>
            • 点击元素 → 选中<br />
            • 拖拽元素 → 移动位置<br />
            • 拖拽角点/边点 → 缩放<br />
            • 双击元素 → 编辑文字<br />
            • Delete 键 → 删除元素<br />
            • 顶栏工具 → 调整样式
          </div>
        </div>
      </div>

      {/* API 配置弹窗 */}
      {showConfig && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#1e1e1e', borderRadius: 10, padding: 22, width: 420, border: `1px solid ${bd}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>API 配置</span>
              <button onClick={() => setShowConfig(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
            <APIConfigForm
              title="配置 AI 服务"
              description="幻灯片生成需要 AI 大模型，推荐通义千问或 DeepSeek。"
              config={config}
              providers={chatProviderPresets.filter(p => p.id !== 'custom').slice(0, 8)}
              onSave={cfg => { setConfig(cfg as AIClientConfig); saveChatConfig(cfg as AIClientConfig); setShowConfig(false) }}
              onCancel={() => setShowConfig(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// 幻灯片可视化编辑器
// 功能：拖拽/缩放/文字编辑/图片插入/撤销重做/对齐辅助线/动画/全屏演示/PNG+PDF+PPTX导出/AI微调单页

import { useState, useCallback, useRef, useEffect, useMemo, useReducer } from 'react'
import {
  type Slide, type SlidesDeck, type SlideLayout, type SlideElement,
  type ElementRole, type AnimationType, type StyleAnalysis,
  SLIDE_THEMES, SLIDES_PRESETS,
  createDefaultDeck, createEmptySlide, makeId,
  generateSlidesDeck, exportToPptx, refineSlide,
  getElementColor, renderSlideHtml,
  analyzeStyleWithAI, generateSlidesWithStyle, polishDeckWithStyle,
} from '../lib/ai/slides-gen'
import { parsePptx, summarizeParsedPptx } from '../lib/ai/pptx-import'
import { loadChatConfig, saveChatConfig, chatProviderPresets, type AIClientConfig } from '../lib/ai/client'
import { APIConfigForm } from './APIConfigForm'

// ═══════════════════════════════════════
//  撤销/重做
// ═══════════════════════════════════════

type HistoryAction =
  | { type: 'SET'; deck: SlidesDeck }
  | { type: 'UNDO' }
  | { type: 'REDO' }

interface HistoryState { past: SlidesDeck[]; present: SlidesDeck; future: SlidesDeck[] }

function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
  switch (action.type) {
    case 'SET': {
      if (JSON.stringify(state.present) === JSON.stringify(action.deck)) return state
      return { past: [...state.past.slice(-49), state.present], present: action.deck, future: [] }
    }
    case 'UNDO': {
      if (!state.past.length) return state
      return { past: state.past.slice(0, -1), present: state.past[state.past.length - 1], future: [state.present, ...state.future] }
    }
    case 'REDO': {
      if (!state.future.length) return state
      return { past: [...state.past, state.present], present: state.future[0], future: state.future.slice(1) }
    }
  }
}

// ═══════════════════════════════════════
//  拖拽类型
// ═══════════════════════════════════════

const HANDLE_DIRS = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'] as const
type HandleDir = typeof HANDLE_DIRS[number]
type DragState =
  | { type: 'none' }
  | { type: 'move'; elId: string; startMX: number; startMY: number; startX: number; startY: number; cW: number; cH: number }
  | { type: 'resize'; elId: string; dir: HandleDir; startMX: number; startMY: number; startX: number; startY: number; startW: number; startH: number; cW: number; cH: number }

const HANDLE_CURSORS: Record<HandleDir, string> = { nw: 'nw-resize', n: 'n-resize', ne: 'ne-resize', e: 'e-resize', se: 'se-resize', s: 's-resize', sw: 'sw-resize', w: 'w-resize' }
const HANDLE_POS: Record<HandleDir, React.CSSProperties> = {
  nw: { left: -4, top: -4 }, n: { left: '50%', top: -4, transform: 'translateX(-50%)' },
  ne: { right: -4, top: -4 }, e: { right: -4, top: '50%', transform: 'translateY(-50%)' },
  se: { right: -4, bottom: -4 }, s: { left: '50%', bottom: -4, transform: 'translateX(-50%)' },
  sw: { left: -4, bottom: -4 }, w: { left: -4, top: '50%', transform: 'translateY(-50%)' },
}

// ═══════════════════════════════════════
//  动画 CSS
// ═══════════════════════════════════════

const ANIM_STYLE = `
@keyframes sl-fade   { from { opacity:0 } to { opacity:1 } }
@keyframes sl-up     { from { opacity:0; transform:translateY(30px) } to { opacity:1; transform:translateY(0) } }
@keyframes sl-left   { from { opacity:0; transform:translateX(-30px) } to { opacity:1; transform:translateX(0) } }
@keyframes sl-zoom   { from { opacity:0; transform:scale(0.8) } to { opacity:1; transform:scale(1) } }
@keyframes sl-appear { 0% { opacity:0 } 1% { opacity:1 } 100% { opacity:1 } }
@keyframes sl-bounce {
  0%   { opacity:0; transform:translateY(-40px) }
  60%  { opacity:1; transform:translateY(8px) }
  80%  { transform:translateY(-4px) }
  100% { opacity:1; transform:translateY(0) }
}
`
function animCss(anim: AnimationType, idx: number, orderDelay = 0): React.CSSProperties {
  if (anim === 'none') return {}
  const name =
    anim === 'fade'       ? 'sl-fade'   :
    anim === 'slide-up'   ? 'sl-up'     :
    anim === 'slide-left' ? 'sl-left'   :
    anim === 'zoom'       ? 'sl-zoom'   :
    anim === 'appear'     ? 'sl-appear' :
    anim === 'bounce'     ? 'sl-bounce' : 'sl-fade'
  const dur  = anim === 'bounce' ? '0.7s' : anim === 'appear' ? '0.05s' : '0.5s'
  const ease = anim === 'bounce' ? 'ease-out' : 'ease'
  // 延迟 = 每个元素间隔 0.1s + 动画顺序附加延迟
  const delay = (idx * 0.1 + orderDelay * 0.3).toFixed(2)
  return { animation: `${name} ${dur} ${ease} both`, animationDelay: `${delay}s` }
}

// ═══════════════════════════════════════
//  对齐辅助线计算
// ═══════════════════════════════════════

interface Guide { axis: 'x' | 'y'; pct: number }
const SNAP_THRESHOLD = 1.5

function calcGuides(dragged: SlideElement, others: SlideElement[]): { guides: Guide[]; snapX?: number; snapY?: number } {
  const dCX = dragged.x + dragged.w / 2, dCY = dragged.y + dragged.h / 2
  const dR = dragged.x + dragged.w, dB = dragged.y + dragged.h
  const guides: Guide[] = []
  let snapX: number | undefined, snapY: number | undefined

  // 幻灯片中心线
  const checkPoints = [
    { axis: 'x' as const, val: 50, myVals: [dragged.x, dCX, dR] },
    { axis: 'y' as const, val: 50, myVals: [dragged.y, dCY, dB] },
  ]
  for (const other of others) {
    const oCX = other.x + other.w / 2, oCY = other.y + other.h / 2
    const oR = other.x + other.w, oB = other.y + other.h
    checkPoints.push(
      ...([other.x, oCX, oR].map(v => ({ axis: 'x' as const, val: v, myVals: [dragged.x, dCX, dR] }))),
      ...([other.y, oCY, oB].map(v => ({ axis: 'y' as const, val: v, myVals: [dragged.y, dCY, dB] }))),
    )
  }

  for (const cp of checkPoints) {
    for (const myV of cp.myVals) {
      if (Math.abs(myV - cp.val) < SNAP_THRESHOLD) {
        guides.push({ axis: cp.axis, pct: cp.val })
        const delta = cp.val - myV
        if (cp.axis === 'x' && snapX === undefined) snapX = dragged.x + delta
        if (cp.axis === 'y' && snapY === undefined) snapY = dragged.y + delta
        break
      }
    }
  }
  return { guides: guides.slice(0, 4), snapX, snapY }
}

// ═══════════════════════════════════════
//  画布
// ═══════════════════════════════════════

interface SlideCanvasProps {
  slide: Slide; deck: SlidesDeck
  selectedId: string | null; editingId: string | null
  guides: Guide[]
  onSelect: (id: string | null) => void
  onUpdateElement: (id: string, patch: Partial<SlideElement>) => void
  onCommit: () => void
  onStartEdit: (id: string) => void
  onEndEdit: (id: string, text: string) => void
  onGuideChange: (guides: Guide[]) => void
  presentMode?: boolean
}

function SlideCanvas({ slide, deck, selectedId, editingId, guides, onSelect, onUpdateElement, onCommit, onStartEdit, onEndEdit, onGuideChange, presentMode }: SlideCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<DragState>({ type: 'none' })
  const editRef = useRef<HTMLDivElement | null>(null)
  const t = deck.theme
  const [canvasH, setCanvasH] = useState(0)

  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const ro = new ResizeObserver(e => setCanvasH(e[0].contentRect.height))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // 拖拽移动
  const handleElementMouseDown = useCallback((e: React.MouseEvent, elId: string) => {
    if (editingId === elId || presentMode) return
    e.preventDefault(); e.stopPropagation()
    onSelect(elId)
    const canvas = canvasRef.current; if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const el = slide.elements.find(el => el.id === elId)!
    dragRef.current = { type: 'move', elId, startMX: e.clientX, startMY: e.clientY, startX: el.x, startY: el.y, cW: rect.width, cH: rect.height }
    const others = slide.elements.filter(e => e.id !== elId)
    const onMove = (ev: MouseEvent) => {
      const d = dragRef.current; if (d.type !== 'move') return
      const dx = (ev.clientX - d.startMX) / d.cW * 100
      const dy = (ev.clientY - d.startMY) / d.cH * 100
      const dragged = { ...el, x: Math.max(0, Math.min(95, d.startX + dx)), y: Math.max(0, Math.min(95, d.startY + dy)) }
      const { guides: g, snapX, snapY } = calcGuides(dragged, others)
      onGuideChange(g)
      onUpdateElement(d.elId, { x: snapX ?? dragged.x, y: snapY ?? dragged.y })
    }
    const onUp = () => {
      dragRef.current = { type: 'none' }; onGuideChange([]); onCommit()
      window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp)
  }, [slide.elements, editingId, presentMode, onSelect, onUpdateElement, onGuideChange, onCommit])

  // 缩放
  const handleResizeMouseDown = useCallback((e: React.MouseEvent, elId: string, dir: HandleDir) => {
    e.preventDefault(); e.stopPropagation()
    const canvas = canvasRef.current; if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const el = slide.elements.find(el => el.id === elId)!
    dragRef.current = { type: 'resize', elId, dir, startMX: e.clientX, startMY: e.clientY, startX: el.x, startY: el.y, startW: el.w, startH: el.h, cW: rect.width, cH: rect.height }
    const onMove = (ev: MouseEvent) => {
      const d = dragRef.current; if (d.type !== 'resize') return
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
      dragRef.current = { type: 'none' }; onCommit()
      window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp)
  }, [slide.elements, onUpdateElement, onCommit])

  // 双击编辑
  const handleDoubleClick = useCallback((e: React.MouseEvent, elId: string) => {
    const el = slide.elements.find(e => e.id === elId)
    if (!el || el.elementType === 'image' || el.elementType === 'shape') return
    e.stopPropagation(); onStartEdit(elId)
    setTimeout(() => editRef.current?.focus(), 30)
  }, [slide.elements, onStartEdit])

  // 装饰条
  const deco = useMemo(() => {
    const acc = t.accent
    if (slide.layout === 'title') return <div style={{ position: 'absolute', left: 0, top: '72%', width: '100%', height: '0.8%', background: acc }} />
    if (slide.layout === 'closing') return <><div style={{ position: 'absolute', left: '35%', top: '22%', width: '30%', height: '0.7%', background: acc }} /><div style={{ position: 'absolute', left: '35%', top: '88%', width: '30%', height: '0.7%', background: acc }} /></>
    if (slide.layout === 'quote') return <div style={{ position: 'absolute', left: '5%', top: 0, width: '1.2%', height: '100%', background: acc }} />
    if (slide.layout === 'two-column') return <><div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '18%', background: acc }} /><div style={{ position: 'absolute', left: '50%', top: '20%', width: '0.3%', height: '77%', background: acc + '55' }} /></>
    return <div style={{ position: 'absolute', left: '3.5%', top: '5%', width: '0.6%', height: '88%', background: acc, borderRadius: 3 }} />
  }, [slide.layout, t.accent])

  return (
    <div ref={canvasRef} onClick={() => !presentMode && onSelect(null)}
      style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: t.bg, overflow: 'hidden', userSelect: 'none' }}>
      {deco}

      {/* 对齐辅助线 */}
      {guides.map((g, i) => g.axis === 'x'
        ? <div key={i} style={{ position: 'absolute', left: `${g.pct}%`, top: 0, width: 1, height: '100%', background: '#f43f5e', opacity: 0.7, pointerEvents: 'none', zIndex: 20 }} />
        : <div key={i} style={{ position: 'absolute', top: `${g.pct}%`, left: 0, height: 1, width: '100%', background: '#f43f5e', opacity: 0.7, pointerEvents: 'none', zIndex: 20 }} />
      )}

      {/* 元素 */}
      {slide.elements.map((el, elIdx) => {
        const isSelected = selectedId === el.id && !presentMode
        const isEditing  = editingId === el.id
        const color      = getElementColor(el.role, t, el.style.colorOverride)
        const animStyle  = presentMode ? animCss(el.animation, elIdx, el.animationOrder ?? 0) : {}
        const fsPx       = canvasH > 0 ? el.style.fontSize / 100 * canvasH : undefined

        return (
          <div key={el.id}
            onMouseDown={e => handleElementMouseDown(e, el.id)}
            onDoubleClick={e => handleDoubleClick(e, el.id)}
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute', left: `${el.x}%`, top: `${el.y}%`, width: `${el.w}%`, height: `${el.h}%`,
              cursor: presentMode ? 'default' : isEditing ? 'text' : 'move',
              outline: isSelected ? '1.5px solid #7c3aed' : 'none', boxSizing: 'border-box', ...animStyle,
            }}>

            {/* ── 形状（SVG渲染） ── */}
            {el.elementType === 'shape' ? (
              <svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="none"
                style={{ display: 'block', overflow: 'visible' }}>
                <path
                  d={el.svgPath || 'M0,0 H100 V100 H0 Z'}
                  fill={el.shapeFill || t.accent}
                  stroke={el.shapeStroke || 'none'}
                  strokeWidth={el.shapeStrokeWidth ? `${el.shapeStrokeWidth}` : '0'}
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            ) : el.elementType === 'image' && el.imageUrl ? (
              /* ── 图片 ── */
              <img src={el.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: 2 }} draggable={false} />
            ) : (
              /* ── 文字（可带背景色） ── */
              <div ref={isEditing ? editRef : undefined}
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={() => isEditing && onEndEdit(el.id, editRef.current?.innerText ?? el.text)}
                style={{
                  width: '100%', height: '100%', outline: 'none', overflow: 'hidden',
                  fontSize: fsPx ? `${fsPx}px` : `${el.style.fontSize}cqh`,
                  fontWeight: el.style.fontWeight, fontStyle: el.style.fontStyle,
                  color, textAlign: el.style.textAlign, lineHeight: el.style.lineHeight,
                  letterSpacing: `${el.style.letterSpacing}em`, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  background: el.style.bgFill || 'transparent',
                  cursor: isEditing ? 'text' : 'inherit', pointerEvents: isEditing ? 'auto' : 'none',
                }}
              >{el.text}</div>
            )}

            {/* Resize handles */}
            {isSelected && !isEditing && HANDLE_DIRS.map(dir => (
              <div key={dir} onMouseDown={e => handleResizeMouseDown(e, el.id, dir)} style={{
                position: 'absolute', width: 8, height: 8, background: '#7c3aed',
                border: '1.5px solid #fff', borderRadius: 2, cursor: HANDLE_CURSORS[dir], zIndex: 10,
                ...HANDLE_POS[dir],
              }} />
            ))}
          </div>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════
//  全屏演示模式
// ═══════════════════════════════════════

function PresentationOverlay({ deck, startIdx, onClose }: { deck: SlidesDeck; startIdx: number; onClose: () => void }) {
  const [idx, setIdx] = useState(startIdx)
  const slide = deck.slides[idx]

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') setIdx(i => Math.min(deck.slides.length - 1, i + 1))
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') setIdx(i => Math.max(0, i - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [deck.slides.length, onClose])

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <style>{ANIM_STYLE}</style>
      <div style={{ width: 'min(100vw, calc(100vh * 16/9))', position: 'relative' }}>
        <SlideCanvas slide={slide} deck={deck} selectedId={null} editingId={null} guides={[]}
          onSelect={() => {}} onUpdateElement={() => {}} onCommit={() => {}} onStartEdit={() => {}} onEndEdit={() => {}} onGuideChange={() => {}} presentMode />
      </div>
      {/* 控制栏 */}
      <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <button onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0}
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: idx === 0 ? '#444' : '#fff', fontSize: 28, cursor: idx === 0 ? 'default' : 'pointer', borderRadius: 6, padding: '4px 14px' }}>‹</button>
        <span style={{ color: '#888', fontSize: 13 }}>{idx + 1} / {deck.slides.length}</span>
        <button onClick={() => setIdx(i => Math.min(deck.slides.length - 1, i + 1))} disabled={idx === deck.slides.length - 1}
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: idx === deck.slides.length - 1 ? '#444' : '#fff', fontSize: 28, cursor: idx === deck.slides.length - 1 ? 'default' : 'pointer', borderRadius: 6, padding: '4px 14px' }}>›</button>
        <button onClick={onClose} style={{ position: 'absolute', right: 20, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#aaa', fontSize: 13, cursor: 'pointer', borderRadius: 5, padding: '5px 12px' }}>✕ 退出 (Esc)</button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════
//  缩略图
// ═══════════════════════════════════════

function SlideThumbnail({ slide, deck, index, selected, onClick, onDelete }: { slide: Slide; deck: SlidesDeck; index: number; selected: boolean; onClick: () => void; onDelete: () => void }) {
  return (
    <div onClick={onClick} style={{ position: 'relative', cursor: 'pointer', borderRadius: 5, border: selected ? '2px solid #7c3aed' : '2px solid #2a2a2a', flexShrink: 0 }}>
      <div style={{ fontSize: 9, color: '#666', padding: '2px 5px', background: '#111' }}>{index + 1}</div>
      <div style={{ width: 160, height: 90, background: deck.theme.bg, position: 'relative', overflow: 'hidden' }}>
        {slide.elements.map(el => el.elementType === 'image' && el.imageUrl ? (
          <img key={el.id} src={el.imageUrl} style={{ position: 'absolute', left: `${el.x}%`, top: `${el.y}%`, width: `${el.w}%`, height: `${el.h}%`, objectFit: 'cover' }} />
        ) : (
          <div key={el.id} style={{ position: 'absolute', left: `${el.x}%`, top: `${el.y}%`, width: `${el.w}%`, height: `${el.h}%`, fontSize: `${el.style.fontSize * 0.85}px`, fontWeight: el.style.fontWeight, color: getElementColor(el.role, deck.theme, el.style.colorOverride), textAlign: el.style.textAlign, lineHeight: el.style.lineHeight, overflow: 'hidden', whiteSpace: 'pre-wrap', wordBreak: 'break-word', pointerEvents: 'none' }}>{el.text}</div>
        ))}
      </div>
      {selected && <button onClick={e => { e.stopPropagation(); onDelete() }} style={{ position: 'absolute', top: 2, right: 2, width: 16, height: 16, borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', fontSize: 10, cursor: 'pointer' }}>×</button>}
    </div>
  )
}

// ═══════════════════════════════════════
//  导出（PNG / PDF）
// ═══════════════════════════════════════

async function captureSlide(slide: Slide, deck: SlidesDeck): Promise<HTMLCanvasElement> {
  const html2canvas = (await import('html2canvas')).default
  const W = 1280, H = 720
  const container = document.createElement('div')
  container.style.cssText = `position:fixed;left:-9999px;top:0;width:${W}px;height:${H}px;overflow:hidden`
  container.innerHTML = renderSlideHtml(slide, deck.theme, W, H)
  document.body.appendChild(container)
  const canvas = await html2canvas(container, { scale: 1, useCORS: true, allowTaint: true, backgroundColor: null })
  document.body.removeChild(container)
  return canvas
}

async function exportPng(deck: SlidesDeck, slideIdx: number) {
  const canvas = await captureSlide(deck.slides[slideIdx], deck)
  const a = document.createElement('a')
  a.href = canvas.toDataURL('image/png')
  a.download = `${deck.title}-第${slideIdx + 1}页.png`
  a.click()
}

async function exportAllPng(deck: SlidesDeck) {
  for (let i = 0; i < deck.slides.length; i++) {
    const canvas = await captureSlide(deck.slides[i], deck)
    await new Promise(r => setTimeout(r, 100))
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = `${deck.title}-第${i + 1}页.png`
    a.click()
    await new Promise(r => setTimeout(r, 200))
  }
}

async function exportPdf(deck: SlidesDeck) {
  const jsPDF = (await import('jspdf')).default
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1280, 720] })
  for (let i = 0; i < deck.slides.length; i++) {
    if (i > 0) pdf.addPage([1280, 720], 'landscape')
    const canvas = await captureSlide(deck.slides[i], deck)
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, 1280, 720)
  }
  pdf.save(`${deck.title}.pdf`)
}

// ═══════════════════════════════════════
//  主面板
// ═══════════════════════════════════════

export default function SlidesEditorPanel() {
  const [histState, dispatch] = useReducer(historyReducer, { past: [], present: createDefaultDeck(), future: [] })
  const deck = histState.present
  const setDeck = useCallback((d: SlidesDeck) => dispatch({ type: 'SET', deck: d }), [])
  const undo = useCallback(() => dispatch({ type: 'UNDO' }), [])
  const redo = useCallback(() => dispatch({ type: 'REDO' }), [])

  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [guides, setGuides] = useState<Guide[]>([])
  const [presentMode, setPresentMode] = useState(false)
  const [config, setConfig] = useState<AIClientConfig | null>(null)
  const [showConfig, setShowConfig] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [themeIdx, setThemeIdx] = useState(0)
  const [exporting, setExporting] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  // AI 微调
  const [aiInstruction, setAiInstruction] = useState('')
  const [refining, setRefining] = useState(false)
  // PPTX 导入 + 风格分析
  const [importStatus, setImportStatus] = useState<'idle' | 'parsing' | 'analyzing' | 'done' | 'error'>('idle')
  const [importError, setImportError] = useState('')
  const [styleAnalysis, setStyleAnalysis] = useState<StyleAnalysis | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [continueInstruction, setContinueInstruction] = useState('')
  const [continuing, setContinuing] = useState(false)
  const [polishing, setPolishing] = useState(false)
  // 动画选择器：选中元素时显示
  const ANIM_OPTIONS: { val: AnimationType; label: string }[] = [
    { val: 'none',       label: '无'   },
    { val: 'appear',     label: '出现' },
    { val: 'fade',       label: '淡入' },
    { val: 'slide-up',   label: '上滑' },
    { val: 'slide-left', label: '左滑' },
    { val: 'zoom',       label: '缩放' },
    { val: 'bounce',     label: '弹入' },
  ]

  useEffect(() => {
    const saved = loadChatConfig(); setConfig(saved)
    if (!saved) setShowConfig(true)
  }, [])

  const currentSlide = deck.slides[Math.min(currentIdx, deck.slides.length - 1)]
  const selectedEl = currentSlide?.elements.find(e => e.id === selectedId) ?? null

  // 提交历史（拖拽/缩放结束时调用）
  const handleCommit = useCallback(() => {
    dispatch({ type: 'SET', deck: histState.present })
  }, [histState.present])

  // 更新元素
  const handleUpdateElement = useCallback((id: string, patch: Partial<SlideElement>) => {
    if ((patch as any).id === '__delete__') {
      const newDeck = { ...deck, slides: deck.slides.map((s, i) => i !== currentIdx ? s : { ...s, elements: s.elements.filter(e => e.id !== id) }) }
      setDeck(newDeck); setSelectedId(null); return
    }
    const newDeck = { ...deck, slides: deck.slides.map((s, i) => i !== currentIdx ? s : { ...s, elements: s.elements.map(e => e.id === id ? { ...e, ...patch } : e) }) }
    // live update（不推历史，mouseup时commit）
    dispatch({ type: 'SET', deck: newDeck })
  }, [deck, currentIdx, setDeck])

  const handleEndEdit = useCallback((id: string, text: string) => {
    setEditingId(null)
    const newDeck = { ...deck, slides: deck.slides.map((s, i) => i !== currentIdx ? s : { ...s, elements: s.elements.map(e => e.id === id ? { ...e, text } : e) }) }
    setDeck(newDeck)
  }, [deck, currentIdx, setDeck])

  // 键盘：撤销/重做/删除
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) { e.preventDefault(); undo() }
      if ((e.key === 'y' && (e.ctrlKey || e.metaKey)) || (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey)) { e.preventDefault(); redo() }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId && !editingId) {
        handleUpdateElement(selectedId, { id: '__delete__' } as any)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo, selectedId, editingId, handleUpdateElement])

  const switchSlide = (idx: number) => { setSelectedId(null); setEditingId(null); setCurrentIdx(idx) }

  const updateStyle = useCallback((patch: Partial<SlideElement['style']>) => {
    if (!selectedId || !selectedEl) return
    handleUpdateElement(selectedId, { style: { ...selectedEl.style, ...patch } })
  }, [selectedId, selectedEl, handleUpdateElement])

  // 添加文字元素
  const addTextElement = (role: ElementRole) => {
    const el: SlideElement = {
      id: makeId(), elementType: 'text', role, animation: 'none',
      text: role === 'title' ? '标题文字' : role === 'label' ? '标签' : '正文内容',
      x: 10, y: 10, w: 60, h: role === 'label' ? 8 : role === 'title' ? 18 : 40,
      style: { fontSize: role === 'title' ? 6 : role === 'label' ? 2.2 : 3, fontWeight: role === 'title' ? 'bold' : 'normal', fontStyle: 'normal', textAlign: 'left', lineHeight: 1.6, letterSpacing: 0 },
    }
    setDeck({ ...deck, slides: deck.slides.map((s, i) => i === currentIdx ? { ...s, elements: [...s.elements, el] } : s) })
    setSelectedId(el.id)
  }

  // 插入图片
  const handleImageInsert = () => {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = 'image/*'
    input.onchange = () => {
      const file = input.files?.[0]; if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        const el: SlideElement = {
          id: makeId(), elementType: 'image', role: 'custom', animation: 'none',
          text: '', imageUrl: reader.result as string,
          x: 15, y: 15, w: 40, h: 45,
          style: { fontSize: 3, fontWeight: 'normal', fontStyle: 'normal', textAlign: 'left', lineHeight: 1.5, letterSpacing: 0 },
        }
        setDeck({ ...deck, slides: deck.slides.map((s, i) => i === currentIdx ? { ...s, elements: [...s.elements, el] } : s) })
        setSelectedId(el.id)
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }

  // 添加/删除幻灯片
  const addSlide = (layout: SlideLayout) => {
    const newSlide = createEmptySlide(layout)
    const slides = [...deck.slides]; slides.splice(currentIdx + 1, 0, newSlide)
    setDeck({ ...deck, slides }); setCurrentIdx(currentIdx + 1); setSelectedId(null)
  }
  const deleteSlide = (idx: number) => {
    if (deck.slides.length <= 1) return
    setDeck({ ...deck, slides: deck.slides.filter((_, i) => i !== idx) })
    setCurrentIdx(Math.max(0, idx - 1)); setSelectedId(null)
  }

  // AI 生成
  const handleGenerate = useCallback(async () => {
    if (!config || !prompt.trim()) return
    setGenerating(true)
    const res = await generateSlidesDeck(config, prompt.trim(), themeIdx)
    if (res.success && res.deck) { setDeck({ ...res.deck, theme: SLIDE_THEMES[themeIdx] }); setCurrentIdx(0); setSelectedId(null) }
    else alert(res.error || '生成失败')
    setGenerating(false)
  }, [config, prompt, themeIdx, setDeck])

  // AI 微调单页
  const handleRefine = useCallback(async () => {
    if (!config || !aiInstruction.trim() || !currentSlide) return
    setRefining(true)
    const res = await refineSlide(config, currentSlide, aiInstruction.trim())
    if (res.success && res.slide) {
      setDeck({ ...deck, slides: deck.slides.map((s, i) => i === currentIdx ? res.slide! : s) })
      setAiInstruction('')
    } else alert(res.error || '微调失败')
    setRefining(false)
  }, [config, aiInstruction, currentSlide, deck, currentIdx, setDeck])

  // 导入 PPTX
  const handleImportPptx = useCallback(async (file: File) => {
    setImportStatus('parsing')
    setImportError('')
    try {
      const parsed = await parsePptx(file)
      // 用检测到的主题替换当前主题
      const importedDeck: SlidesDeck = {
        title: parsed.originalTitle,
        theme: parsed.styleProfile.mappedTheme,
        slides: parsed.slides,
      }
      setDeck(importedDeck)
      setCurrentIdx(0); setSelectedId(null)
      setThemeIdx(-1) // 标记为自定义主题

      // 继续用 AI 分析风格
      if (config) {
        setImportStatus('analyzing')
        const summary = summarizeParsedPptx(parsed)
        const res = await analyzeStyleWithAI(config, summary)
        if (res.success && res.analysis) {
          setStyleAnalysis(res.analysis)
          setImportStatus('done')
        } else {
          setImportStatus('done') // 无 AI 也能用
        }
      } else {
        setImportStatus('done')
      }
      setShowImportModal(true)
    } catch (err) {
      setImportStatus('error')
      setImportError(String(err))
    }
  }, [config, setDeck])

  // 风格感知续写
  const handleContinueWithStyle = useCallback(async () => {
    if (!config || !styleAnalysis || !continueInstruction.trim()) return
    setContinuing(true)
    const res = await generateSlidesWithStyle(config, continueInstruction.trim(), styleAnalysis, deck.slides, themeIdx >= 0 ? themeIdx : 0)
    if (res.success && res.slides) {
      setDeck({ ...deck, slides: [...deck.slides, ...res.slides] })
      setContinueInstruction('')
    } else alert(res.error || '续写失败')
    setContinuing(false)
  }, [config, styleAnalysis, continueInstruction, deck, themeIdx, setDeck])

  // 一键美化（统一语言风格）
  const handlePolishDeck = useCallback(async () => {
    if (!config || !styleAnalysis) return
    setPolishing(true)
    const res = await polishDeckWithStyle(config, deck.slides, styleAnalysis)
    if (res.success && res.slides) setDeck({ ...deck, slides: res.slides })
    else alert(res.error || '美化失败')
    setPolishing(false)
  }, [config, styleAnalysis, deck, setDeck])

  // 切换主题
  const applyTheme = (idx: number) => { setThemeIdx(idx); setDeck({ ...deck, theme: SLIDE_THEMES[idx] }) }

  // 导出
  const handleExport = async (type: 'pptx' | 'pdf' | 'png' | 'png-all') => {
    setShowExportMenu(false); setExporting(true)
    try {
      if (type === 'pptx') await exportToPptx(deck)
      else if (type === 'pdf') await exportPdf(deck)
      else if (type === 'png') await exportPng(deck, currentIdx)
      else await exportAllPng(deck)
    } catch (e) { alert('导出失败：' + String(e)) }
    setExporting(false)
  }

  const bg1 = '#111', bg2 = '#1a1a1a', bd = '#252525', mu = '#666', accent = '#7c3aed'

  return (
    <div style={{ display: 'flex', height: '100%', background: '#0d0d0d', color: '#e5e5e5', fontFamily: 'system-ui,sans-serif', overflow: 'hidden' }}>
      <style>{ANIM_STYLE}</style>

      {/* ══ 全屏演示 ══ */}
      {presentMode && <PresentationOverlay deck={deck} startIdx={currentIdx} onClose={() => setPresentMode(false)} />}

      {/* ══ 左栏：幻灯片列表 ══ */}
      <div style={{ width: 186, background: bg1, borderRight: `1px solid ${bd}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '8px 10px 6px', fontSize: 10, color: mu, fontWeight: 700, letterSpacing: 1, borderBottom: `1px solid ${bd}` }}>幻灯片 · {deck.slides.length}页</div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {deck.slides.map((slide, i) => (
            <SlideThumbnail key={slide.id} slide={slide} deck={deck} index={i} selected={i === currentIdx} onClick={() => switchSlide(i)} onDelete={() => deleteSlide(i)} />
          ))}
        </div>
        <div style={{ padding: '8px 10px', borderTop: `1px solid ${bd}` }}>
          <div style={{ fontSize: 9, color: mu, marginBottom: 5 }}>+ 新建幻灯片</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {([['content', '正文'], ['bullets', '要点'], ['two-column', '双栏'], ['quote', '引言'], ['title', '封面'], ['closing', '结尾']] as [SlideLayout, string][]).map(([layout, label]) => (
              <button key={layout} onClick={() => addSlide(layout)} style={{ padding: '3px 6px', fontSize: 9, cursor: 'pointer', background: '#222', border: `1px solid ${bd}`, borderRadius: 3, color: '#aaa' }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ══ 中间：画布 ══ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* 顶部工具栏 */}
        <div style={{ height: 42, background: bg2, borderBottom: `1px solid ${bd}`, display: 'flex', alignItems: 'center', padding: '0 10px', gap: 5, flexShrink: 0 }}>
          {/* 撤销/重做 */}
          <button onClick={undo} disabled={!histState.past.length} title="撤销 Ctrl+Z"
            style={{ padding: '3px 8px', fontSize: 12, background: histState.past.length ? '#222' : '#1a1a1a', border: `1px solid ${bd}`, borderRadius: 4, color: histState.past.length ? '#ccc' : '#444', cursor: histState.past.length ? 'pointer' : 'default' }}>↩</button>
          <button onClick={redo} disabled={!histState.future.length} title="重做 Ctrl+Y"
            style={{ padding: '3px 8px', fontSize: 12, background: histState.future.length ? '#222' : '#1a1a1a', border: `1px solid ${bd}`, borderRadius: 4, color: histState.future.length ? '#ccc' : '#444', cursor: histState.future.length ? 'pointer' : 'default' }}>↪</button>

          <div style={{ width: 1, height: 20, background: bd, margin: '0 4px' }} />

          {/* 选中元素工具 */}
          {selectedEl ? (<>
            <select value={selectedEl.style.fontSize} onChange={e => updateStyle({ fontSize: parseFloat(e.target.value) })}
              style={{ fontSize: 10, background: '#222', border: `1px solid ${bd}`, color: '#ddd', borderRadius: 3, padding: '1px 3px' }}>
              {[1.5, 2, 2.2, 2.8, 3, 3.5, 4, 4.5, 5, 5.5, 6, 7, 8, 10].map(v => <option key={v} value={v}>{v}%</option>)}
            </select>
            <button onClick={() => updateStyle({ fontWeight: selectedEl.style.fontWeight === 'bold' ? 'normal' : 'bold' })}
              style={{ padding: '2px 7px', fontSize: 11, fontWeight: 700, background: selectedEl.style.fontWeight === 'bold' ? accent : '#222', border: `1px solid ${bd}`, borderRadius: 3, color: selectedEl.style.fontWeight === 'bold' ? '#fff' : '#aaa', cursor: 'pointer' }}>B</button>
            <button onClick={() => updateStyle({ fontStyle: selectedEl.style.fontStyle === 'italic' ? 'normal' : 'italic' })}
              style={{ padding: '2px 7px', fontSize: 11, fontStyle: 'italic', background: selectedEl.style.fontStyle === 'italic' ? accent : '#222', border: `1px solid ${bd}`, borderRadius: 3, color: selectedEl.style.fontStyle === 'italic' ? '#fff' : '#aaa', cursor: 'pointer' }}>I</button>
            {(['left', 'center', 'right'] as const).map(a => (
              <button key={a} onClick={() => updateStyle({ textAlign: a })}
                style={{ padding: '2px 6px', fontSize: 11, background: selectedEl.style.textAlign === a ? accent : '#222', border: `1px solid ${bd}`, borderRadius: 3, color: selectedEl.style.textAlign === a ? '#fff' : '#aaa', cursor: 'pointer' }}>
                {a === 'left' ? '⫷' : a === 'center' ? '≡' : '⫸'}
              </button>
            ))}
            <input type="color" value={selectedEl.style.colorOverride || '#ffffff'} onChange={e => updateStyle({ colorOverride: e.target.value })}
              style={{ width: 22, height: 22, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }} title="文字颜色" />
            {/* 动画 */}
            <select value={selectedEl.animation} onChange={e => handleUpdateElement(selectedId!, { animation: e.target.value as AnimationType })}
              style={{ fontSize: 10, background: '#222', border: `1px solid ${bd}`, color: '#ddd', borderRadius: 3, padding: '1px 3px' }} title="动画效果">
              {ANIM_OPTIONS.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
            </select>
          </>) : (
            <span style={{ fontSize: 10, color: mu }}>点击元素选中 · 拖拽移动 · 拖角点缩放 · 双击编辑文字</span>
          )}

          <div style={{ flex: 1 }} />

          {/* 插入 */}
          {(['title', 'body', 'label'] as ElementRole[]).map(role => (
            <button key={role} onClick={() => addTextElement(role)} style={{ padding: '2px 6px', fontSize: 9, background: '#222', border: `1px solid ${bd}`, borderRadius: 3, color: '#aaa', cursor: 'pointer' }}>
              +{role === 'title' ? '标题' : role === 'body' ? '正文' : '标签'}
            </button>
          ))}
          <button onClick={handleImageInsert} style={{ padding: '2px 8px', fontSize: 9, background: '#222', border: `1px solid ${bd}`, borderRadius: 3, color: '#aaa', cursor: 'pointer' }}>🖼 图片</button>

          <div style={{ width: 1, height: 20, background: bd, margin: '0 2px' }} />

          {/* 导入 PPTX */}
          <button
            onClick={() => { const i = document.createElement('input'); i.type='file'; i.accept='.pptx,.ppt'; i.onchange=()=>{ if(i.files?.[0]) handleImportPptx(i.files[0]) }; i.click() }}
            disabled={importStatus === 'parsing' || importStatus === 'analyzing'}
            style={{ padding: '4px 10px', fontSize: 11, background: '#1c2a1c', border: `1px solid #4d7c4d`, borderRadius: 4, color: '#86efac', cursor: 'pointer' }}>
            {importStatus === 'parsing' ? '解析中…' : importStatus === 'analyzing' ? 'AI分析…' : '📂 导入'}
          </button>

          {/* 演示 */}
          <button onClick={() => setPresentMode(true)} title="全屏演示"
            style={{ padding: '4px 10px', fontSize: 11, background: '#1e3a5f', border: `1px solid #2563eb`, borderRadius: 4, color: '#60a5fa', cursor: 'pointer' }}>▶ 演示</button>

          {/* 导出 */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowExportMenu(v => !v)} disabled={exporting}
              style={{ padding: '4px 10px', fontSize: 11, fontWeight: 600, background: exporting ? '#222' : '#059669', border: 'none', borderRadius: 4, color: exporting ? '#555' : '#fff', cursor: exporting ? 'default' : 'pointer' }}>
              {exporting ? '导出中…' : '⬇ 导出 ▾'}
            </button>
            {showExportMenu && (
              <div style={{ position: 'absolute', right: 0, top: '110%', background: '#1e1e1e', border: `1px solid ${bd}`, borderRadius: 6, padding: 4, zIndex: 50, minWidth: 140 }}>
                {[['pptx', '⊞ 导出 PPTX'], ['pdf', '📄 导出 PDF（全部）'], ['png', '🖼 导出 PNG（当前页）'], ['png-all', '🖼 导出 PNG（全部页）']].map(([t, l]) => (
                  <button key={t} onClick={() => handleExport(t as any)} style={{ display: 'block', width: '100%', padding: '6px 12px', fontSize: 11, background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', textAlign: 'left', borderRadius: 4 }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#2a2a2a')} onMouseLeave={e => (e.currentTarget.style.background = 'none')}>{l}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 画布 */}
        <div onClick={() => setShowExportMenu(false)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#161616', padding: 24, overflow: 'auto', containerType: 'size' }}>
          {currentSlide ? (
            <div style={{ width: 'min(100%, calc(100cqh * 16 / 9))', boxShadow: '0 8px 48px rgba(0,0,0,0.7)', borderRadius: 3, containerType: 'size' }}>
              <SlideCanvas slide={currentSlide} deck={deck} selectedId={selectedId} editingId={editingId} guides={guides}
                onSelect={setSelectedId} onUpdateElement={handleUpdateElement} onCommit={handleCommit}
                onStartEdit={setEditingId} onEndEdit={handleEndEdit} onGuideChange={setGuides} />
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

      {/* ══ 右栏 ══ */}
      <div style={{ width: 248, background: bg2, borderLeft: `1px solid ${bd}`, display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>

        {/* AI 生成 */}
        <div style={{ padding: '10px 12px', borderBottom: `1px solid ${bd}` }}>
          <div style={{ fontSize: 10, color: mu, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>✨ AI 生成全套</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginBottom: 6 }}>
            {SLIDES_PRESETS.map(p => (
              <button key={p.id} onClick={() => { setSelectedPreset(p.id); setPrompt(p.examplePrompt) }}
                style={{ padding: '2px 6px', fontSize: 9, cursor: 'pointer', background: selectedPreset === p.id ? accent : '#1a1a1a', border: `1px solid ${selectedPreset === p.id ? accent : bd}`, borderRadius: 3, color: selectedPreset === p.id ? '#fff' : '#999' }}>
                {p.icon} {p.name}
              </button>
            ))}
          </div>
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="描述演示主题…" rows={3}
            style={{ width: '100%', boxSizing: 'border-box', resize: 'none', background: '#111', border: `1px solid ${bd}`, borderRadius: 4, color: '#ddd', fontSize: 11, padding: '5px 7px', fontFamily: 'inherit', outline: 'none' }} />
          <button onClick={handleGenerate} disabled={generating || !config || !prompt.trim()}
            style={{ marginTop: 5, width: '100%', padding: '6px 0', fontSize: 12, fontWeight: 600, background: generating || !config || !prompt.trim() ? '#2a2a2a' : accent, border: 'none', borderRadius: 4, color: generating || !config || !prompt.trim() ? '#555' : '#fff', cursor: generating || !config || !prompt.trim() ? 'default' : 'pointer' }}>
            {generating ? '生成中…' : 'AI 生成'}
          </button>
        </div>

        {/* AI 微调当前页 */}
        <div style={{ padding: '10px 12px', borderBottom: `1px solid ${bd}` }}>
          <div style={{ fontSize: 10, color: mu, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>🎯 AI 微调当前页</div>
          <textarea value={aiInstruction} onChange={e => setAiInstruction(e.target.value)} placeholder="例：精简内容 / 改成更有力的标题 / 换成口语化表达…" rows={2}
            style={{ width: '100%', boxSizing: 'border-box', resize: 'none', background: '#111', border: `1px solid ${bd}`, borderRadius: 4, color: '#ddd', fontSize: 11, padding: '5px 7px', fontFamily: 'inherit', outline: 'none' }} />
          <button onClick={handleRefine} disabled={refining || !config || !aiInstruction.trim()}
            style={{ marginTop: 5, width: '100%', padding: '5px 0', fontSize: 11, fontWeight: 600, background: refining || !config || !aiInstruction.trim() ? '#2a2a2a' : '#0891b2', border: 'none', borderRadius: 4, color: refining || !config || !aiInstruction.trim() ? '#555' : '#fff', cursor: refining || !config || !aiInstruction.trim() ? 'default' : 'pointer' }}>
            {refining ? '微调中…' : '微调这一页'}
          </button>
        </div>

        {/* 风格感知（导入 PPTX 后显示） */}
        {styleAnalysis && (
          <div style={{ padding: '10px 12px', borderBottom: `1px solid ${bd}`, background: '#0e1a0e' }}>
            <div style={{ fontSize: 10, color: '#4ade80', fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>🧠 检测到风格</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginBottom: 6 }}>
              {styleAnalysis.styleKeywords.map(k => (
                <span key={k} style={{ padding: '1px 6px', fontSize: 9, background: '#1a2e1a', border: '1px solid #2d4f2d', borderRadius: 10, color: '#86efac' }}>{k}</span>
              ))}
              <span style={{ padding: '1px 6px', fontSize: 9, background: '#1a2e1a', border: '1px solid #2d4f2d', borderRadius: 10, color: '#86efac' }}>{styleAnalysis.tone}</span>
            </div>
            <div style={{ fontSize: 9, color: '#555', marginBottom: 8, lineHeight: 1.7 }}>{styleAnalysis.colorDescription}</div>
            <textarea value={continueInstruction} onChange={e => setContinueInstruction(e.target.value)}
              placeholder="例：再生成 3 页竞品分析 / 加一页总结…" rows={2}
              style={{ width: '100%', boxSizing: 'border-box', resize: 'none', background: '#111', border: `1px solid #2d4f2d`, borderRadius: 4, color: '#ddd', fontSize: 11, padding: '5px 7px', fontFamily: 'inherit', outline: 'none' }} />
            <div style={{ display: 'flex', gap: 4, marginTop: 5 }}>
              <button onClick={handleContinueWithStyle} disabled={continuing || !config || !continueInstruction.trim()}
                style={{ flex: 1, padding: '5px 0', fontSize: 10, fontWeight: 600, background: continuing || !config || !continueInstruction.trim() ? '#1a1a1a' : '#166534', border: 'none', borderRadius: 4, color: continuing || !config || !continueInstruction.trim() ? '#444' : '#86efac', cursor: 'pointer' }}>
                {continuing ? '续写中…' : '✦ 风格续写'}
              </button>
              <button onClick={handlePolishDeck} disabled={polishing || !config}
                style={{ flex: 1, padding: '5px 0', fontSize: 10, fontWeight: 600, background: polishing || !config ? '#1a1a1a' : '#0f3460', border: 'none', borderRadius: 4, color: polishing || !config ? '#444' : '#93c5fd', cursor: 'pointer' }}>
                {polishing ? '美化中…' : '✦ 一键美化'}
              </button>
            </div>
          </div>
        )}

        {/* 主题 */}
        <div style={{ padding: '10px 12px', borderBottom: `1px solid ${bd}` }}>
          <div style={{ fontSize: 10, color: mu, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>🎨 配色主题</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {SLIDE_THEMES.map((theme, i) => (
              <button key={i} onClick={() => applyTheme(i)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 8px', borderRadius: 4, cursor: 'pointer', background: themeIdx === i ? '#1e1630' : '#161616', border: `1px solid ${themeIdx === i ? accent : bd}`, textAlign: 'left' }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[theme.bg, theme.accent, theme.titleColor].map((c, ci) => <div key={ci} style={{ width: 10, height: 10, borderRadius: 2, background: c, border: '1px solid #333' }} />)}
                </div>
                <span style={{ fontSize: 11, color: themeIdx === i ? '#ddd' : '#888' }}>{theme.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* API + 说明 */}
        <div style={{ padding: '10px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={() => setShowConfig(true)} style={{ padding: '5px 0', fontSize: 10, background: '#1a1a1a', border: `1px solid ${bd}`, borderRadius: 4, color: config ? '#4ade80' : '#f59e0b', cursor: 'pointer' }}>
            {config ? '✓ API 已配置' : '⚠ 配置 API Key'}
          </button>
          <div style={{ fontSize: 10, color: '#3a3a3a', lineHeight: 1.9 }}>
            ↩/↪ 撤销/重做 · Del 删除元素<br />
            双击文字 → 编辑<br />
            拖角点 → 缩放大小<br />
            红线 → 对齐辅助
          </div>
        </div>
      </div>

      {/* 导入结果弹窗 */}
      {showImportModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}
          onClick={() => setShowImportModal(false)}>
          <div style={{ background: '#1a1a1a', borderRadius: 12, padding: 24, width: 440, border: `1px solid #2d4f2d`, maxHeight: '80vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            {importStatus === 'error' ? (
              <>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#f87171', marginBottom: 12 }}>❌ 导入失败</div>
                <div style={{ fontSize: 12, color: '#999', marginBottom: 16 }}>{importError}</div>
                <button onClick={() => setShowImportModal(false)} style={{ padding: '6px 20px', background: '#2a2a2a', border: `1px solid #333`, borderRadius: 6, color: '#ccc', cursor: 'pointer' }}>关闭</button>
              </>
            ) : (
              <>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#4ade80', marginBottom: 4 }}>✅ 导入成功</div>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>已导入 {deck.slides.length} 页幻灯片，主题配色已自动适配</div>

                {styleAnalysis ? (
                  <>
                    <div style={{ fontSize: 11, color: '#86efac', fontWeight: 600, marginBottom: 8 }}>🧠 AI 风格分析结果</div>
                    <div style={{ background: '#111', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                        {styleAnalysis.styleKeywords.map(k => (
                          <span key={k} style={{ padding: '2px 8px', fontSize: 10, background: '#1a2e1a', border: '1px solid #2d4f2d', borderRadius: 10, color: '#86efac' }}>{k}</span>
                        ))}
                        <span style={{ padding: '2px 8px', fontSize: 10, background: '#1a2e28', border: '1px solid #2d4f3a', borderRadius: 10, color: '#6ee7b7' }}>{styleAnalysis.tone}</span>
                      </div>
                      <div style={{ fontSize: 11, color: '#aaa', lineHeight: 1.7 }}>
                        <div><b style={{ color: '#666' }}>版式：</b>{styleAnalysis.layoutPattern}</div>
                        <div><b style={{ color: '#666' }}>配色：</b>{styleAnalysis.colorDescription}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: '#aaa', marginBottom: 16 }}>
                      检测到风格后，右侧面板将出现 <b style={{ color: '#86efac' }}>「风格续写」</b> 和 <b style={{ color: '#93c5fd' }}>「一键美化」</b>，生成的内容将自动匹配此风格。
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>配置 API Key 后可进行 AI 风格分析，实现风格感知续写。</div>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setShowImportModal(false)}
                    style={{ flex: 1, padding: '8px 0', fontSize: 12, fontWeight: 600, background: '#166534', border: 'none', borderRadius: 6, color: '#86efac', cursor: 'pointer' }}>开始编辑</button>
                  {styleAnalysis && config && (
                    <button onClick={() => { setShowImportModal(false); document.querySelector<HTMLTextAreaElement>('textarea[placeholder*="再生成"]')?.focus() }}
                      style={{ flex: 1, padding: '8px 0', fontSize: 12, fontWeight: 600, background: '#0f3460', border: 'none', borderRadius: 6, color: '#93c5fd', cursor: 'pointer' }}>去续写 →</button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* API 配置弹窗 */}
      {showConfig && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div style={{ background: '#1e1e1e', borderRadius: 10, padding: 22, width: 420, border: `1px solid ${bd}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontWeight: 600 }}>API 配置</span>
              <button onClick={() => setShowConfig(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
            <APIConfigForm title="配置 AI 服务" description="推荐通义千问或 DeepSeek。" config={config}
              providers={chatProviderPresets.filter(p => p.id !== 'custom').slice(0, 8)}
              onSave={cfg => { setConfig(cfg as AIClientConfig); saveChatConfig(cfg as AIClientConfig); setShowConfig(false) }}
              onCancel={() => setShowConfig(false)} />
          </div>
        </div>
      )}
    </div>
  )
}

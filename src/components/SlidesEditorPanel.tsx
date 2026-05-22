// 幻灯片编辑器面板 — AI生成 + 可视化编辑 + 导出PPTX

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  type Slide, type SlidesDeck, type SlideLayout, type SlideTheme,
  SLIDE_THEMES, SLIDES_PRESETS,
  createDefaultDeck, createEmptySlide,
  generateSlidesDeck, exportToPptx,
} from '../lib/ai/slides-gen'
import { loadChatConfig, saveChatConfig, chatProviderPresets, type AIClientConfig } from '../lib/ai/client'
import { APIConfigForm } from './APIConfigForm'

// ═══════════════════════════════════════
//  幻灯片渲染
// ═══════════════════════════════════════

function renderSlideHtml(slide: Slide, theme: SlideTheme, scale = 1): string {
  const t = theme
  const px = (v: number) => `${v * scale}px`

  const base = `
    position:relative;width:${px(900)};height:${px(506)};
    background:${t.bg};overflow:hidden;font-family:'PingFang SC','Microsoft YaHei',sans-serif;
    flex-shrink:0;
  `

  if (slide.layout === 'title') {
    const titleEl = slide.elements.find(e => e.type === 'title')
    const subtitleEl = slide.elements.find(e => e.type === 'subtitle')
    return `<div style="${base}">
      <div style="position:absolute;left:0;bottom:${px(180)};width:100%;height:${px(4)};background:${t.accent}"></div>
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${px(16)}">
        <div class="slide-el" data-id="${titleEl?.id}" style="font-size:${px(48)};font-weight:700;color:${t.titleColor};text-align:center;padding:0 ${px(48)};outline:none;min-width:${px(200)}" contenteditable="true">${titleEl?.text || ''}</div>
        <div class="slide-el" data-id="${subtitleEl?.id}" style="font-size:${px(20)};color:${t.bodyColor};text-align:center;outline:none;min-width:${px(100)}" contenteditable="true">${subtitleEl?.text || ''}</div>
      </div>
    </div>`
  }

  if (slide.layout === 'quote') {
    const bodyEl = slide.elements.find(e => e.type === 'body')
    const subtitleEl = slide.elements.find(e => e.type === 'subtitle')
    return `<div style="${base}">
      <div style="position:absolute;left:${px(48)};top:0;bottom:0;width:${px(6)};background:${t.accent}"></div>
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;padding:0 ${px(80)}">
        <div class="slide-el" data-id="${bodyEl?.id}" style="font-size:${px(26)};font-weight:700;font-style:italic;color:${t.titleColor};line-height:1.6;outline:none" contenteditable="true">${bodyEl?.text || ''}</div>
        <div class="slide-el" data-id="${subtitleEl?.id}" style="margin-top:${px(24)};font-size:${px(16)};color:${t.bodyColor};outline:none" contenteditable="true">${subtitleEl?.text || ''}</div>
      </div>
    </div>`
  }

  if (slide.layout === 'two-column') {
    const titleEl = slide.elements.find(e => e.type === 'title')
    const bodyEls = slide.elements.filter(e => e.type === 'body')
    return `<div style="${base}">
      <div style="position:absolute;left:0;top:0;right:0;height:${px(72)};background:${t.accent};display:flex;align-items:center;padding:0 ${px(36)}">
        <div class="slide-el" data-id="${titleEl?.id}" style="font-size:${px(24)};font-weight:700;color:${t.accentText};outline:none;flex:1" contenteditable="true">${titleEl?.text || ''}</div>
      </div>
      <div style="position:absolute;top:${px(72)};bottom:0;left:0;right:0;display:flex;gap:${px(2)}">
        <div style="flex:1;padding:${px(24)} ${px(28)};overflow:hidden">
          <div class="slide-el" data-id="${bodyEls[0]?.id}" style="font-size:${px(15)};color:${t.bodyColor};line-height:1.8;white-space:pre-wrap;outline:none" contenteditable="true">${bodyEls[0]?.text || ''}</div>
        </div>
        <div style="width:1px;background:${t.accent}22;flex-shrink:0"></div>
        <div style="flex:1;padding:${px(24)} ${px(28)};overflow:hidden">
          <div class="slide-el" data-id="${bodyEls[1]?.id}" style="font-size:${px(15)};color:${t.bodyColor};line-height:1.8;white-space:pre-wrap;outline:none" contenteditable="true">${bodyEls[1]?.text || ''}</div>
        </div>
      </div>
    </div>`
  }

  if (slide.layout === 'closing') {
    const titleEl = slide.elements.find(e => e.type === 'title')
    const subtitleEl = slide.elements.find(e => e.type === 'subtitle')
    return `<div style="${base}">
      <div style="position:absolute;left:${px(350)};top:${px(56)};right:${px(350)};height:${px(4)};background:${t.accent}"></div>
      <div style="position:absolute;left:${px(350)};bottom:${px(56)};right:${px(350)};height:${px(4)};background:${t.accent}"></div>
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${px(16)}">
        <div class="slide-el" data-id="${titleEl?.id}" style="font-size:${px(44)};font-weight:700;color:${t.titleColor};text-align:center;outline:none" contenteditable="true">${titleEl?.text || ''}</div>
        <div class="slide-el" data-id="${subtitleEl?.id}" style="font-size:${px(18)};color:${t.bodyColor};text-align:center;outline:none" contenteditable="true">${subtitleEl?.text || ''}</div>
      </div>
    </div>`
  }

  // content / bullets / default
  const labelEl = slide.elements.find(e => e.type === 'label')
  const titleEl = slide.elements.find(e => e.type === 'title')
  const bodyEl = slide.elements.find(e => e.type === 'body')
  return `<div style="${base}">
    <div style="position:absolute;left:${px(36)};top:${px(28)};bottom:${px(28)};width:${px(5)};background:${t.accent};border-radius:${px(3)}"></div>
    <div style="position:absolute;top:${px(28)};left:${px(60)};right:${px(36)}">
      <div class="slide-el" data-id="${labelEl?.id}" style="font-size:${px(11)};font-weight:700;letter-spacing:${px(2)};color:${t.labelColor};text-transform:uppercase;outline:none;margin-bottom:${px(6)}" contenteditable="true">${labelEl?.text || ''}</div>
      <div class="slide-el" data-id="${titleEl?.id}" style="font-size:${px(28)};font-weight:700;color:${t.titleColor};outline:none;margin-bottom:${px(16)}" contenteditable="true">${titleEl?.text || ''}</div>
      <div class="slide-el" data-id="${bodyEl?.id}" style="font-size:${px(15)};color:${t.bodyColor};line-height:1.9;white-space:pre-wrap;outline:none" contenteditable="true">${bodyEl?.text || ''}</div>
    </div>
  </div>`
}

// ═══════════════════════════════════════
//  缩略图组件
// ═══════════════════════════════════════

function SlideThumbnail({ slide, theme, index, selected, onClick, onDelete }: {
  slide: Slide; theme: SlideTheme; index: number
  selected: boolean; onClick: () => void; onDelete: () => void
}) {
  const html = renderSlideHtml(slide, theme, 0.18)
  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        cursor: 'pointer',
        borderRadius: 6,
        border: selected ? `2px solid #7c3aed` : '2px solid transparent',
        overflow: 'hidden',
        background: '#1a1a1a',
        flexShrink: 0,
      }}
    >
      <div style={{ fontSize: 10, color: '#888', padding: '2px 6px' }}>{index + 1}</div>
      <div
        style={{ width: 162, height: 91, overflow: 'hidden', pointerEvents: 'none' }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {selected && (
        <button
          onClick={e => { e.stopPropagation(); onDelete() }}
          title="删除此页"
          style={{
            position: 'absolute', top: 2, right: 2,
            width: 18, height: 18, borderRadius: '50%',
            background: '#ef4444', border: 'none', color: '#fff',
            fontSize: 11, cursor: 'pointer', lineHeight: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >×</button>
      )}
    </div>
  )
}

// ═══════════════════════════════════════
//  主编辑器组件
// ═══════════════════════════════════════

export default function SlidesEditorPanel() {
  const [deck, setDeck] = useState<SlidesDeck>(createDefaultDeck)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [config, setConfig] = useState<AIClientConfig | null>(null)
  const [showConfig, setShowConfig] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [themeIdx, setThemeIdx] = useState(0)
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = loadChatConfig()
    setConfig(saved)
    if (!saved) setShowConfig(true)
  }, [])

  const currentSlide = deck.slides[Math.min(currentIdx, deck.slides.length - 1)]

  // 更新当前幻灯片的元素文字（从 contenteditable 读取）
  const syncEdits = useCallback(() => {
    if (!canvasRef.current) return
    const els = canvasRef.current.querySelectorAll('.slide-el')
    if (!els.length) return
    setDeck(prev => {
      const slides = [...prev.slides]
      const slideIdx = Math.min(currentIdx, slides.length - 1)
      const slide = { ...slides[slideIdx], elements: [...slides[slideIdx].elements] }
      els.forEach(el => {
        const id = (el as HTMLElement).dataset.id
        const elIdx = slide.elements.findIndex(e => e.id === id)
        if (elIdx >= 0) {
          slide.elements = [...slide.elements]
          slide.elements[elIdx] = { ...slide.elements[elIdx], text: (el as HTMLElement).innerText }
        }
      })
      slides[slideIdx] = slide
      return { ...prev, slides }
    })
  }, [currentIdx])

  // 切换幻灯片前先同步当前页编辑内容
  const switchSlide = useCallback((idx: number) => {
    syncEdits()
    setCurrentIdx(idx)
  }, [syncEdits])

  // AI 生成
  const handleGenerate = useCallback(async () => {
    if (!config || !prompt.trim()) return
    setGenerating(true)
    const res = await generateSlidesDeck(config, prompt.trim(), themeIdx)
    if (res.success && res.deck) {
      setDeck({ ...res.deck, theme: SLIDE_THEMES[themeIdx] })
      setCurrentIdx(0)
    } else {
      alert(res.error || '生成失败，请重试')
    }
    setGenerating(false)
  }, [config, prompt, themeIdx])

  // 导出 PPTX
  const handleExport = useCallback(async () => {
    syncEdits()
    setExporting(true)
    try {
      await exportToPptx(deck)
    } catch (e) {
      alert('导出失败：' + String(e))
    }
    setExporting(false)
  }, [deck, syncEdits])

  // 添加幻灯片
  const addSlide = (layout: SlideLayout) => {
    syncEdits()
    const newSlide = createEmptySlide(layout)
    setDeck(prev => {
      const slides = [...prev.slides]
      slides.splice(currentIdx + 1, 0, newSlide)
      return { ...prev, slides }
    })
    setCurrentIdx(currentIdx + 1)
  }

  // 删除幻灯片
  const deleteSlide = (idx: number) => {
    if (deck.slides.length <= 1) return
    setDeck(prev => {
      const slides = prev.slides.filter((_, i) => i !== idx)
      return { ...prev, slides }
    })
    setCurrentIdx(Math.max(0, idx - 1))
  }

  // 切换主题
  const applyTheme = (idx: number) => {
    setThemeIdx(idx)
    setDeck(prev => ({ ...prev, theme: SLIDE_THEMES[idx] }))
  }

  const slideHtml = currentSlide ? renderSlideHtml(currentSlide, deck.theme) : ''

  const sidebarBg = '#111'
  const panelBg = '#1e1e1e'
  const border = '#2a2a2a'
  const textMuted = '#888'
  const accent = '#7c3aed'

  return (
    <div style={{ display: 'flex', height: '100%', background: '#0d0d0d', color: '#e5e5e5', fontFamily: 'system-ui,sans-serif' }}>

      {/* ── 左栏：幻灯片列表 ── */}
      <div style={{ width: 190, background: sidebarBg, borderRight: `1px solid ${border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '10px 10px 6px', borderBottom: `1px solid ${border}`, fontSize: 11, color: textMuted, fontWeight: 600, letterSpacing: 1 }}>
          幻灯片 ({deck.slides.length})
        </div>

        {/* 缩略图列表 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {deck.slides.map((slide, i) => (
            <SlideThumbnail
              key={slide.id}
              slide={slide}
              theme={deck.theme}
              index={i}
              selected={i === currentIdx}
              onClick={() => switchSlide(i)}
              onDelete={() => deleteSlide(i)}
            />
          ))}
        </div>

        {/* 添加幻灯片 */}
        <div style={{ padding: '8px 10px', borderTop: `1px solid ${border}` }}>
          <div style={{ fontSize: 10, color: textMuted, marginBottom: 6 }}>添加幻灯片</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {([
              { layout: 'content' as SlideLayout, label: '正文' },
              { layout: 'bullets' as SlideLayout, label: '要点' },
              { layout: 'two-column' as SlideLayout, label: '双栏' },
              { layout: 'quote' as SlideLayout, label: '引言' },
              { layout: 'title' as SlideLayout, label: '封面' },
              { layout: 'closing' as SlideLayout, label: '结尾' },
            ]).map(({ layout, label }) => (
              <button
                key={layout}
                onClick={() => addSlide(layout)}
                style={{
                  padding: '3px 7px', fontSize: 10, cursor: 'pointer',
                  background: '#2a2a2a', border: `1px solid ${border}`,
                  borderRadius: 4, color: '#ccc',
                }}
              >{label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 中间：画布编辑区 ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* 工具栏 */}
        <div style={{ height: 44, background: panelBg, borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10, flexShrink: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#ddd', marginRight: 8 }}>🎞 幻灯片编辑器</span>
          <div style={{ flex: 1 }} />
          <button
            onClick={() => setShowConfig(true)}
            style={{ padding: '4px 10px', fontSize: 11, background: '#2a2a2a', border: `1px solid ${border}`, borderRadius: 5, color: '#aaa', cursor: 'pointer' }}
          >⚙️ API</button>
          <button
            onClick={handleExport}
            disabled={exporting}
            style={{
              padding: '5px 14px', fontSize: 12, fontWeight: 600,
              background: exporting ? '#555' : '#059669', border: 'none',
              borderRadius: 5, color: '#fff', cursor: exporting ? 'default' : 'pointer',
            }}
          >{exporting ? '导出中…' : '⬇ 导出 PPTX'}</button>
        </div>

        {/* 幻灯片画布 */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto', padding: 24, background: '#161616' }}>
          {currentSlide ? (
            <div
              ref={canvasRef}
              onBlur={syncEdits}
              style={{
                boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
                borderRadius: 4,
                overflow: 'hidden',
                transform: 'scale(1)',
                transformOrigin: 'center center',
              }}
              dangerouslySetInnerHTML={{ __html: slideHtml }}
            />
          ) : (
            <div style={{ color: textMuted }}>没有幻灯片</div>
          )}
        </div>

        {/* 底部翻页 */}
        <div style={{ height: 36, background: panelBg, borderTop: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexShrink: 0 }}>
          <button onClick={() => switchSlide(Math.max(0, currentIdx - 1))} disabled={currentIdx === 0}
            style={{ background: 'none', border: 'none', color: currentIdx === 0 ? '#444' : '#aaa', cursor: currentIdx === 0 ? 'default' : 'pointer', fontSize: 16 }}>‹</button>
          <span style={{ fontSize: 12, color: textMuted }}>{currentIdx + 1} / {deck.slides.length}</span>
          <button onClick={() => switchSlide(Math.min(deck.slides.length - 1, currentIdx + 1))} disabled={currentIdx === deck.slides.length - 1}
            style={{ background: 'none', border: 'none', color: currentIdx === deck.slides.length - 1 ? '#444' : '#aaa', cursor: currentIdx === deck.slides.length - 1 ? 'default' : 'pointer', fontSize: 16 }}>›</button>
        </div>
      </div>

      {/* ── 右栏：属性面板 ── */}
      <div style={{ width: 260, background: panelBg, borderLeft: `1px solid ${border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* AI 生成区 */}
        <div style={{ padding: '12px 14px', borderBottom: `1px solid ${border}` }}>
          <div style={{ fontSize: 11, color: textMuted, fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>AI 生成</div>

          {/* 预设 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
            {SLIDES_PRESETS.map(p => (
              <button
                key={p.id}
                onClick={() => { setSelectedPreset(p.id); setPrompt(p.examplePrompt) }}
                style={{
                  padding: '3px 8px', fontSize: 10, cursor: 'pointer',
                  background: selectedPreset === p.id ? accent : '#2a2a2a',
                  border: `1px solid ${selectedPreset === p.id ? accent : border}`,
                  borderRadius: 4, color: selectedPreset === p.id ? '#fff' : '#ccc',
                }}
              >{p.icon} {p.name}</button>
            ))}
          </div>

          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="描述你的演示主题，AI 自动生成完整幻灯片…"
            rows={4}
            style={{
              width: '100%', boxSizing: 'border-box', resize: 'none',
              background: '#151515', border: `1px solid ${border}`,
              borderRadius: 5, color: '#ddd', fontSize: 12, padding: '7px 9px',
              fontFamily: 'inherit', outline: 'none',
            }}
          />
          <button
            onClick={handleGenerate}
            disabled={generating || !config || !prompt.trim()}
            style={{
              marginTop: 8, width: '100%', padding: '7px 0', fontSize: 13, fontWeight: 600,
              background: generating || !config || !prompt.trim() ? '#333' : accent,
              border: 'none', borderRadius: 5,
              color: generating || !config || !prompt.trim() ? '#666' : '#fff',
              cursor: generating || !config || !prompt.trim() ? 'default' : 'pointer',
            }}
          >{generating ? '生成中…' : '✨ AI 生成幻灯片'}</button>
          {!config && (
            <div style={{ fontSize: 10, color: '#f59e0b', marginTop: 6 }}>
              ⚠️ 请先配置 API Key
            </div>
          )}
        </div>

        {/* 主题选择 */}
        <div style={{ padding: '12px 14px', borderBottom: `1px solid ${border}` }}>
          <div style={{ fontSize: 11, color: textMuted, fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>配色主题</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {SLIDE_THEMES.map((t, i) => (
              <button
                key={i}
                onClick={() => applyTheme(i)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 10px', borderRadius: 5, cursor: 'pointer',
                  background: themeIdx === i ? '#2a2040' : '#1a1a1a',
                  border: `1px solid ${themeIdx === i ? accent : border}`,
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', gap: 3 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 2, background: t.bg, border: '1px solid #444' }} />
                  <div style={{ width: 12, height: 12, borderRadius: 2, background: t.accent }} />
                  <div style={{ width: 12, height: 12, borderRadius: 2, background: t.titleColor, border: '1px solid #444' }} />
                </div>
                <span style={{ fontSize: 12, color: themeIdx === i ? '#ddd' : '#999' }}>{t.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 当前页布局提示 */}
        <div style={{ padding: '12px 14px', borderBottom: `1px solid ${border}` }}>
          <div style={{ fontSize: 11, color: textMuted, fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>当前页</div>
          <div style={{ fontSize: 12, color: '#aaa' }}>
            布局：<span style={{ color: accent }}>{currentSlide?.layout || '-'}</span>
          </div>
          <div style={{ fontSize: 11, color: textMuted, marginTop: 6 }}>
            💡 点击幻灯片中的文字可直接编辑
          </div>
        </div>

        {/* 使用提示 */}
        <div style={{ padding: '12px 14px', flex: 1 }}>
          <div style={{ fontSize: 11, color: textMuted, fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>使用说明</div>
          <div style={{ fontSize: 11, color: '#666', lineHeight: 1.8 }}>
            1. 选择预设或输入主题<br />
            2. 点击「AI 生成幻灯片」<br />
            3. 点击文字直接修改内容<br />
            4. 左栏管理幻灯片顺序<br />
            5. 点击「导出 PPTX」下载
          </div>
        </div>
      </div>

      {/* API 配置弹窗 */}
      {showConfig && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }}>
          <div style={{ background: '#1e1e1e', borderRadius: 10, padding: 24, width: 420, border: `1px solid ${border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontWeight: 600 }}>API 配置</span>
              <button onClick={() => setShowConfig(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
            <APIConfigForm
              title="配置 AI 服务"
              description="幻灯片生成需要 AI 大模型。推荐使用通义千问或 DeepSeek。"
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

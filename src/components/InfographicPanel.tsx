// 信息图面板 — 选模板 → 编辑数据 → 预览 → 导出PNG

import { useState, useMemo, useCallback, useRef, type CSSProperties } from 'react'
import {
  renderInfographic,
  getInfographicTemplates,
  type InfographicData,
  type InfographicType,
  type FlowData,
  type ComparisonData,
  type CardData,
  type TimelineData,
} from '../lib/render/infographic'
import type { StyleComboV2 } from '../lib/atoms'

interface InfographicPanelProps {
  style: StyleComboV2
}

export default function InfographicPanel({ style }: InfographicPanelProps) {
  const templates = useMemo(() => getInfographicTemplates(), [])
  const [selectedType, setSelectedType] = useState<InfographicType>('flow')
  const [dataMap, setDataMap] = useState<Record<InfographicType, InfographicData>>(() => {
    const map: any = {}
    for (const t of getInfographicTemplates()) {
      map[t.type] = JSON.parse(JSON.stringify(t.sampleData))
    }
    return map
  })
  const [exporting, setExporting] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  const currentData = dataMap[selectedType]
  const selectedTemplate = templates.find((t) => t.type === selectedType)

  const updateData = useCallback((newData: InfographicData) => {
    setDataMap(prev => ({ ...prev, [selectedType]: newData }))
  }, [selectedType])

  // 预览HTML
  const previewHtml = useMemo(() => {
    return renderInfographic({ data: currentData, style, width: 375 })
  }, [currentData, style])

  // 导出PNG
  const handleExport = async () => {
    setExporting(true)
    try {
      // 渲染高清版本 (1080px宽)
      const hiResHtml = renderInfographic({ data: currentData, style, width: 1080 })

      const container = document.createElement('div')
      container.innerHTML = hiResHtml
      container.style.position = 'fixed'
      container.style.left = '-99999px'
      container.style.top = '0'
      container.style.zIndex = '-9999'
      document.body.appendChild(container)

      const target = container.firstElementChild as HTMLElement

      // 动态导入 html2canvas
      const { default: html2canvas } = await import('html2canvas')

      const canvas = await html2canvas(target, {
        width: 1080,
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: null,
        logging: false,
      })

      document.body.removeChild(container)

      canvas.toBlob((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `yuntype-infographic-${selectedType}-${Date.now()}.png`
        a.click()
        URL.revokeObjectURL(url)
      }, 'image/png', 1.0)
    } catch (e) {
      alert('导出信息图失败: ' + (e instanceof Error ? e.message : '未知错误'))
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="infographic-workbench">
      <div className="infographic-toolbar">
        <div className="infographic-title">
          <strong>信息图生成</strong>
          <span>{selectedTemplate?.name} · {selectedTemplate?.description}</span>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="infographic-export-btn"
        >
          {exporting ? '导出中...' : '导出 PNG'}
        </button>
      </div>

      <div className="infographic-main">
        <aside className="infographic-control-panel">
          <section className="infographic-section">
            <div className="infographic-section-title">
              <strong>模板</strong>
              <span>{templates.length} 种结构</span>
            </div>
            <div className="infographic-template-grid">
              {templates.map((t) => (
                <button
                  key={t.type}
                  onClick={() => setSelectedType(t.type)}
                  className={`infographic-template-card ${selectedType === t.type ? 'is-active' : ''}`}
                >
                  <TemplateThumb type={t.type} />
                  <span>{t.icon} {t.name}</span>
                  <small>{t.description}</small>
                </button>
              ))}
            </div>
          </section>

          <section className="infographic-section infographic-editor-section">
            <div className="infographic-section-title">
              <strong>数据</strong>
              <span>{getDataCount(currentData)}</span>
            </div>
            {currentData.type === 'flow' && (
              <FlowEditor data={currentData} onChange={updateData} />
            )}
            {currentData.type === 'comparison' && (
              <ComparisonEditor data={currentData} onChange={updateData} />
            )}
            {currentData.type === 'card' && (
              <CardEditor data={currentData} onChange={updateData} />
            )}
            {currentData.type === 'timeline' && (
              <TimelineEditor data={currentData} onChange={updateData} />
            )}
          </section>
        </aside>

        <section className="infographic-preview-area">
          <div className="infographic-preview-head">
            <div>
              <strong>预览</strong>
              <span>375px 编辑预览，导出为 1080px 高清图</span>
            </div>
          </div>
          <div ref={previewRef} className="infographic-preview-card">
            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>
        </section>
      </div>
    </div>
  )
}

function getDataCount(data: InfographicData): string {
  switch (data.type) {
    case 'flow':
      return `${data.steps.length} 个步骤`
    case 'comparison':
      return `${data.columns.length} 列 · ${data.columns[0]?.items.length ?? 0} 行`
    case 'card':
      return `${data.points.length} 个要点`
    case 'timeline':
      return `${data.events.length} 个事件`
  }
}

function TemplateThumb({ type }: { type: InfographicType }) {
  if (type === 'flow') {
    return (
      <svg viewBox="0 0 120 72" aria-hidden="true">
        <rect x="8" y="25" width="24" height="22" rx="7" />
        <rect x="48" y="25" width="24" height="22" rx="7" />
        <rect x="88" y="25" width="24" height="22" rx="7" />
        <path d="M35 36H45M75 36H85" />
      </svg>
    )
  }
  if (type === 'comparison') {
    return (
      <svg viewBox="0 0 120 72" aria-hidden="true">
        <rect x="14" y="12" width="42" height="48" rx="8" />
        <rect x="64" y="12" width="42" height="48" rx="8" />
        <path d="M24 29H46M24 39H44M74 29H96M74 39H91" />
      </svg>
    )
  }
  if (type === 'card') {
    return (
      <svg viewBox="0 0 120 72" aria-hidden="true">
        <rect x="20" y="12" width="80" height="48" rx="10" />
        <circle cx="38" cy="31" r="8" />
        <path d="M54 27H86M54 37H80M32 47H88" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 120 72" aria-hidden="true">
      <path d="M60 11V61" />
      <circle cx="60" cy="20" r="6" />
      <circle cx="60" cy="36" r="6" />
      <circle cx="60" cy="52" r="6" />
      <path d="M68 20H96M24 36H52M68 52H92" />
    </svg>
  )
}

// ═══════════════════════════════════════
//  通用输入样式
// ═══════════════════════════════════════

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '7px 10px',
  fontSize: '12px',
  border: '1px solid var(--border-color)',
  borderRadius: '6px',
  outline: 'none',
  boxSizing: 'border-box',
  color: 'var(--text-primary)',
  background: 'var(--bg-card)',
  transition: 'border-color 0.15s',
}

const labelStyle: CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  color: 'var(--text-muted)',
  marginBottom: '4px',
  display: 'block',
}

const addBtnStyle: CSSProperties = {
  width: '100%',
  padding: '7px',
  fontSize: '12px',
  color: 'var(--accent)',
  background: 'var(--accent-soft)',
  border: '1px dashed var(--accent)',
  borderRadius: '6px',
  cursor: 'pointer',
  marginTop: '4px',
}

const removeBtnStyle: CSSProperties = {
  padding: '2px 6px',
  fontSize: '11px',
  color: '#E53E3E',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  flexShrink: 0,
}

// ═══════════════════════════════════════
//  流程图编辑器
// ═══════════════════════════════════════

function FlowEditor({ data, onChange }: { data: FlowData; onChange: (d: InfographicData) => void }) {
  const updateTitle = (title: string) => onChange({ ...data, title })
  const updateStep = (i: number, val: string) => {
    const steps = [...data.steps]
    steps[i] = val
    onChange({ ...data, steps })
  }
  const addStep = () => onChange({ ...data, steps: [...data.steps, `步骤${data.steps.length + 1}`] })
  const removeStep = (i: number) => {
    if (data.steps.length <= 2) return
    onChange({ ...data, steps: data.steps.filter((_, j) => j !== i) })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div>
        <label style={labelStyle}>标题</label>
        <input
          style={inputStyle}
          value={data.title || ''}
          onChange={(e) => updateTitle(e.target.value)}
          placeholder="流程图标题"
        />
      </div>
      <div>
        <label style={labelStyle}>步骤 ({data.steps.length})</label>
        {data.steps.map((step, i) => (
          <div key={i} style={{ display: 'flex', gap: '4px', marginBottom: '4px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', width: '20px', flexShrink: 0 }}>{i + 1}.</span>
            <input
              style={{ ...inputStyle, flex: 1 }}
              value={step}
              onChange={(e) => updateStep(i, e.target.value)}
            />
            <button style={removeBtnStyle} onClick={() => removeStep(i)} title="删除">✕</button>
          </div>
        ))}
        <button style={addBtnStyle} onClick={addStep}>+ 添加步骤</button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════
//  对比表编辑器
// ═══════════════════════════════════════

function ComparisonEditor({ data, onChange }: { data: ComparisonData; onChange: (d: InfographicData) => void }) {
  const updateTitle = (title: string) => onChange({ ...data, title })
  const updateColTitle = (ci: number, title: string) => {
    const columns = data.columns.map((col, i) => i === ci ? { ...col, title } : col)
    onChange({ ...data, columns })
  }
  const updateItem = (ci: number, ri: number, val: string) => {
    const columns = data.columns.map((col, i) => {
      if (i !== ci) return col
      const items = [...col.items]
      items[ri] = val
      return { ...col, items }
    })
    onChange({ ...data, columns })
  }
  const addRow = () => {
    const columns = data.columns.map(col => ({
      ...col,
      items: [...col.items, ''],
    }))
    onChange({ ...data, columns })
  }
  const removeRow = (ri: number) => {
    if (data.columns[0].items.length <= 1) return
    const columns = data.columns.map(col => ({
      ...col,
      items: col.items.filter((_, j) => j !== ri),
    }))
    onChange({ ...data, columns })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div>
        <label style={labelStyle}>标题</label>
        <input
          style={inputStyle}
          value={data.title || ''}
          onChange={(e) => updateTitle(e.target.value)}
          placeholder="对比表标题"
        />
      </div>
      {data.columns.map((col, ci) => (
        <div key={ci}>
          <label style={labelStyle}>列{ci + 1} 标题</label>
          <input
            style={{ ...inputStyle, marginBottom: '6px' }}
            value={col.title}
            onChange={(e) => updateColTitle(ci, e.target.value)}
          />
          {col.items.map((item, ri) => (
            <div key={ri} style={{ display: 'flex', gap: '4px', marginBottom: '4px', alignItems: 'center' }}>
              <input
                style={{ ...inputStyle, flex: 1 }}
                value={item}
                onChange={(e) => updateItem(ci, ri, e.target.value)}
                placeholder={`第${ri + 1}项`}
              />
              {ci === 0 && (
                <button style={removeBtnStyle} onClick={() => removeRow(ri)} title="删除行">✕</button>
              )}
            </div>
          ))}
        </div>
      ))}
      <button style={addBtnStyle} onClick={addRow}>+ 添加行</button>
    </div>
  )
}

// ═══════════════════════════════════════
//  知识卡片编辑器
// ═══════════════════════════════════════

function CardEditor({ data, onChange }: { data: CardData; onChange: (d: InfographicData) => void }) {
  const updateTitle = (title: string) => onChange({ ...data, title })
  const updateIcon = (icon: string) => onChange({ ...data, icon })
  const updatePoint = (i: number, val: string) => {
    const points = [...data.points]
    points[i] = val
    onChange({ ...data, points })
  }
  const addPoint = () => onChange({ ...data, points: [...data.points, ''] })
  const removePoint = (i: number) => {
    if (data.points.length <= 1) return
    onChange({ ...data, points: data.points.filter((_, j) => j !== i) })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>标题</label>
          <input
            style={inputStyle}
            value={data.title}
            onChange={(e) => updateTitle(e.target.value)}
            placeholder="卡片标题"
          />
        </div>
        <div style={{ width: '60px' }}>
          <label style={labelStyle}>图标</label>
          <input
            style={inputStyle}
            value={data.icon || ''}
            onChange={(e) => updateIcon(e.target.value)}
            placeholder="💡"
          />
        </div>
      </div>
      <div>
        <label style={labelStyle}>要点 ({data.points.length})</label>
        {data.points.map((point, i) => (
          <div key={i} style={{ display: 'flex', gap: '4px', marginBottom: '4px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', width: '20px', flexShrink: 0 }}>{i + 1}.</span>
            <input
              style={{ ...inputStyle, flex: 1 }}
              value={point}
              onChange={(e) => updatePoint(i, e.target.value)}
            />
            <button style={removeBtnStyle} onClick={() => removePoint(i)} title="删除">✕</button>
          </div>
        ))}
        <button style={addBtnStyle} onClick={addPoint}>+ 添加要点</button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════
//  时间线编辑器
// ═══════════════════════════════════════

function TimelineEditor({ data, onChange }: { data: TimelineData; onChange: (d: InfographicData) => void }) {
  const updateTitle = (title: string) => onChange({ ...data, title })
  const updateEvent = (i: number, field: 'time' | 'content', val: string) => {
    const events = data.events.map((e, j) => j === i ? { ...e, [field]: val } : e)
    onChange({ ...data, events })
  }
  const addEvent = () => onChange({
    ...data,
    events: [...data.events, { time: '', content: '' }],
  })
  const removeEvent = (i: number) => {
    if (data.events.length <= 2) return
    onChange({ ...data, events: data.events.filter((_, j) => j !== i) })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div>
        <label style={labelStyle}>标题</label>
        <input
          style={inputStyle}
          value={data.title || ''}
          onChange={(e) => updateTitle(e.target.value)}
          placeholder="时间线标题"
        />
      </div>
      <div>
        <label style={labelStyle}>事件 ({data.events.length})</label>
        {data.events.map((evt, i) => (
          <div key={i} style={{
            display: 'flex',
            gap: '4px',
            marginBottom: '6px',
            alignItems: 'flex-start',
            padding: '6px',
            background: i % 2 === 0 ? '#FAFAFA' : '#fff',
            borderRadius: '6px',
          }}>
            <input
              style={{ ...inputStyle, width: '80px', flexShrink: 0 }}
              value={evt.time}
              onChange={(e) => updateEvent(i, 'time', e.target.value)}
              placeholder="时间"
            />
            <input
              style={{ ...inputStyle, flex: 1 }}
              value={evt.content}
              onChange={(e) => updateEvent(i, 'content', e.target.value)}
              placeholder="事件内容"
            />
            <button style={removeBtnStyle} onClick={() => removeEvent(i)} title="删除">✕</button>
          </div>
        ))}
        <button style={addBtnStyle} onClick={addEvent}>+ 添加事件</button>
      </div>
    </div>
  )
}

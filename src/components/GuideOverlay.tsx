// 新手引导遮罩 — 首次访问时显示 4 步引导

import { useState } from 'react'
import { isGuideDone, markGuideDone } from '../lib/storage'

const activeColor = '#4F46E5'

interface GuideStep {
  icon: string
  title: string
  desc: string
}

const steps: GuideStep[] = [
  { icon: '📝', title: '粘贴文章', desc: '在左侧输入框粘贴你的 Markdown 文章，支持标题、列表、引用等格式。' },
  { icon: '🎨', title: '选择风格', desc: '在中间面板选择预设风格，或手动调整配色、排版、装饰、字体四个维度。' },
  { icon: '👀', title: '实时预览', desc: '右侧实时显示排版效果。支持公众号、小红书图片组、信息图三种模式。' },
  { icon: '📋', title: '一键导出', desc: '复制富文本粘贴到微信公众号，或导出PNG图片用于小红书发帖。' },
]

export default function GuideOverlay() {
  const [visible, setVisible] = useState(() => !isGuideDone())
  const [step, setStep] = useState(0)

  if (!visible) return null

  const handleClose = () => {
    markGuideDone()
    setVisible(false)
  }

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      handleClose()
    }
  }

  const current = steps[step]

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 99999,
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        width: '420px',
        background: '#fff',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
      }}>
        {/* 头部渐变区 */}
        <div style={{
          background: `linear-gradient(135deg, ${activeColor}, #7C3AED)`,
          padding: '32px 32px 24px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>{current.icon}</div>
          <h2 style={{
            fontSize: '22px',
            fontWeight: 800,
            color: '#fff',
            margin: 0,
            letterSpacing: '1px',
          }}>{current.title}</h2>
        </div>

        {/* 内容区 */}
        <div style={{ padding: '24px 32px' }}>
          <p style={{
            fontSize: '15px',
            color: '#555',
            lineHeight: 1.8,
            margin: 0,
            textAlign: 'center',
          }}>{current.desc}</p>
        </div>

        {/* 进度指示器 */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          padding: '0 32px 16px',
        }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              width: i === step ? '24px' : '8px',
              height: '8px',
              borderRadius: '4px',
              background: i === step ? activeColor : '#E0E0E0',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>

        {/* 按钮区 */}
        <div style={{
          display: 'flex',
          gap: '10px',
          padding: '16px 32px 28px',
        }}>
          <button
            onClick={handleClose}
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '14px',
              fontWeight: 500,
              background: '#f5f5f5',
              color: '#888',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
            }}
          >
            跳过
          </button>
          <button
            onClick={handleNext}
            style={{
              flex: 2,
              padding: '12px',
              fontSize: '14px',
              fontWeight: 700,
              background: activeColor,
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
            }}
          >
            {step < steps.length - 1 ? '下一步 →' : '🚀 开始使用'}
          </button>
        </div>
      </div>
    </div>
  )
}

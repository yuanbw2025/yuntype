// 建站教程 — GitHub + Vercel 部署指南

import { useState } from 'react'

const steps = [
  {
    title: '注册 GitHub 账号',
    desc: '访问 github.com，点击 Sign up 注册。已有账号可跳过。',
    tip: '推荐用常用邮箱注册，后续接收部署通知。',
  },
  {
    title: '创建新仓库',
    desc: '登录后点击右上角 "+" → "New repository"，填写仓库名（如 my-website），勾选 "Add a README"，点击 Create。',
    tip: '仓库名会成为网址的一部分，建议用英文小写。',
  },
  {
    title: '上传你的 HTML 文件',
    desc: '进入仓库页面，点击 "Add file" → "Upload files"，把刚才下载的 .html 文件拖进去。文件名改为 index.html，点击 "Commit changes"。',
    tip: '文件名必须是 index.html，这是网站的入口文件。',
  },
  {
    title: '注册 Vercel 并导入仓库',
    desc: '访问 vercel.com，用 GitHub 账号直接登录。点击 "Add New Project"，在列表中找到刚才的仓库，点击 "Import"。',
    tip: 'Vercel 免费版完全够用，不需要付费。',
  },
  {
    title: '部署上线',
    desc: 'Import 后 Vercel 会自动部署，等待十几秒即可完成。部署成功后会给你一个 .vercel.app 的网址，打开就是你的网站。',
    tip: '之后每次更新 GitHub 仓库的文件，Vercel 会自动重新部署。',
  },
]

interface DeployGuideProps {
  visible: boolean
  onClose: () => void
}

export default function DeployGuide({ visible, onClose }: DeployGuideProps) {
  const [expanded, setExpanded] = useState<number | null>(null)

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div
        style={{
          width: '520px', maxHeight: '80vh',
          background: '#fff', borderRadius: '12px',
          overflow: 'hidden', display: 'flex', flexDirection: 'column',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#333' }}>
              如何把网页部署上线
            </div>
            <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
              GitHub + Vercel，免费搭建你的个人网站
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', fontSize: '20px',
              color: '#999', cursor: 'pointer', padding: '4px',
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: '16px 24px 24px', overflowY: 'auto', flex: 1 }}>
          {steps.map((step, i) => (
            <div
              key={i}
              style={{
                marginBottom: '8px',
                border: '1px solid #e8e8e8',
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            >
              <div
                onClick={() => setExpanded(expanded === i ? null : i)}
                style={{
                  padding: '12px 16px',
                  display: 'flex', alignItems: 'center', gap: '12px',
                  cursor: 'pointer',
                  background: expanded === i ? '#f8f9fa' : '#fff',
                  transition: 'background 0.2s',
                }}
              >
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: '#4F46E5', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 700, flexShrink: 0,
                }}>
                  {i + 1}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#333', flex: 1 }}>
                  {step.title}
                </div>
                <span style={{ fontSize: '12px', color: '#999', transition: 'transform 0.2s', transform: expanded === i ? 'rotate(180deg)' : 'none' }}>
                  ▼
                </span>
              </div>
              {expanded === i && (
                <div style={{ padding: '0 16px 16px 52px' }}>
                  <div style={{ fontSize: '13px', color: '#555', lineHeight: 1.7 }}>
                    {step.desc}
                  </div>
                  <div style={{
                    marginTop: '8px', padding: '8px 12px',
                    background: '#ECFDF5', borderRadius: '6px',
                    fontSize: '12px', color: '#059669', lineHeight: 1.5,
                  }}>
                    💡 {step.tip}
                  </div>
                </div>
              )}
            </div>
          ))}

          <div style={{
            marginTop: '16px', padding: '12px 16px',
            background: '#f8f9fa', borderRadius: '8px',
            fontSize: '12px', color: '#666', lineHeight: 1.6,
          }}>
            完成以上步骤后，你的网页就在互联网上了。把 Vercel 给你的网址分享出去，任何人都能访问。后续想修改内容，只需在 GitHub 上更新文件，网站会自动同步更新。
          </div>
        </div>
      </div>
    </div>
  )
}

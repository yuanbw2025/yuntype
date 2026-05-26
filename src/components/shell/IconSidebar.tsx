import type { AppMode } from '../../App'

export type ShellPanel = 'article' | 'media' | 'style' | 'export' | null

interface IconSidebarProps {
  mode: AppMode
  activePanel: ShellPanel
  onToggle: (panel: ShellPanel) => void
}

const PANEL_ITEMS: { id: Exclude<ShellPanel, null>; icon: string; label: string; modes?: AppMode[] }[] = [
  { id: 'article', icon: '📄', label: '文章', modes: ['wechat', 'xiaohongshu'] },
  { id: 'media', icon: '🖼', label: '图片', modes: ['wechat', 'xiaohongshu'] },
  { id: 'style', icon: '🎨', label: '风格', modes: ['wechat', 'xiaohongshu'] },
  { id: 'export', icon: '📤', label: '导出', modes: ['wechat'] },
]

export default function IconSidebar({ mode, activePanel, onToggle }: IconSidebarProps) {
  return (
    <aside className="yt-icon-sidebar" aria-label="工作面板">
      {PANEL_ITEMS.map((item, index) => {
        const visible = !item.modes || item.modes.includes(mode)
        if (!visible) return null
        const active = activePanel === item.id
        return (
          <button
            key={item.id}
            className={`yt-sidebar-btn${active ? ' is-active' : ''}`}
            onClick={() => onToggle(active ? null : item.id)}
            title={item.label}
            style={{ marginTop: index === 2 ? '8px' : undefined }}
          >
            <span>{item.icon}</span>
            <small>{item.label}</small>
          </button>
        )
      })}
    </aside>
  )
}

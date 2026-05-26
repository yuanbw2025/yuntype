import type { AppMode } from '../../App'

export interface ModeMeta {
  key: AppMode
  icon: string
  label: string
  color: string
}

interface AppHeaderProps {
  mode: AppMode
  modes: ModeMeta[]
  darkMode: boolean
  comboName: string
  onModeChange: (mode: AppMode) => void
  onAnalyze: () => void
  onToggleDark: () => void
}

export default function AppHeader({
  mode,
  modes,
  darkMode,
  comboName,
  onModeChange,
  onAnalyze,
  onToggleDark,
}: AppHeaderProps) {
  const isTypesettingMode = mode === 'wechat' || mode === 'xiaohongshu'

  return (
    <header className="yt-app-header">
      <div className="yt-brand">
        <div className="yt-brand-mark">☁</div>
        <div className="yt-brand-text">
          <strong>云中书</strong>
          <span>YunType</span>
        </div>
      </div>

      <nav className="yt-mode-tabs" aria-label="功能模式">
        {modes.map((item) => {
          const active = mode === item.key
          return (
            <button
              key={item.key}
              className={`yt-mode-tab${active ? ' is-active' : ''}`}
              onClick={() => onModeChange(item.key)}
              style={{ ['--mode-color' as string]: item.color }}
            >
              <span>{item.icon}</span>
              {item.label}
              {active && <i />}
            </button>
          )
        })}
      </nav>

      <div className="yt-header-actions">
        {isTypesettingMode && (
          <button className="yt-header-btn yt-ai-btn" onClick={onAnalyze}>
            🤖 AI分析
          </button>
        )}
        <button className="yt-header-btn" onClick={onToggleDark} title="Ctrl+D 切换深色模式">
          {darkMode ? '☀️' : '🌙'}
        </button>
        {isTypesettingMode && <div className="yt-current-style">{comboName}</div>}
      </div>
    </header>
  )
}

import type { ReactNode } from 'react'

interface ShellPanelFrameProps {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
}

export default function ShellPanelFrame({ title, subtitle, action, children }: ShellPanelFrameProps) {
  return (
    <section className="yt-shell-panel">
      <div className="yt-shell-panel-head">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="yt-shell-panel-body">{children}</div>
    </section>
  )
}

import { renderInline } from './markdown'
import type { XhsConfig } from './xiaohongshu'
import type { CoverVariantType } from '../atoms/blueprints'
import type { ColorScheme } from '../atoms/colors'

type Colors = ColorScheme['colors']

export function renderCoverClassic(
  title: string, summary: string, colors: Colors, titleFont: string, bodyFont: string,
  titleSize: number, subtitleSize: number, separator: string, config: XhsConfig
): string {
  const band = 90
  const date = new Date().toLocaleDateString('zh-CN')
  const bg = `<div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 50%,${colors.primary}0D 0%,${colors.pageBg} 70%);"></div>`
  const topBand = `<div style="position:absolute;top:0;left:0;right:0;height:${band}px;background:${colors.primary};display:flex;align-items:center;justify-content:center;"><span style="color:#fff;font-size:${config.fontSize * 0.75}px;letter-spacing:6px;font-weight:600;">YUNTYPE · 云中书</span></div>`
  const mid = `<div style="position:absolute;top:50%;left:${config.padding * 1.5}px;right:${config.padding * 1.5}px;transform:translateY(-50%);text-align:center;">
    <h1 style="font-family:'${titleFont}','${bodyFont}',serif;font-size:${titleSize}px;font-weight:900;color:${colors.text};line-height:1.3;margin:0 0 ${Math.round(config.padding * 0.7)}px;letter-spacing:2px;">${renderInline(title)}</h1>
    <div style="display:flex;align-items:center;justify-content:center;gap:14px;margin:0 auto ${Math.round(config.padding * 0.6)}px;">
      <div style="width:60px;height:1px;background:${colors.primary};"></div><span style="color:${colors.primary};font-size:18px;">◆</span><div style="width:60px;height:1px;background:${colors.primary};"></div>
    </div>
    ${summary ? `<p style="font-size:${subtitleSize}px;color:${colors.textMuted};line-height:1.75;margin:0;padding:0 20px;">${renderInline(summary)}</p>` : ''}
  </div>`
  const bottom = `<div style="position:absolute;bottom:${config.padding}px;left:${config.padding}px;right:${config.padding}px;display:flex;align-items:center;justify-content:space-between;">
    <div style="display:flex;gap:8px;align-items:center;"><div style="width:28px;height:28px;background:${colors.primary};"></div><div style="width:28px;height:28px;background:${colors.secondary};"></div><div style="width:1px;height:28px;background:${colors.textMuted};opacity:0.4;margin:0 6px;"></div><span style="color:${colors.textMuted};font-size:${config.fontSize * 0.6}px;letter-spacing:2px;">${separator}</span></div>
    <span style="color:${colors.textMuted};font-size:${config.fontSize * 0.62}px;letter-spacing:1px;">${date}</span>
  </div>`
  return bg + topBand + mid + bottom
}

export function renderCoverBold(
  title: string, summary: string, colors: Colors, titleFont: string, bodyFont: string,
  titleSize: number, subtitleSize: number, separator: string, config: XhsConfig
): string {
  const leftW = Math.round(config.width / 3)
  const badge = Math.round(config.width * 0.18)
  const leftBlock = `<div style="position:absolute;top:0;left:0;width:${leftW}px;height:100%;background:${colors.primary};padding:${config.padding}px ${Math.round(config.padding * 0.7)}px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;">
    <div style="color:#fff;font-size:${config.fontSize * 0.6}px;letter-spacing:4px;opacity:0.8;margin-bottom:20px;">FEATURED</div>
    <h1 style="font-family:'${titleFont}','${bodyFont}',sans-serif;font-size:${Math.round(titleSize * 0.85)}px;font-weight:900;color:#fff;line-height:1.15;margin:0;letter-spacing:-1px;writing-mode:horizontal-tb;">${renderInline(title)}</h1>
  </div>`
  const rightBlock = `<div style="position:absolute;top:0;left:${leftW}px;right:0;height:100%;background:${colors.contentBg};">
    <div style="position:absolute;top:${Math.round(config.height * 0.25)}px;right:${config.padding}px;font-family:'${titleFont}',serif;font-size:${Math.round(titleSize * 2.2)}px;font-weight:900;color:${colors.primary};opacity:0.12;line-height:0.85;">01</div>
    ${summary ? `<div style="position:absolute;top:50%;left:${config.padding}px;right:${config.padding}px;transform:translateY(-50%);border-left:4px solid ${colors.primary};padding-left:20px;"><p style="font-size:${subtitleSize}px;color:${colors.text};line-height:1.75;margin:0;font-weight:500;">${renderInline(summary)}</p></div>` : ''}
    <div style="position:absolute;bottom:${config.padding}px;left:${config.padding}px;display:flex;gap:10px;">
      <span style="background:${colors.primary};color:#fff;padding:8px 18px;border-radius:24px;font-size:${config.fontSize * 0.6}px;font-weight:600;letter-spacing:1px;">${separator}</span>
      <span style="border:2px solid ${colors.primary};color:${colors.primary};padding:6px 18px;border-radius:24px;font-size:${config.fontSize * 0.6}px;font-weight:600;">云中书</span>
    </div>
  </div>`
  const badgeEl = `<div style="position:absolute;top:${config.padding}px;right:${config.padding}px;width:${badge}px;height:${badge}px;border-radius:50%;background:${colors.accent || colors.secondary};display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px rgba(0,0,0,0.15);"><span style="color:#fff;font-size:${config.fontSize * 0.7}px;font-weight:800;letter-spacing:1px;">NEW</span></div>`
  return leftBlock + rightBlock + badgeEl
}

export function renderCoverMinimal(
  title: string, summary: string, colors: Colors, titleFont: string, bodyFont: string,
  titleSize: number, subtitleSize: number, config: XhsConfig
): string {
  const topY = Math.round(config.height * 0.25)
  const botY = Math.round(config.height * 0.75)
  const line = (y: number) => `<div style="position:absolute;top:${y}px;left:${config.padding}px;right:${config.padding}px;height:1px;background:${colors.textMuted};opacity:0.3;"></div>
    <div style="position:absolute;top:${y - 3}px;left:${config.padding - 3}px;width:7px;height:7px;border-radius:50%;background:${colors.primary};"></div>
    <div style="position:absolute;top:${y - 3}px;right:${config.padding - 3}px;width:7px;height:7px;border-radius:50%;background:${colors.primary};"></div>`
  const mid = `<div style="position:absolute;top:50%;left:20%;right:20%;transform:translateY(-50%);text-align:center;">
    <h1 style="font-family:'${titleFont}','${bodyFont}',sans-serif;font-size:${titleSize}px;font-weight:300;color:${colors.text};line-height:1.5;margin:0;letter-spacing:6px;">${renderInline(title)}</h1>
    ${summary ? `<p style="font-size:${Math.round(subtitleSize * 0.85)}px;color:${colors.primary};line-height:1.9;margin:${Math.round(config.padding * 0.8)}px 0 0;font-weight:300;letter-spacing:2px;">${renderInline(summary)}</p>` : ''}
  </div>`
  const brand = `<div style="position:absolute;bottom:${config.padding}px;left:0;right:0;text-align:center;display:flex;align-items:center;justify-content:center;gap:10px;">
    <div style="width:4px;height:4px;border-radius:50%;background:${colors.primary};"></div>
    <span style="color:${colors.textMuted};font-size:${config.fontSize * 0.55}px;letter-spacing:6px;opacity:0.6;">YUNTYPE</span>
  </div>`
  return line(topY) + line(botY) + mid + brand
}

export function renderCoverCard(
  title: string, summary: string, colors: Colors, titleFont: string, bodyFont: string,
  titleSize: number, subtitleSize: number, _separator: string, config: XhsConfig
): string {
  const cardPad = config.padding * 1.2
  const bg = `<div style="position:absolute;inset:0;background:linear-gradient(135deg,${colors.pageBg} 0%,${colors.primary}1F 100%);"></div>`
  const corners = `<div style="position:absolute;top:${config.padding}px;left:${config.padding}px;width:24px;height:24px;background:${colors.primary};"></div>
    <div style="position:absolute;top:${config.padding}px;right:${config.padding}px;width:24px;height:24px;border-radius:50%;background:${colors.secondary};"></div>
    <div style="position:absolute;bottom:${config.padding}px;left:${config.padding}px;width:0;height:0;border-left:14px solid transparent;border-right:14px solid transparent;border-bottom:24px solid ${colors.accent || colors.primary};"></div>
    <div style="position:absolute;bottom:${config.padding}px;right:${config.padding}px;width:24px;height:24px;background:${colors.primary};transform:rotate(45deg);"></div>`
  const card = `<div style="position:absolute;top:50%;left:${cardPad}px;right:${cardPad}px;transform:translateY(-50%);background:${colors.contentBg};border-radius:28px;padding:${config.padding * 1.4}px;box-shadow:0 20px 60px rgba(0,0,0,0.12);">
    <div style="text-align:center;margin-bottom:24px;"><span style="background:${colors.primary};color:#fff;padding:6px 18px;border-radius:20px;font-size:${config.fontSize * 0.55}px;letter-spacing:3px;font-weight:600;">COVER STORY</span></div>
    <h1 style="font-family:'${titleFont}','${bodyFont}',sans-serif;font-size:${Math.round(titleSize * 0.92)}px;font-weight:800;color:${colors.text};line-height:1.35;margin:0 0 20px;text-align:center;letter-spacing:1px;">${renderInline(title)}</h1>
    <div style="display:flex;justify-content:center;gap:10px;margin:0 0 20px;"><div style="width:6px;height:6px;border-radius:50%;background:${colors.primary};"></div><div style="width:6px;height:6px;border-radius:50%;background:${colors.primary};opacity:0.6;"></div><div style="width:6px;height:6px;border-radius:50%;background:${colors.primary};opacity:0.3;"></div></div>
    ${summary ? `<p style="font-size:${subtitleSize}px;color:${colors.textMuted};line-height:1.75;margin:0 0 24px;text-align:center;padding:0 10px;">${renderInline(summary)}</p>` : ''}
    <div style="text-align:right;color:${colors.primary};font-size:${config.fontSize * 0.9}px;font-weight:700;letter-spacing:2px;">READ →</div>
  </div>`
  return bg + corners + card
}

export function renderCoverMagazine(
  title: string, summary: string, colors: Colors, titleFont: string, bodyFont: string,
  titleSize: number, subtitleSize: number, _separator: string, config: XhsConfig
): string {
  const firstChar = title.charAt(0)
  const date = new Date().toLocaleDateString('zh-CN')
  const top = `<div style="position:absolute;top:${config.padding}px;left:${config.padding}px;right:${config.padding}px;text-align:center;">
    <div style="height:1px;background:${colors.text};opacity:0.6;"></div>
    <div style="padding:10px 0;font-size:${config.fontSize * 0.65}px;letter-spacing:8px;color:${colors.text};font-weight:600;">YUNTYPE MAGAZINE</div>
    <div style="height:1px;background:${colors.text};opacity:0.6;"></div>
  </div>`
  const watermark = `<div style="position:absolute;top:${Math.round(config.height * 0.14)}px;left:0;right:0;text-align:center;font-family:'${titleFont}',serif;font-size:${Math.round(titleSize * 2.5)}px;font-weight:900;color:${colors.primary};opacity:0.15;line-height:1;letter-spacing:-4px;">${firstChar}</div>`
  const midTop = Math.round(config.height * 0.32)
  const mid = `<div style="position:absolute;top:${midTop}px;left:${config.padding}px;right:${config.padding}px;text-align:center;">
    <h1 style="font-family:'${titleFont}','${bodyFont}',serif;font-size:${titleSize}px;font-weight:800;color:${colors.text};line-height:1.25;margin:0 0 ${Math.round(config.padding * 0.8)}px;letter-spacing:1px;">${renderInline(title)}</h1>
    <div style="display:flex;justify-content:center;align-items:center;gap:0;font-size:${config.fontSize * 0.55}px;color:${colors.textMuted};letter-spacing:3px;">
      <span style="padding:0 18px;">主题</span><span style="width:1px;height:16px;background:${colors.textMuted};opacity:0.5;"></span>
      <span style="padding:0 18px;">${date}</span><span style="width:1px;height:16px;background:${colors.textMuted};opacity:0.5;"></span>
      <span style="padding:0 18px;">No.01</span>
    </div>
  </div>`
  const quote = summary ? `<div style="position:absolute;top:${Math.round(config.height * 0.62)}px;left:${config.padding * 1.5}px;right:${config.padding * 1.5}px;text-align:center;">
    <span style="font-family:'${titleFont}',serif;font-size:${Math.round(titleSize * 1.6)}px;color:${colors.primary};line-height:0.5;opacity:0.6;">"</span>
    <p style="font-size:${subtitleSize}px;color:${colors.text};line-height:1.75;margin:10px 30px;font-style:italic;">${renderInline(summary)}</p>
    <span style="font-family:'${titleFont}',serif;font-size:${Math.round(titleSize * 1.6)}px;color:${colors.primary};line-height:0.5;opacity:0.6;">"</span>
  </div>` : ''
  const bottom = `<div style="position:absolute;bottom:${config.padding}px;left:${config.padding}px;right:${config.padding}px;">
    <div style="height:2px;background:${colors.text};opacity:0.8;"></div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;">
      <span style="color:${colors.textMuted};font-size:${config.fontSize * 0.6}px;letter-spacing:2px;">云中书 YUNTYPE</span>
      <div style="display:flex;gap:6px;"><div style="width:5px;height:5px;border-radius:50%;background:${colors.primary};"></div><div style="width:5px;height:5px;border-radius:50%;background:${colors.primary};"></div><div style="width:5px;height:5px;border-radius:50%;background:${colors.primary};"></div></div>
      <span style="color:${colors.primary};font-size:${config.fontSize * 0.7}px;font-weight:700;letter-spacing:2px;">No.01</span>
    </div>
  </div>`
  return top + watermark + mid + quote + bottom
}

export const COVER_SEPARATORS: Record<CoverVariantType, string> = {
  classic: '· · · · ·',
  bold: '■ ■ ■ ■ ■',
  minimal: '',
  card: '◇ ◇ ◇',
  magazine: '──────',
}

// 小红书图片导出 — HTML→PNG + ZIP打包
// 支持 V1 (StyleCombo) + V2 (StyleComboV2) 双模式

import type { XhsPage, XhsConfig } from '../render/xiaohongshu'
import { renderXhsPageHTML, renderXhsPageV2 } from '../render/xiaohongshu'
import type { StyleCombo, StyleComboV2 } from '../atoms'

/** 根据模式渲染页面 HTML */
function renderPageHTML(
  page: XhsPage,
  style: StyleCombo,
  config: XhsConfig,
  styleV2?: StyleComboV2,
  useV2?: boolean,
): string {
  if (useV2 && styleV2) {
    return renderXhsPageV2(page, styleV2, config)
  }
  return renderXhsPageHTML(page, style, config)
}

/** 将单页 HTML 渲染为 PNG Blob */
async function renderPageToImage(
  pageHtml: string,
  width: number,
  height: number,
): Promise<Blob> {
  // 创建隐藏的渲染容器
  const container = document.createElement('div')
  container.innerHTML = pageHtml
  container.style.position = 'fixed'
  container.style.left = '-99999px'
  container.style.top = '0'
  container.style.zIndex = '-9999'
  document.body.appendChild(container)

  const target = container.firstElementChild as HTMLElement

  try {
    const { default: html2canvas } = await import('html2canvas')
    const canvas = await html2canvas(target, {
      width,
      height,
      scale: 2, // 2倍渲染确保清晰
      useCORS: true,
      allowTaint: false,
      backgroundColor: null,
      logging: false,
    })

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob: Blob | null) => {
          if (blob) resolve(blob)
          else reject(new Error('Canvas toBlob failed'))
        },
        'image/png',
        1.0,
      )
    })
  } finally {
    document.body.removeChild(container)
  }
}

/** 渲染单页并返回 data URL（用于预览） */
export async function renderPageToDataURL(
  page: XhsPage,
  style: StyleCombo,
  config: XhsConfig,
): Promise<string> {
  const html = renderXhsPageHTML(page, style, config)

  const container = document.createElement('div')
  container.innerHTML = html
  container.style.position = 'fixed'
  container.style.left = '-99999px'
  container.style.top = '0'
  container.style.zIndex = '-9999'
  document.body.appendChild(container)

  const target = container.firstElementChild as HTMLElement

  try {
    const { default: html2canvas } = await import('html2canvas')
    const canvas = await html2canvas(target, {
      width: config.width,
      height: config.height,
      scale: 1, // 预览用1倍即可
      useCORS: true,
      allowTaint: false,
      backgroundColor: null,
      logging: false,
    })

    return canvas.toDataURL('image/png')
  } finally {
    document.body.removeChild(container)
  }
}

/** 下载单张图片 */
export async function downloadSinglePage(
  page: XhsPage,
  style: StyleCombo,
  config: XhsConfig,
  filename?: string,
  styleV2?: StyleComboV2,
  useV2?: boolean,
): Promise<void> {
  const html = renderPageHTML(page, style, config, styleV2, useV2)
  const blob = await renderPageToImage(html, config.width, config.height)
  const name = filename || `yuntype-${String(page.pageIndex + 1).padStart(2, '0')}.png`
  downloadBlob(blob, name)
}

/** 打包下载所有页面为 ZIP */
export async function exportAllPagesAsZip(
  pages: XhsPage[],
  style: StyleCombo,
  config: XhsConfig,
  onProgress?: (progress: number) => void,
  styleV2?: StyleComboV2,
  useV2?: boolean,
): Promise<void> {
  const { default: JSZip } = await import('jszip')
  const zip = new JSZip()

  for (let i = 0; i < pages.length; i++) {
    const html = renderPageHTML(pages[i], style, config, styleV2, useV2)
    const blob = await renderPageToImage(html, config.width, config.height)

    const paddedIndex = String(i + 1).padStart(2, '0')
    zip.file(`yuntype-${paddedIndex}.png`, blob)

    onProgress?.((i + 1) / pages.length)
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' })
  downloadBlob(zipBlob, `yuntype-xhs-${Date.now()}.zip`)
}

/** 通用 Blob 下载 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

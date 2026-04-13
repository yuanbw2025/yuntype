// 复制富文本到剪贴板 — 两套方案降级

/** 复制 HTML 富文本到剪贴板 */
export async function copyRichText(html: string): Promise<boolean> {
  // 方法1: Clipboard API（现代浏览器）
  try {
    const blob = new Blob([html], { type: 'text/html' })
    await navigator.clipboard.write([
      new ClipboardItem({ 'text/html': blob }),
    ])
    return true
  } catch {
    // 降级到方法2
  }

  // 方法2: execCommand（兼容性更好）
  try {
    const container = document.createElement('div')
    container.innerHTML = html
    container.style.position = 'fixed'
    container.style.left = '-9999px'
    container.style.top = '-9999px'
    document.body.appendChild(container)

    const range = document.createRange()
    range.selectNodeContents(container)

    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)

    document.execCommand('copy')
    document.body.removeChild(container)
    return true
  } catch {
    return false
  }
}

/** 下载 HTML 文件 */
export function downloadHTML(html: string, filename = 'yuntype-article.html') {
  const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>云中书排版</title>
</head>
<body style="margin: 0; padding: 20px; display: flex; justify-content: center;">
<div style="max-width: 375px; width: 100%;">
${html}
</div>
</body>
</html>`

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  // 延迟清理，确保浏览器有时间处理下载
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 300)
}

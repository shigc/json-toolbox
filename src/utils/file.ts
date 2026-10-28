/** 触发浏览器下载 */
export function downloadText(filename: string, text: string, mime = 'application/json') {
  const blob = new Blob([text], { type: `${mime};charset=utf-8` })
  downloadBlob(filename, blob)
}

export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  // 立刻 revoke 在部分浏览器会中断下载，延后释放
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}

export interface PickedFile {
  name: string
  text: string
  buffer: ArrayBuffer
}

/** 打开文件选择框，读取为文本 + ArrayBuffer */
export function pickFile(accept: string): Promise<PickedFile | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.style.display = 'none'
    document.body.appendChild(input)

    let settled = false
    const cleanup = () => {
      input.remove()
    }
    const finish = (v: PickedFile | null) => {
      if (settled) return
      settled = true
      cleanup()
      resolve(v)
    }

    input.addEventListener('change', async () => {
      const file = input.files?.[0]
      if (!file) return finish(null)
      try {
        const buffer = await file.arrayBuffer()
        const text = new TextDecoder('utf-8').decode(buffer)
        finish({ name: file.name, text, buffer })
      } catch {
        finish(null)
      }
    })
    // 用户取消时不会触发 change，用 focus 兜底回收节点
    window.addEventListener(
      'focus',
      () => setTimeout(() => finish(null), 800),
      { once: true },
    )

    input.click()
  })
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // http / file:// 下 Clipboard API 可能不可用，回退 execCommand
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      ta.remove()
      return ok
    } catch {
      return false
    }
  }
}

export async function readClipboard(): Promise<string | null> {
  try {
    return await navigator.clipboard.readText()
  } catch {
    return null
  }
}

// ---------- Base64（正确处理 UTF-8，不用已废弃的 escape/unescape） ----------

export function toBase64(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

export function fromBase64(b64: string): string {
  const binary = atob(b64.replace(/\s+/g, ''))
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new TextDecoder('utf-8', { fatal: false }).decode(bytes)
}

export function toBase64Url(text: string): string {
  return toBase64(text).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function fromBase64Url(text: string): string {
  const padded = text.replace(/-/g, '+').replace(/_/g, '/')
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4))
  return fromBase64(padded + pad)
}

// ---------- Unicode ----------

/** 转成 \uXXXX 形式（仅转非 ASCII） */
export function toUnicode(text: string): string {
  let out = ''
  for (const ch of text) {
    const cp = ch.codePointAt(0)!
    if (cp < 128) {
      out += ch
    } else if (cp > 0xffff) {
      // 补充平面：拆成代理对
      const high = Math.floor((cp - 0x10000) / 0x400) + 0xd800
      const low = ((cp - 0x10000) % 0x400) + 0xdc00
      out += `\\u${high.toString(16).padStart(4, '0')}\\u${low.toString(16).padStart(4, '0')}`
    } else {
      out += `\\u${cp.toString(16).padStart(4, '0')}`
    }
  }
  return out
}

export function fromUnicode(text: string): string {
  return text
    .replace(/\\u\{([0-9a-fA-F]+)\}/g, (_, h: string) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, h: string) => String.fromCharCode(parseInt(h, 16)))
}

/** 把任意字符转为 HTML 实体（仅转非 ASCII，便于阅读） */
export function toHtmlEntities(text: string): string {
  let out = ''
  for (const ch of text) {
    const cp = ch.codePointAt(0)!
    out += cp < 128 ? ch : `&#${cp};`
  }
  return out
}

export function fromHtmlEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h: string) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
}

// ---------- URL ----------

export function urlEncode(text: string): string {
  return encodeURIComponent(text)
}

export function urlDecode(text: string): string {
  try {
    return decodeURIComponent(text.replace(/\+/g, '%20'))
  } catch {
    return text
  }
}

/** 编码整个 URL，但保留 :/?#[]@!$&'()*+,;= 等结构字符 */
export function urlEncodeKeepStructure(text: string): string {
  return encodeURI(text)
}

// ---------- JSON 字符串转义 ----------

/** 把文本变成可作为 JSON 字符串字面量内容的转义形式（含外层引号） */
export function escapeJsonString(text: string): string {
  return JSON.stringify(text)
}

export function unescapeJsonString(text: string): string {
  const trimmed = text.trim()
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      return JSON.parse(trimmed) as string
    } catch {
      /* 落到下面手工处理 */
    }
  }
  // 兼容裸转义串（不带外层引号）
  return trimmed
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"')
    .replace(/\\\//g, '/')
    .replace(/\\\\/g, '\\')
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, h: string) => String.fromCharCode(parseInt(h, 16)))
}

/** JSON 对象 → GET 查询参数字符串（支持嵌套对象的点号展开） */
export function jsonToQueryString(value: unknown, prefix = ''): string {
  const parts: string[] = []
  const add = (key: string, val: unknown) => {
    if (val === null || val === undefined) {
      parts.push(`${encodeURIComponent(key)}=`)
    } else if (Array.isArray(val)) {
      val.forEach((item, i) => add(`${key}[${i}]`, item))
    } else if (typeof val === 'object') {
      for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
        add(prefix ? `${key}.${k}` : k, v)
      }
    } else {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(val))}`)
    }
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) add(k, v)
  } else {
    add(prefix || 'value', value)
  }
  return parts.join('&')
}

/** GET 查询参数字符串 → JSON 对象 */
export function queryStringToJson(query: string): Record<string, unknown> {
  const clean = query.replace(/^[^?]*\?/, '').replace(/^[#&]/, '')
  const out: Record<string, unknown> = {}
  if (!clean.trim()) return out
  for (const pair of clean.split('&')) {
    if (!pair) continue
    const eq = pair.indexOf('=')
    const rawKey = eq < 0 ? pair : pair.slice(0, eq)
    const rawVal = eq < 0 ? '' : pair.slice(eq + 1)
    const key = urlDecode(rawKey)
    const val = urlDecode(rawVal)
    if (key in out) {
      const prev = out[key]
      if (Array.isArray(prev)) prev.push(val)
      else out[key] = [prev, val]
    } else {
      out[key] = val
    }
  }
  return out
}

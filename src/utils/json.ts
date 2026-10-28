import { t } from '@/i18n'

export interface JsonError {
  message: string
  line: number
  col: number
  /** 字符偏移，-1 表示无法定位 */
  index: number
}

export function lineColOf(text: string, index: number): { line: number; col: number } {
  const upto = text.slice(0, Math.max(0, index))
  const lines = upto.split('\n')
  return { line: lines.length, col: (lines[lines.length - 1]?.length ?? 0) + 1 }
}

/** JSON.parse 的错误信息各引擎不一致，统一抽出「位置」信息 */
export function toJsonError(text: string, err: unknown): JsonError {
  const message = err instanceof Error ? err.message : String(err)
  const mLine = /line (\d+) column (\d+)/i.exec(message)
  if (mLine) {
    return { message, line: Number(mLine[1]), col: Number(mLine[2]), index: -1 }
  }
  const mPos = /position (\d+)/i.exec(message)
  if (mPos) {
    const index = Number(mPos[1])
    const { line, col } = lineColOf(text, index)
    return { message, line, col, index }
  }
  return { message, line: 1, col: 1, index: -1 }
}

export type ParseResult = { ok: true; value: unknown } | { ok: false; error: JsonError }

export function parseJson(text: string): ParseResult {
  if (!text.trim()) {
    return { ok: false, error: { message: t('common.empty'), line: 1, col: 1, index: 0 } }
  }
  try {
    return { ok: true, value: JSON.parse(text) as unknown }
  } catch (err) {
    return { ok: false, error: toJsonError(text, err) }
  }
}

export function formatJson(value: unknown, indent: string): string {
  return JSON.stringify(value, null, indent)
}

export function minifyJson(value: unknown): string {
  return JSON.stringify(value)
}

export function jsonType(value: unknown): string {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  return typeof value
}

export function typeLabel(value: unknown): string {
  const t = jsonType(value)
  if (t === 'array') return `Array(${(value as unknown[]).length})`
  if (t === 'object') return `Object(${Object.keys(value as object).length})`
  return t
}

/** 递归按键名排序；数组保持原顺序。numeric 让 a9 排在 a10 前面 */
export function sortKeysDeep(value: unknown, order: 'asc' | 'desc' = 'asc'): unknown {
  if (Array.isArray(value)) return value.map((v) => sortKeysDeep(v, order))
  if (value && typeof value === 'object') {
    const keys = Object.keys(value as Record<string, unknown>).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }),
    )
    if (order === 'desc') keys.reverse()
    const out: Record<string, unknown> = {}
    for (const key of keys) {
      out[key] = sortKeysDeep((value as Record<string, unknown>)[key], order)
    }
    return out
  }
  return value
}

export interface DropEmptyOptions {
  null?: boolean
  emptyString?: boolean
  emptyContainer?: boolean
}

function isEmptyContainer(v: unknown): boolean {
  if (Array.isArray(v)) return v.length === 0
  if (v && typeof v === 'object') return Object.keys(v as object).length === 0
  return false
}

/** 递归去掉空值。数组内的空值会被压缩掉（不保留占位） */
export function dropEmpty(value: unknown, opts: DropEmptyOptions): unknown {
  const shouldDrop = (v: unknown): boolean => {
    if (opts.null && (v === null || v === undefined)) return true
    if (opts.emptyString && v === '') return true
    if (opts.emptyContainer && isEmptyContainer(v)) return true
    return false
  }
  const walk = (v: unknown): unknown => {
    if (Array.isArray(v)) {
      return v.filter((item) => !shouldDrop(item)).map(walk)
    }
    if (v && typeof v === 'object') {
      const out: Record<string, unknown> = {}
      for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
        if (shouldDrop(val)) continue
        out[k] = walk(val)
      }
      return out
    }
    return v
  }
  return walk(value)
}

export interface FlattenOptions {
  sep?: string
  /** 数组下标用 [i] 还是 sep+i */
  bracket?: boolean
}

export function flatten(value: unknown, opts: FlattenOptions = {}): Record<string, unknown> {
  const sep = opts.sep ?? '.'
  const out: Record<string, unknown> = {}

  const walk = (val: unknown, path: string) => {
    if (Array.isArray(val)) {
      if (!val.length) {
        out[path] = []
        return
      }
      val.forEach((item, i) => {
        const child = opts.bracket
          ? `${path}[${i}]`
          : path
            ? `${path}${sep}${i}`
            : String(i)
        walk(item, child)
      })
      return
    }
    if (val && typeof val === 'object') {
      const entries = Object.entries(val as Record<string, unknown>)
      if (!entries.length) {
        out[path] = {}
        return
      }
      for (const [k, v] of entries) {
        walk(v, path ? `${path}${sep}${k}` : k)
      }
      return
    }
    out[path] = val
  }

  walk(value, '')
  return out
}

/** 支持 a.b[0].c 与 a.b.0.c 两种写法 */
export function tokenizePath(path: string): string[] {
  const tokens: string[] = []
  const re = /([^.[\]]+)|\[(\d+)\]/g
  let m: RegExpExecArray | null
  while ((m = re.exec(path)) !== null) tokens.push(m[1] ?? m[2])
  return tokens
}

export function unflatten(flat: Record<string, unknown>): unknown {
  const root: Record<string, unknown> = {}
  for (const [path, val] of Object.entries(flat)) {
    const tokens = tokenizePath(path)
    if (!tokens.length) continue
    let node: Record<string, unknown> = root
    tokens.forEach((tok, i) => {
      if (i === tokens.length - 1) {
        node[tok] = val
        return
      }
      const nextIsIndex = /^\d+$/.test(tokens[i + 1])
      if (node[tok] === undefined || typeof node[tok] !== 'object' || node[tok] === null) {
        node[tok] = nextIsIndex ? [] : {}
      }
      node = node[tok] as Record<string, unknown>
    })
  }
  return root
}

export function byteSize(text: string): number {
  return new TextEncoder().encode(text).length
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(2)} MB`
}

/** 模板里直接用：省得在 template 中调用 TextEncoder */
export function sizeText(text: string): string {
  return formatBytes(byteSize(text))
}

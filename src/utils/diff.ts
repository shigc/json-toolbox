import { create } from 'jsondiffpatch'
import { t } from '@/i18n'

export type Delta = Record<string, unknown>

const dp = create({
  // 数组元素若带 id/key/_id，按身份匹配而不是按下标，避免插入导致整段重排
  objectHash: (item: object) => {
    const obj = item as Record<string, unknown>
    return (obj?.id ?? obj?.key ?? obj?._id) as string | undefined
  },
  arrays: { detectMove: true, includeValueOnMove: false },
})

export function diffJson(left: unknown, right: unknown): Delta | undefined {
  return dp.diff(left, right) as Delta | undefined
}

export type DiffKind = 'add' | 'remove' | 'modify' | 'move'

export interface DiffEntry {
  path: string
  kind: DiffKind
  left?: unknown
  right?: unknown
  note?: string
}

function joinPath(parent: string, key: string): string {
  return parent ? `${parent}.${key}` : key
}

function readPair(val: unknown[], path: string): DiffEntry | DiffEntry[] | null {
  if (val.length === 1) return { path, kind: 'add', right: val[0] }
  if (val.length === 2) return { path, kind: 'modify', left: val[0], right: val[1] }
  if (val.length === 3) {
    if (val[2] === 0) return { path, kind: 'remove', left: val[0] }
    return {
      path,
      kind: 'move',
      left: val[0],
      note: t('diff.moveTo', { index: String(val[2]) }),
    }
  }
  return null
}

/** 把 jsondiffpatch 的 delta 树摊平成便于渲染的变更列表 */
export function describeDelta(delta: unknown, root = ''): DiffEntry[] {
  if (!delta) return []

  // 整个文档被替换：delta 本身就是一个 [old, new] 对
  if (Array.isArray(delta)) {
    const entry = readPair(delta, root || t('diff.root'))
    if (Array.isArray(entry)) return entry
    return entry ? [entry] : []
  }
  if (typeof delta !== 'object') return []

  const obj = delta as Record<string, unknown>
  const out: DiffEntry[] = []
  const isArrayDelta = obj._t === 'a'

  for (const [key, val] of Object.entries(obj)) {
    if (isArrayDelta && (key === '_t' || key === '_index')) continue
    const path = joinPath(root, key)
    if (Array.isArray(val)) {
      const entry = readPair(val, path)
      if (Array.isArray(entry)) out.push(...entry)
      else if (entry) out.push(entry)
    } else if (val && typeof val === 'object') {
      out.push(...describeDelta(val, path))
    }
  }

  const index = obj._index as Record<string, number> | undefined
  if (index) {
    for (const [newIndex, oldIndex] of Object.entries(index)) {
      out.push({
        path: joinPath(root, newIndex),
        kind: 'move',
        note: t('diff.fromIndex', { index: String(oldIndex) }),
      })
    }
  }

  return out
}

export function formatDiffValue(v: unknown, maxLen = 200): string {
  if (v === undefined) return '—'
  const text = typeof v === 'string' ? JSON.stringify(v) : JSON.stringify(v)
  if (text === undefined) return '—'
  return text.length > maxLen ? `${text.slice(0, maxLen)}…` : text
}

export function diffStats(entries: DiffEntry[]): Record<DiffKind, number> {
  const stats: Record<DiffKind, number> = { add: 0, remove: 0, modify: 0, move: 0 }
  for (const e of entries) stats[e.kind] += 1
  return stats
}

import { t } from '@/i18n'

function parseIniValue(raw: string): unknown {
  if (raw === '') return ''
  if (/^-?\d+$/.test(raw)) return Number(raw)
  if (/^-?\d+\.\d+$/.test(raw)) return Number(raw)
  if (raw === 'true') return true
  if (raw === 'false') return false
  if (raw === 'null') return null
  const isJsonLike =
    (raw.startsWith('{') && raw.endsWith('}')) || (raw.startsWith('[') && raw.endsWith(']'))
  if (isJsonLike) {
    try {
      return JSON.parse(raw) as unknown
    } catch {
      return raw
    }
  }
  if (
    (raw.startsWith('"') && raw.endsWith('"')) ||
    (raw.startsWith("'") && raw.endsWith("'"))
  ) {
    return raw.slice(1, -1)
  }
  return raw
}

export function iniToJson(text: string): Record<string, unknown> {
  const root: Record<string, unknown> = {}
  let current: Record<string, unknown> = root

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#') || line.startsWith(';')) continue

    const section = /^\[(.+)]$/.exec(line)
    if (section) {
      const name = section[1].trim()
      const existing = root[name]
      if (existing && typeof existing === 'object' && !Array.isArray(existing)) {
        current = existing as Record<string, unknown>
      } else {
        current = {}
        root[name] = current
      }
      continue
    }

    const eq = line.indexOf('=')
    if (eq < 0) continue
    const key = line.slice(0, eq).trim()
    if (!key) continue
    current[key] = parseIniValue(line.slice(eq + 1).trim())
  }

  return root
}

function formatIniValue(v: unknown): string {
  if (v === null || v === undefined) return ''
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  if (typeof v === 'string') return /[\n=]/.test(v) ? JSON.stringify(v) : v
  return JSON.stringify(v)
}

export function jsonToIni(value: unknown): string {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(t('formatConvert.iniRootError'))
  }
  const obj = value as Record<string, unknown>
  const scalars: Array<[string, unknown]> = []
  const sections: Array<[string, unknown]> = []

  for (const [k, v] of Object.entries(obj)) {
    if (v !== null && typeof v === 'object') sections.push([k, v])
    else scalars.push([k, v])
  }

  const lines: string[] = []
  for (const [k, v] of scalars) lines.push(`${k} = ${formatIniValue(v)}`)

  sections.forEach(([name, v], i) => {
    if (lines.length && (i > 0 || scalars.length)) lines.push('')
    lines.push(`[${name}]`)
    if (Array.isArray(v)) {
      v.forEach((item, idx) => lines.push(`${idx} = ${formatIniValue(item)}`))
    } else {
      for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
        lines.push(`${k} = ${formatIniValue(val)}`)
      }
    }
  })

  return lines.join('\n')
}

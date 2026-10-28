import Papa from 'papaparse'
import { t } from '@/i18n'

export interface CsvParseResult {
  rows: unknown[]
  errors: string[]
}

/** 单元格里的嵌套结构序列化成 JSON 字符串，避免出现 [object Object] */
function normalizeForCsv(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalizeForCsv)
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = v !== null && typeof v === 'object' ? JSON.stringify(v) : v
    }
    return out
  }
  return value
}

export function csvToJson(text: string): CsvParseResult {
  const res = Papa.parse<Record<string, unknown>>(text.trim(), {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  })
  return {
    rows: res.data,
    errors: res.errors
      .slice(0, 5)
      .map((e) =>
        t('formatConvert.csvRowError', { row: (e.row ?? 0) + 1, message: e.message }),
      ),
  }
}

export function jsonToCsv(value: unknown): string {
  const rows = (Array.isArray(value) ? value : [value]).map(normalizeForCsv)
  return Papa.unparse(rows as unknown[], { quotes: false, newline: '\n' })
}

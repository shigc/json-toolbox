import * as XLSX from 'xlsx'

export function sheetNames(buffer: ArrayBuffer): string[] {
  return XLSX.read(buffer, { type: 'array' }).SheetNames
}

export function sheetToJson(buffer: ArrayBuffer, sheetName?: string): unknown[] {
  const wb = XLSX.read(buffer, { type: 'array' })
  const name = sheetName && wb.SheetNames.includes(sheetName) ? sheetName : wb.SheetNames[0]
  const ws = wb.Sheets[name]
  if (!ws) return []
  return XLSX.utils.sheet_to_json(ws, { defval: null }) as unknown[]
}

/** 只导出前 8 个 sheet 的概览，用于在界面上提示 */
export function workbookSummary(buffer: ArrayBuffer): string {
  const wb = XLSX.read(buffer, { type: 'array' })
  return wb.SheetNames.join('、')
}

export function jsonToXlsx(value: unknown, sheetName = 'Sheet1'): ArrayBuffer {
  const rows = Array.isArray(value) ? value : [value]
  const ws = XLSX.utils.json_to_sheet(rows as Record<string, unknown>[])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31) || 'Sheet1')
  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer
}

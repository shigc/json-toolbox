import { csvToJson, jsonToCsv } from './csv'
import { jsonToXml, xmlToJson } from './xml'
import { jsonToYaml, yamlToJson } from './yaml'
import { jsonToToml, tomlToJson } from './toml'
import { iniToJson, jsonToIni } from './ini'
import { t } from '@/i18n'

export type DataFormat = 'json' | 'yaml' | 'xml' | 'toml' | 'csv' | 'ini'

export const FORMATS: DataFormat[] = ['json', 'yaml', 'xml', 'toml', 'csv', 'ini']

export const FORMAT_LABEL: Record<DataFormat, string> = {
  json: 'JSON',
  yaml: 'YAML',
  xml: 'XML',
  toml: 'TOML',
  csv: 'CSV',
  ini: 'INI',
}

export const FORMAT_EXT: Record<DataFormat, string> = {
  json: 'json',
  yaml: 'yaml',
  xml: 'xml',
  toml: 'toml',
  csv: 'csv',
  ini: 'ini',
}

/** 所有格式都先解析成 JS 值，以 JSON 作为中转枢纽 */
export function parseAs(format: DataFormat, text: string): unknown {
  switch (format) {
    case 'json':
      return JSON.parse(text) as unknown
    case 'yaml':
      return yamlToJson(text)
    case 'xml':
      return xmlToJson(text)
    case 'toml':
      return tomlToJson(text)
    case 'csv': {
      const { rows, errors } = csvToJson(text)
      if (errors.length) {
        throw new Error(t('formatConvert.csvWarn', { message: errors[0] }))
      }
      return rows
    }
    case 'ini':
      return iniToJson(text)
  }
}

export function serializeAs(format: DataFormat, value: unknown): string {
  switch (format) {
    case 'json':
      return JSON.stringify(value, null, 2)
    case 'yaml':
      return jsonToYaml(value)
    case 'xml':
      return jsonToXml(value)
    case 'toml':
      return jsonToToml(value)
    case 'csv':
      return jsonToCsv(value)
    case 'ini':
      return jsonToIni(value)
  }
}

export function convertText(from: DataFormat, to: DataFormat, text: string): string {
  if (from === to) return text
  return serializeAs(to, parseAs(from, text))
}

import { parse as tomlParse, stringify as tomlStringify } from 'smol-toml'
import { t } from '@/i18n'

export function tomlToJson(text: string): unknown {
  return tomlParse(text) as unknown
}

export function jsonToToml(value: unknown): string {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    const type = Array.isArray(value) ? t('formatConvert.typeArray') : typeof value
    throw new Error(t('formatConvert.tomlRootError', { type }))
  }
  return tomlStringify(value as Record<string, unknown>)
}

import { createI18n } from 'vue-i18n'
import zhCN from '@/locales/zh-CN'
import zhTW from '@/locales/zh-TW'
import en from '@/locales/en'
import ja from '@/locales/ja'
import ko from '@/locales/ko'

export interface LocaleMeta {
  code: LocaleCode
  /** 下拉里显示的原生名称 */
  label: string
  /** 状态栏用的短标签 */
  short: string
}

export const LOCALES: LocaleMeta[] = [
  { code: 'zh-CN', label: '简体中文', short: '中文' },
  { code: 'zh-TW', label: '繁體中文', short: '繁中' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ja', label: '日本語', short: '日本語' },
  { code: 'ko', label: '한국어', short: '한국어' },
]

export type LocaleCode = 'zh-CN' | 'zh-TW' | 'en' | 'ja' | 'ko'

export const DEFAULT_LOCALE: LocaleCode = 'zh-CN'

export function isLocaleCode(value: unknown): value is LocaleCode {
  return typeof value === 'string' && LOCALES.some((l) => l.code === value)
}

export function localeMeta(code: LocaleCode): LocaleMeta {
  return LOCALES.find((l) => l.code === code) ?? LOCALES[0]
}

/** 按浏览器语言猜一个最接近的 */
export function detectLocale(): LocaleCode {
  const candidates = navigator.languages?.length ? navigator.languages : [navigator.language]
  for (const raw of candidates) {
    if (!raw) continue
    const tag = raw.toLowerCase()
    if (isLocaleCode(raw)) return raw
    if (tag.startsWith('zh')) return /tw|hk|mo|hant/.test(tag) ? 'zh-TW' : 'zh-CN'
    if (tag.startsWith('ja')) return 'ja'
    if (tag.startsWith('ko')) return 'ko'
    if (tag.startsWith('en')) return 'en'
  }
  return DEFAULT_LOCALE
}

export const i18n = createI18n({
  legacy: false,
  locale: DEFAULT_LOCALE,
  fallbackLocale: DEFAULT_LOCALE,
  messages: { 'zh-CN': zhCN, 'zh-TW': zhTW, en, ja, ko },
})

/**
 * 供非组件模块（utils / stores / composables）使用的翻译助手。
 * 组件内请用 useI18n() 的 t，以便随语言切换自动重渲染。
 */
export function t(key: string, named?: Record<string, unknown>): string {
  const global = i18n.global as unknown as {
    t: (k: string, n?: Record<string, unknown>) => string
  }
  return named ? global.t(key, named) : global.t(key)
}

export function currentLocale(): LocaleCode {
  const global = i18n.global as unknown as { locale: { value: string } }
  return (global.locale.value as LocaleCode) ?? DEFAULT_LOCALE
}

export function setLocale(code: LocaleCode) {
  const global = i18n.global as unknown as { locale: { value: string } }
  global.locale.value = code
  document.documentElement.lang = code
}

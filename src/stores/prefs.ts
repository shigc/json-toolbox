import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import {
  DEFAULT_LOCALE,
  detectLocale,
  isLocaleCode,
  setLocale as applyI18nLocale,
  t,
  type LocaleCode,
} from '@/i18n'

export type ThemeMode = 'light' | 'dark' | 'system'

const KEY = 'jsontoolbox.prefs'

interface Prefs {
  theme: ThemeMode
  locale: LocaleCode
  showStatusBar: boolean
  wordWrap: boolean
  /** 缩进：数字表示空格数，'tab' 表示制表符 */
  indent: 2 | 4 | 'tab'
}

const DEFAULTS: Prefs = {
  theme: 'system',
  locale: DEFAULT_LOCALE,
  showStatusBar: true,
  wordWrap: false,
  indent: 2,
}

function load(): Prefs {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULTS, locale: detectLocale() }
    const parsed = JSON.parse(raw) as Partial<Prefs>
    return {
      ...DEFAULTS,
      ...parsed,
      // 存的语言代码可能已失效，或首次访问需要按浏览器语言探测
      locale: isLocaleCode(parsed.locale) ? parsed.locale : detectLocale(),
    }
  } catch {
    return { ...DEFAULTS, locale: detectLocale() }
  }
}

const media = window.matchMedia('(prefers-color-scheme: dark)')

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') return media.matches ? 'dark' : 'light'
  return mode
}

export const usePrefsStore = defineStore('prefs', () => {
  const saved = load()

  const theme = ref<ThemeMode>(saved.theme)
  const locale = ref<LocaleCode>(saved.locale)
  const showStatusBar = ref(saved.showStatusBar)
  const wordWrap = ref(saved.wordWrap)
  const indent = ref<Prefs['indent']>(saved.indent)

  /** 当前实际生效的明暗（system 已解析） */
  const resolvedTheme = ref<'light' | 'dark'>(resolveTheme(saved.theme))

  function applyTheme() {
    const next = resolveTheme(theme.value)
    resolvedTheme.value = next
    document.documentElement.dataset.theme = next
  }

  /** 切换语言：同时同步 <html lang>、页面标题与 meta 描述 */
  function applyLocale() {
    applyI18nLocale(locale.value)
    document.title = t('app.title')
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', t('app.description'))
  }

  function persist() {
    const data: Prefs = {
      theme: theme.value,
      locale: locale.value,
      showStatusBar: showStatusBar.value,
      wordWrap: wordWrap.value,
      indent: indent.value,
    }
    try {
      localStorage.setItem(KEY, JSON.stringify(data))
    } catch {
      /* 隐私模式下忽略 */
    }
  }

  function init() {
    applyTheme()
    applyLocale()
    media.addEventListener('change', () => {
      if (theme.value === 'system') applyTheme()
    })
  }

  function setTheme(mode: ThemeMode) {
    theme.value = mode
    applyTheme()
  }

  /** 在浅色/深色之间切换（不落到 system） */
  function toggleTheme() {
    setTheme(resolvedTheme.value === 'dark' ? 'light' : 'dark')
  }

  function setLocale(code: LocaleCode) {
    locale.value = code
  }

  /** 缩进对应的字符串 */
  function indentText(): string {
    return indent.value === 'tab' ? '\t' : ' '.repeat(indent.value)
  }

  watch([theme, locale, showStatusBar, wordWrap, indent], persist)
  watch(locale, applyLocale)

  return {
    theme,
    locale,
    resolvedTheme,
    showStatusBar,
    wordWrap,
    indent,
    init,
    setTheme,
    toggleTheme,
    setLocale,
    indentText,
  }
})

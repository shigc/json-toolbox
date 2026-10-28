import { computed } from 'vue'
import type { MenuGroup, MenuItem } from '@/components/layout/menu'
import { CATEGORY_KEY, CATEGORY_ORDER } from '@/tools/types'
import { LISTABLE_TOOLS, toolTitle } from '@/tools/registry'
import { LOCALES } from '@/i18n'
import { t } from '@/i18n'
import { usePrefsStore } from '@/stores/prefs'
import { useWorkspaceStore } from '@/stores/workspace'
import { useAppActions } from './useAppActions'

/** 「工具」菜单与标签栏 + 按钮共用：按分类列出全部工具 */
export function toolMenuItems(): MenuItem[] {
  const actions = useAppActions()
  const items: MenuItem[] = []
  CATEGORY_ORDER.forEach((cat, i) => {
    if (i > 0) items.push({ kind: 'separator' })
    items.push({ kind: 'header', label: t(CATEGORY_KEY[cat]) })
    for (const tool of LISTABLE_TOOLS.filter((x) => x.category === cat)) {
      items.push({ label: toolTitle(tool.id), action: () => actions.newTab(tool.id) })
    }
  })
  return items
}

export function useAppMenu() {
  const actions = useAppActions()
  const prefs = usePrefsStore()
  const ws = useWorkspaceStore()

  const menus = computed<MenuGroup[]>(() => {
    const hasTab = !!ws.activeTab
    return [
      {
        label: t('menu.file'),
        items: [
          { label: t('menu.newTab'), children: toolMenuItems() },
          { kind: 'separator' },
          {
            label: t('menu.openFile'),
            shortcut: 'Ctrl+O',
            action: () => void actions.openFile(),
          },
          { label: t('menu.saveLocal'), shortcut: 'Ctrl+S', action: () => actions.saveActive() },
          { kind: 'separator' },
          {
            label: t('menu.closeCurrent'),
            shortcut: 'Ctrl+Alt+W',
            disabled: !hasTab,
            action: () => actions.closeActive(),
          },
          {
            label: t('menu.closeOthers'),
            disabled: !hasTab || ws.tabs.length < 2,
            action: () => actions.closeOthers(),
          },
          {
            label: t('menu.closeAll'),
            disabled: !ws.tabs.length,
            action: () => actions.closeAll(),
          },
        ],
      },
      {
        label: t('menu.edit'),
        items: [
          {
            label: t('menu.format'),
            shortcut: 'Ctrl+Shift+F',
            disabled: !hasTab,
            action: () => actions.formatInput(),
          },
          {
            label: t('menu.minify'),
            shortcut: 'Ctrl+Shift+M',
            disabled: !hasTab,
            action: () => actions.minifyInput(),
          },
          {
            label: t('menu.sortKeys'),
            disabled: !hasTab,
            action: () => actions.sortKeysInput(),
          },
          { kind: 'separator' },
          {
            label: t('menu.copyInput'),
            shortcut: 'Ctrl+Shift+C',
            action: () => void actions.copyInput(),
          },
          { label: t('menu.copyOutput'), action: () => void actions.copyOutput() },
          {
            label: t('menu.pasteInput'),
            shortcut: 'Ctrl+Shift+V',
            action: () => void actions.pasteInput(),
          },
          { kind: 'separator' },
          { label: t('menu.clearInput'), disabled: !hasTab, action: () => actions.clearInput() },
        ],
      },
      {
        label: t('menu.view'),
        items: [
          {
            label: t('menu.theme'),
            children: [
              {
                label: t('menu.themeLight'),
                checked: prefs.theme === 'light',
                action: () => prefs.setTheme('light'),
              },
              {
                label: t('menu.themeDark'),
                checked: prefs.theme === 'dark',
                action: () => prefs.setTheme('dark'),
              },
              {
                label: t('menu.themeSystem'),
                checked: prefs.theme === 'system',
                action: () => prefs.setTheme('system'),
              },
            ],
          },
          {
            label: t('menu.language'),
            children: LOCALES.map((l) => ({
              label: l.label,
              checked: prefs.locale === l.code,
              action: () => prefs.setLocale(l.code),
            })),
          },
          { kind: 'separator' },
          {
            label: t('menu.showStatusBar'),
            checked: prefs.showStatusBar,
            action: () => (prefs.showStatusBar = !prefs.showStatusBar),
          },
          {
            label: t('menu.wordWrap'),
            checked: prefs.wordWrap,
            action: () => (prefs.wordWrap = !prefs.wordWrap),
          },
          {
            label: t('menu.indent'),
            children: [
              {
                label: t('menu.indent2'),
                checked: prefs.indent === 2,
                action: () => (prefs.indent = 2),
              },
              {
                label: t('menu.indent4'),
                checked: prefs.indent === 4,
                action: () => (prefs.indent = 4),
              },
              {
                label: t('menu.indentTab'),
                checked: prefs.indent === 'tab',
                action: () => (prefs.indent = 'tab'),
              },
            ],
          },
          { kind: 'separator' },
          { label: t('menu.fullscreen'), action: () => void actions.toggleFullscreen() },
        ],
      },
      {
        label: t('menu.tools'),
        items: [
          ...toolMenuItems(),
          { kind: 'separator' },
          { label: t('menu.home'), action: () => actions.goHome() },
        ],
      },
      {
        label: t('menu.help'),
        items: [
          { label: t('menu.shortcuts'), action: () => actions.openDialog('shortcuts') },
          { label: t('menu.about'), action: () => actions.openDialog('about') },
        ],
      },
    ]
  })

  return { menus }
}

/** 快捷键弹窗用：按键组合固定，说明随语言变化 */
export const SHORTCUT_ROWS: Array<{ keys: string; key: string }> = [
  { keys: 'Ctrl + S', key: 'shortcut.saveLocal' },
  { keys: 'Ctrl + O', key: 'shortcut.openFile' },
  { keys: 'Ctrl + Alt + W', key: 'shortcut.closeCurrent' },
  { keys: 'Ctrl + Shift + F', key: 'shortcut.formatInput' },
  { keys: 'Ctrl + Shift + M', key: 'shortcut.minifyInput' },
  { keys: 'Ctrl + Shift + C', key: 'shortcut.copyInput' },
  { keys: 'Ctrl + Shift + V', key: 'shortcut.pasteInput' },
  { keys: 'Ctrl + Alt + T', key: 'shortcut.toggleTheme' },
  { keys: 'Ctrl + Alt + H', key: 'shortcut.goHome' },
  { keys: 'Esc', key: 'shortcut.closePopup' },
]

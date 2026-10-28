import { onBeforeUnmount, onMounted } from 'vue'
import { useAppActions } from './useAppActions'
import { usePrefsStore } from '@/stores/prefs'

/**
 * 全局快捷键。
 * 注意 Ctrl+W / Ctrl+N / Ctrl+T 是浏览器保留键，无法被 preventDefault 拦截，
 * 因此关闭标签用 Ctrl+Alt+W，新建标签的主入口是菜单与标签栏的 + 按钮。
 */
export function useShortcuts() {
  const actions = useAppActions()
  const prefs = usePrefsStore()

  const handlers: Record<string, () => void> = {
    'ctrl+s': () => actions.saveActive(),
    'ctrl+o': () => void actions.openFile(),
    'ctrl+alt+w': () => actions.closeActive(),
    'ctrl+shift+f': () => actions.formatInput(),
    'ctrl+shift+m': () => actions.minifyInput(),
    'ctrl+shift+c': () => void actions.copyInput(),
    'ctrl+shift+v': () => void actions.pasteInput(),
    'ctrl+alt+t': () => prefs.toggleTheme(),
    'ctrl+alt+h': () => actions.goHome(),
  }

  function onKeydown(e: KeyboardEvent) {
    // 输入框内的普通按键交给输入框；但带 Ctrl 的组合仍然拦截
    const key = [
      e.ctrlKey && 'ctrl',
      e.altKey && 'alt',
      e.shiftKey && 'shift',
      e.key.toLowerCase(),
    ]
      .filter(Boolean)
      .join('+')

    const handler = handlers[key]
    if (!handler) return
    e.preventDefault()
    handler()
  }

  onMounted(() => window.addEventListener('keydown', onKeydown))
  onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
}

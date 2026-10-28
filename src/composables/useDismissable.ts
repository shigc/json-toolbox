import { onBeforeUnmount, onMounted } from 'vue'

/**
 * 点击弹层外部（或按 Esc）时关闭弹层。
 *
 * `ignoreSelectors` 里的点击不触发关闭：触发按钮所在的容器（菜单栏、标签栏）要留给自己
 * 处理开/关切换。否则点同一个触发按钮时，mousedown 先把它关掉、随后的 click 又把它打开，
 * 表现为「点了没反应、关不掉」。
 */
export function useDismissable(
  isOpen: () => boolean,
  close: () => void,
  ignoreSelectors: string[] = [],
) {
  const selectors = ['.popup', ...ignoreSelectors]

  function onMousedown(e: MouseEvent) {
    if (!isOpen()) return
    const target = e.target as HTMLElement | null
    if (!target) return
    if (selectors.some((sel) => target.closest(sel))) return
    close()
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && isOpen()) close()
  }

  onMounted(() => {
    document.addEventListener('mousedown', onMousedown)
    document.addEventListener('keydown', onKeydown)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('mousedown', onMousedown)
    document.removeEventListener('keydown', onKeydown)
  })
}

import type { Directive } from 'vue'
import { t } from '@/i18n'

/**
 * v-split：给 `.split.cols-2` 双栏容器加一条可拖动的分隔条。
 *
 * 之所以用指令而不是组件：各工具视图都是 `<div class="split cols-2">` 直接包两个
 * `<section class="pane">`，指令可以原地增强容器，不必为十几个视图重排插槽结构。
 *
 * 宽度用 fr 权重表达（例如 `0.35fr 0.65fr`），这样容器尺寸变化（窗口缩放、
 * 侧栏开关）时左右比例自动保持，不需要监听 resize。
 */

const MIN_RATIO = 0.15
const MAX_RATIO = 0.85
const STEP = 0.02

const cleanups = new WeakMap<HTMLElement, () => void>()

function clampRatio(value: number): number {
  return Math.min(MAX_RATIO, Math.max(MIN_RATIO, value))
}

function setRatio(el: HTMLElement, ratio: number) {
  const r = clampRatio(ratio)
  el.style.setProperty('--split-cols', `${r}fr ${1 - r}fr`)
  el.style.setProperty('--split-ratio', String(r))
}

function currentRatio(el: HTMLElement): number {
  const raw = parseFloat(el.style.getPropertyValue('--split-ratio'))
  return Number.isFinite(raw) ? raw : 0.5
}

function mount(el: HTMLElement): () => void {
  setRatio(el, 0.5)

  const handle = document.createElement('div')
  handle.className = 'split-resizer'
  handle.setAttribute('role', 'separator')
  handle.setAttribute('aria-orientation', 'vertical')
  handle.setAttribute('tabindex', '0')
  handle.setAttribute('title', t('common.splitHint'))
  el.appendChild(handle)

  let dragging = false
  let startX = 0
  let startRatio = 0.5
  let freeWidth = 1

  /** 两列可分配的总宽度：容器内部宽度减去左右内边距和列间距 */
  function measureFreeWidth(): number {
    const cs = getComputedStyle(el)
    const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight)
    const gap = parseFloat(cs.columnGap) || 0
    return Math.max(1, el.clientWidth - padX - gap)
  }

  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return
    startX = e.clientX
    startRatio = currentRatio(el)
    freeWidth = measureFreeWidth()
    dragging = true
    handle.classList.add('dragging')
    document.body.classList.add('split-dragging')
    handle.setPointerCapture(e.pointerId)
    e.preventDefault()
  }

  const onPointerMove = (e: PointerEvent) => {
    if (!dragging) return
    setRatio(el, startRatio + (e.clientX - startX) / freeWidth)
  }

  const stopDrag = (e: PointerEvent) => {
    if (!dragging) return
    dragging = false
    handle.classList.remove('dragging')
    document.body.classList.remove('split-dragging')
    if (handle.hasPointerCapture(e.pointerId)) handle.releasePointerCapture(e.pointerId)
  }

  const onKeyDown = (e: KeyboardEvent) => {
    const ratio = currentRatio(el)
    if (e.key === 'ArrowLeft') setRatio(el, ratio - STEP)
    else if (e.key === 'ArrowRight') setRatio(el, ratio + STEP)
    else if (e.key === 'Home') setRatio(el, 0.5)
    else return
    e.preventDefault()
  }

  const onDblClick = () => setRatio(el, 0.5)

  handle.addEventListener('pointerdown', onPointerDown)
  handle.addEventListener('pointermove', onPointerMove)
  handle.addEventListener('pointerup', stopDrag)
  handle.addEventListener('pointercancel', stopDrag)
  handle.addEventListener('dblclick', onDblClick)
  handle.addEventListener('keydown', onKeyDown)

  return () => {
    handle.removeEventListener('pointerdown', onPointerDown)
    handle.removeEventListener('pointermove', onPointerMove)
    handle.removeEventListener('pointerup', stopDrag)
    handle.removeEventListener('pointercancel', stopDrag)
    handle.removeEventListener('dblclick', onDblClick)
    handle.removeEventListener('keydown', onKeyDown)
    document.body.classList.remove('split-dragging')
    handle.remove()
  }
}

export const vSplit: Directive<HTMLElement> = {
  mounted(el) {
    cleanups.set(el, mount(el))
  },
  updated(el) {
    // 语言切换后同步提示文案
    const hint = t('common.splitHint')
    el.querySelector('.split-resizer')?.setAttribute('title', hint)
  },
  unmounted(el) {
    cleanups.get(el)?.()
    cleanups.delete(el)
  },
}

import { ref } from 'vue'

export type ToastKind = 'info' | 'ok' | 'err'

export interface Toast {
  id: number
  text: string
  kind: ToastKind
}

const toasts = ref<Toast[]>([])
let seq = 0

/** 上限：后台标签页里定时器会被浏览器节流，兜底避免提示堆叠 */
const MAX_TOASTS = 3

function push(text: string, kind: ToastKind = 'info', ms = 1800) {
  const id = ++seq
  toasts.value.push({ id, text, kind })
  if (toasts.value.length > MAX_TOASTS) {
    toasts.value = toasts.value.slice(-MAX_TOASTS)
  }
  window.setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }, ms)
}

export function useToast() {
  return {
    toasts,
    info: (t: string) => push(t, 'info'),
    ok: (t: string) => push(t, 'ok'),
    err: (t: string) => push(t, 'err', 2800),
  }
}

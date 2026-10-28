import { ref, watch, type Ref } from 'vue'

/** 大 JSON 下避免每次按键都重算，用于树形/查询/对比等派生结果 */
export function useDebounced<T>(source: Ref<T>, ms = 180): Ref<T> {
  const out = ref(source.value) as Ref<T>
  let timer: number | undefined
  watch(source, (v) => {
    window.clearTimeout(timer)
    timer = window.setTimeout(() => {
      out.value = v
    }, ms)
  })
  return out
}

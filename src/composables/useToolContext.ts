import { computed, type WritableComputedRef } from 'vue'
import { useWorkspaceStore, type Tab } from '@/stores/workspace'
import { getTool } from '@/tools/registry'
import type { ToolDef } from '@/tools/types'

export type InputSource = 'shared' | 'own'

/**
 * 工具与工作区之间的契约：所有视图通过它读写输入/输出与自己的选项，
 * 从而获得「切标签不丢内容」和「工具间共享数据」两件事。
 */
export function useToolContext() {
  const ws = useWorkspaceStore()

  const tab = computed<Tab | null>(() => ws.activeTab)
  const def = computed<ToolDef | undefined>(() =>
    tab.value ? getTool(tab.value.toolId) : undefined,
  )

  /** 主输入：由 store 按 source 决定指向共享缓冲区还是本标签草稿 */
  const input = computed<string>({
    get: () => ws.activeInput,
    set: (v: string) => {
      ws.activeInput = v
    },
  })

  /** 输出：工具产出的文本，Ctrl+S 会优先导出它 */
  const output = computed<string>({
    get: () => (tab.value?.state.output as string) ?? '',
    set: (v: string) => {
      if (tab.value) tab.value.state.output = v
    },
  })

  const source = computed<InputSource>({
    get: () => ((tab.value?.state.source as InputSource) ?? 'shared'),
    set: (v: InputSource) => {
      if (tab.value) tab.value.state.source = v
    },
  })

  /** 该标签自己的任意持久选项（如缩进、分隔符、目标格式） */
  function option<T>(key: string, fallback: T): WritableComputedRef<T> {
    return computed<T>({
      get: () => (tab.value?.state[key] as T) ?? fallback,
      set: (v: T) => {
        if (tab.value) tab.value.state[key] = v
      },
    })
  }

  /** 转为独立输入：把当前内容固化到本标签，之后不再跟随共享缓冲区 */
  function detach() {
    const current = input.value
    source.value = 'own'
    if (tab.value) tab.value.state.input = current
  }

  /** 跟随共享缓冲区，并把当前内容推上去 */
  function attach() {
    const current = input.value
    source.value = 'shared'
    ws.setShared(current)
  }

  /** 把本标签的输入推送到共享缓冲区 */
  function pushToShared() {
    ws.setShared(input.value)
  }

  return {
    ws,
    tab,
    def,
    input,
    output,
    source,
    option,
    detach,
    attach,
    pushToShared,
  }
}

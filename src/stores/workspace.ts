import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { getTool, HOME_TOOL_ID } from '@/tools/registry'
import { sampleWorkspace } from '@/locales/samples'

export interface Tab {
  id: string
  toolId: string
  /** 该标签自己的草稿状态（输入文本、选项等），切标签不丢 */
  state: Record<string, unknown>
}

const KEY = 'jsontoolbox.workspace'

interface Persisted {
  tabs: Tab[]
  activeId: string | null
  sharedText: string
}

let seq = 0
function nextTabId(toolId: string): string {
  seq += 1
  return `${toolId}#${seq}`
}

export const useWorkspaceStore = defineStore('workspace', () => {
  const tabs = ref<Tab[]>([])
  const activeId = ref<string | null>(null)
  const sharedText = ref<string>(sampleWorkspace())
  const sharedUpdatedAt = ref(0)

  const activeTab = computed<Tab | null>(
    () => tabs.value.find((t) => t.id === activeId.value) ?? null,
  )

  const hasShared = computed(() => sharedText.value.trim().length > 0)

  /**
   * 约定：工具的主输入统一走这里。
   * source = 'shared' 时直接读写共享缓冲区（工具间实时互通）；
   * source = 'own' 时使用该标签自己的草稿（state.input）。
   * 菜单栏的「编辑」项与工具视图都依赖这一约定。
   */
  function sourceOf(tab: Tab | null): 'shared' | 'own' {
    return (tab?.state.source as 'shared' | 'own') ?? 'shared'
  }

  const activeInput = computed<string>({
    get: () => {
      const tab = activeTab.value
      if (!tab) return ''
      return sourceOf(tab) === 'shared' ? sharedText.value : ((tab.state.input as string) ?? '')
    },
    set: (v: string) => {
      const tab = activeTab.value
      if (!tab) return
      if (sourceOf(tab) === 'shared') {
        setShared(v)
        return
      }
      tab.state.input = v
    },
  })

  function createTab(toolId: string): Tab | null {
    const def = getTool(toolId)
    if (!def) return null
    const tab: Tab = { id: nextTabId(toolId), toolId, state: {} }
    tabs.value.push(tab)
    return tab
  }

  /** 打开工具：已有该工具标签则聚焦，否则新建 */
  function openTool(toolId: string, opts: { forceNew?: boolean } = {}) {
    const existing = tabs.value.find((t) => t.toolId === toolId)
    if (existing && !opts.forceNew) {
      activeId.value = existing.id
      return existing.id
    }
    const tab = createTab(toolId)
    if (tab) activeId.value = tab.id
    return tab?.id ?? null
  }

  function activate(id: string) {
    if (tabs.value.some((t) => t.id === id)) activeId.value = id
  }

  function closeTab(id: string) {
    const idx = tabs.value.findIndex((t) => t.id === id)
    if (idx < 0) return
    tabs.value.splice(idx, 1)
    if (activeId.value !== id) return
    // 关闭后激活右邻标签，没有则激活左邻
    const next = tabs.value[idx] ?? tabs.value[idx - 1] ?? null
    activeId.value = next?.id ?? null
  }

  function closeOthers(id: string) {
    tabs.value = tabs.value.filter((t) => t.id === id)
    activeId.value = tabs.value[0]?.id ?? null
  }

  function closeAll() {
    tabs.value = []
    activeId.value = null
  }

  function closeToRight(id: string) {
    const idx = tabs.value.findIndex((t) => t.id === id)
    if (idx < 0) return
    tabs.value = tabs.value.slice(0, idx + 1)
    if (!tabs.value.some((t) => t.id === activeId.value)) activeId.value = id
  }

  function moveTab(from: number, to: number) {
    if (from === to || from < 0 || to < 0) return
    const list = tabs.value
    if (from >= list.length || to >= list.length) return
    const [item] = list.splice(from, 1)
    list.splice(to, 0, item)
  }

  /** 写入共享缓冲区，其他工具切过去即可看到 */
  function setShared(text: string) {
    sharedText.value = text
    sharedUpdatedAt.value = Date.now()
  }

  // ---------- 持久化 ----------
  function load() {
    try {
      const raw = localStorage.getItem(KEY)
      if (!raw) {
        openTool(HOME_TOOL_ID)
        return
      }
      const data = JSON.parse(raw) as Partial<Persisted>
      if (typeof data.sharedText === 'string' && data.sharedText) {
        sharedText.value = data.sharedText
      }
      const valid = (data.tabs ?? []).filter((t) => getTool(t.toolId))
      // 只保留必要字段：旧版本持久化过 title，那会让标签标题不随语言切换
      tabs.value = valid.map((t) => ({
        id: t.id,
        toolId: t.toolId,
        state: t.state ?? {},
      }))
      // 恢复 id 序号，避免新标签与恢复的标签撞 id
      seq = tabs.value.length + 1000
      activeId.value =
        data.activeId && tabs.value.some((t) => t.id === data.activeId)
          ? data.activeId
          : (tabs.value[0]?.id ?? null)
      if (!tabs.value.length) openTool(HOME_TOOL_ID)
    } catch {
      openTool(HOME_TOOL_ID)
    }
  }

  function persist() {
    const snapshot: Persisted = {
      tabs: tabs.value,
      activeId: activeId.value,
      sharedText: sharedText.value,
    }
    try {
      localStorage.setItem(KEY, JSON.stringify(snapshot))
    } catch {
      // 超出配额时退化为只存标签结构，丢弃草稿
      try {
        localStorage.setItem(
          KEY,
          JSON.stringify({
            tabs: tabs.value.map((t) => ({ ...t, state: {} })),
            activeId: activeId.value,
            sharedText: '',
          } satisfies Persisted),
        )
      } catch {
        /* 忽略 */
      }
    }
  }

  let saveTimer: number | undefined
  watch(
    [tabs, activeId, sharedText],
    () => {
      window.clearTimeout(saveTimer)
      saveTimer = window.setTimeout(persist, 300)
    },
    { deep: true },
  )

  return {
    tabs,
    activeId,
    activeTab,
    activeInput,
    sharedText,
    sharedUpdatedAt,
    hasShared,
    openTool,
    activate,
    closeTab,
    closeOthers,
    closeAll,
    closeToRight,
    moveTab,
    setShared,
    load,
  }
})

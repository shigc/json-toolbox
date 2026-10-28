import { useWorkspaceStore } from '@/stores/workspace'
import { usePrefsStore } from '@/stores/prefs'
import { getTool, HOME_TOOL_ID } from '@/tools/registry'
import { t } from '@/i18n'
import { copyText, downloadText, pickFile, readClipboard } from '@/utils/file'
import { formatJson, minifyJson, parseJson, sortKeysDeep } from '@/utils/json'
import { useToast } from './useToast'
import { useAppDialog } from './useAppDialog'

/**
 * 菜单栏与全局快捷键共用同一套动作，保证两条入口行为一致。
 */
export function useAppActions() {
  const ws = useWorkspaceStore()
  const prefs = usePrefsStore()
  const toast = useToast()
  const dialog = useAppDialog()

  /** 当前工具是否接受输入；不接受（如首页）时自动切到 JSON 格式化 */
  function ensureInputTool(): boolean {
    const tab = ws.activeTab
    if (!tab) return false
    const def = getTool(tab.toolId)
    if (!def || def.accepts === 'none') {
      ws.openTool('json-format')
    }
    return true
  }

  function newTab(toolId: string) {
    ws.openTool(toolId)
  }

  async function openFile() {
    const picked = await pickFile('.json,.txt,.csv,.yaml,.yml,.xml,.toml,.ini,application/json')
    if (!picked) return
    ensureInputTool()
    ws.activeInput = picked.text
    toast.ok(t('actions.loadedFile', { name: picked.name }))
  }

  /** 导出：优先当前工具的产物，其次输入 */
  function saveActive() {
    const tab = ws.activeTab
    if (!tab) return
    const output = tab.state.output as string | undefined
    const text = output && output.trim() ? output : ((tab.state.input as string | undefined) ?? '')
    if (!text.trim()) {
      toast.err(t('actions.nothingToExport'))
      return
    }
    if (tab.toolId === 'excel') {
      toast.err(t('excel.useButtonInstead'))
      return
    }
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
    downloadText(`${tab.toolId}-${stamp}.json`, text)
    toast.ok(t('common.downloadStarted'))
  }

  async function copyInput() {
    const text = ws.activeInput
    if (!text) {
      toast.err(t('actions.emptyInput'))
      return
    }
    const ok = await copyText(text)
    ok ? toast.ok(t('actions.copiedInput')) : toast.err(t('common.copyFailed'))
  }

  async function copyOutput() {
    const output = (ws.activeTab?.state.output as string) ?? ''
    if (!output.trim()) {
      toast.err(t('actions.noOutput'))
      return
    }
    const ok = await copyText(output)
    ok ? toast.ok(t('actions.copiedOutput')) : toast.err(t('common.copyFailed'))
  }

  async function pasteInput() {
    const text = await readClipboard()
    if (text === null) {
      toast.err(t('actions.clipboardDenied'))
      return
    }
    ensureInputTool()
    ws.activeInput = text
    toast.ok(t('actions.pasted'))
  }

  function clearInput() {
    ws.activeInput = ''
  }

  /** 对当前标签的输入做 JSON 变换，失败时报出具体行列 */
  function transformInput(fn: (value: unknown) => string, okKey: string) {
    const text = ws.activeInput
    const res = parseJson(text)
    if (!res.ok) {
      toast.err(
        t('actions.jsonError', {
          location: t('common.lineCol', { line: res.error.line, col: res.error.col }),
        }),
      )
      return
    }
    try {
      ws.activeInput = fn(res.value)
      toast.ok(t(okKey))
    } catch (e) {
      toast.err(e instanceof Error ? e.message : String(e))
    }
  }

  const formatInput = () =>
    transformInput((v) => formatJson(v, prefs.indentText()), 'actions.formatted')
  const minifyInput = () => transformInput((v) => minifyJson(v), 'actions.minified')
  const sortKeysInput = () =>
    transformInput((v) => formatJson(sortKeysDeep(v), prefs.indentText()), 'actions.keysSorted')

  function closeActive() {
    const tab = ws.activeTab
    if (tab) ws.closeTab(tab.id)
  }
  function closeOthers() {
    const tab = ws.activeTab
    if (tab) ws.closeOthers(tab.id)
  }
  function closeAll() {
    ws.closeAll()
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await document.documentElement.requestFullscreen()
    } catch {
      toast.err(t('actions.fullscreenUnsupported'))
    }
  }

  function goHome() {
    ws.openTool(HOME_TOOL_ID)
  }

  return {
    newTab,
    openFile,
    saveActive,
    copyInput,
    copyOutput,
    pasteInput,
    clearInput,
    formatInput,
    minifyInput,
    sortKeysInput,
    closeActive,
    closeOthers,
    closeAll,
    toggleFullscreen,
    goHome,
    openDialog: dialog.open,
  }
}

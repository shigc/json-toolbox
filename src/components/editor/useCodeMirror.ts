import { onBeforeUnmount, onMounted, shallowRef, type Ref } from 'vue'
import { Compartment, EditorState, type Extension } from '@codemirror/state'
import {
  EditorView,
  drawSelection,
  dropCursor,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
  placeholder as placeholderExt,
  rectangularSelection,
} from '@codemirror/view'
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from '@codemirror/commands'
import {
  HighlightStyle,
  bracketMatching,
  foldGutter,
  foldKeymap,
  indentOnInput,
  indentUnit,
  syntaxHighlighting,
} from '@codemirror/language'
import { json, jsonParseLinter } from '@codemirror/lang-json'
import { lintGutter, linter } from '@codemirror/lint'
import { highlightSelectionMatches, openSearchPanel, searchKeymap } from '@codemirror/search'
import { tags as t } from '@lezer/highlight'

export type EditorLanguage = 'json' | 'text'

export interface CodeMirrorConfig {
  doc?: string
  language?: EditorLanguage
  readonly?: boolean
  wordWrap?: boolean
  indent?: string
  placeholder?: string
  onChange?: (value: string) => void
  onCursor?: (line: number, col: number, selLen: number) => void
}

/** 编辑器主题：全部取 app 的 CSS 变量，明暗切换无需重建实例 */
const appTheme = EditorView.theme({
  '&': {
    height: '100%',
    fontSize: 'var(--font-size-code)',
    backgroundColor: 'var(--bg-code)',
    color: 'var(--fg)',
  },
  '&.cm-focused': { outline: 'none' },
  '.cm-scroller': {
    fontFamily: 'var(--font-mono)',
    lineHeight: '1.55',
    overflow: 'auto',
  },
  '.cm-content': { padding: '8px 0', caretColor: 'var(--fg)' },
  '.cm-line': { padding: '0 10px 0 6px' },
  '.cm-gutters': {
    backgroundColor: 'var(--bg-code)',
    color: 'var(--fg-faint)',
    border: 'none',
    borderRight: '1px solid var(--border)',
  },
  '.cm-lineNumbers .cm-gutterElement': { padding: '0 8px 0 10px' },
  '.cm-activeLine': { backgroundColor: 'var(--bg-hover)' },
  '.cm-activeLineGutter': { backgroundColor: 'var(--bg-hover)', color: 'var(--fg)' },
  '.cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: 'rgba(120, 150, 200, 0.34)',
  },
  '&.cm-focused .cm-selectionBackground': {
    backgroundColor: 'rgba(90, 140, 210, 0.42)',
  },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--fg)', borderLeftWidth: '2px' },
  '.cm-foldGutter span': { color: 'var(--fg-faint)', cursor: 'pointer' },
  '.cm-foldPlaceholder': {
    backgroundColor: 'var(--bg-active)',
    border: 'none',
    color: 'var(--fg-muted)',
    padding: '0 4px',
  },
  '.cm-tooltip': {
    border: '1px solid var(--border)',
    backgroundColor: 'var(--bg-panel)',
    color: 'var(--fg)',
    borderRadius: '4px',
  },
  '.cm-tooltip-autocomplete ul li[aria-selected]': {
    backgroundColor: 'var(--accent)',
    color: 'var(--fg-on-accent)',
  },
  '.cm-panels': {
    backgroundColor: 'var(--bg-inset)',
    color: 'var(--fg)',
    borderColor: 'var(--border)',
  },
  '.cm-panels input, .cm-panels button': {
    border: '1px solid var(--border-strong)',
    borderRadius: '3px',
    backgroundColor: 'var(--bg-panel)',
    color: 'var(--fg)',
    padding: '2px 6px',
  },
  '.cm-searchMatch': { backgroundColor: 'rgba(230, 180, 60, 0.42)' },
  '.cm-searchMatch.cm-searchMatch-selected': { backgroundColor: 'rgba(230, 150, 40, 0.62)' },
  '.cm-lintRange-error': {
    textDecoration: 'underline wavy var(--danger)',
    textDecorationSkipInk: 'none',
  },
  '.cm-lintRange-warning': {
    textDecoration: 'underline wavy var(--warn)',
    textDecorationSkipInk: 'none',
  },
  '.cm-diagnostic': { padding: '4px 8px', fontSize: '12px' },
  '.cm-diagnostic-error': { borderLeft: '3px solid var(--danger)' },
})

/** JSON 语法着色，同样走 CSS 变量 */
const appHighlight = HighlightStyle.define([
  { tag: t.propertyName, color: 'var(--json-key)' },
  { tag: t.string, color: 'var(--json-string)' },
  { tag: t.number, color: 'var(--json-number)' },
  { tag: [t.bool, t.null, t.keyword], color: 'var(--json-literal)' },
  { tag: [t.punctuation, t.separator, t.bracket], color: 'var(--json-punct)' },
  { tag: t.invalid, color: 'var(--danger)' },
])

export function useCodeMirror(host: Ref<HTMLElement | null>, config: CodeMirrorConfig = {}) {
  const view = shallowRef<EditorView | null>(null)

  const languageComp = new Compartment()
  const readonlyComp = new Compartment()
  const wrapComp = new Compartment()
  const indentComp = new Compartment()

  // 程序化写入文档时抑制 onChange，避免与父组件形成回环
  let syncing = false

  function languageExt(lang: EditorLanguage): Extension {
    return lang === 'json' ? [json(), linter(jsonParseLinter()), lintGutter()] : []
  }

  function readonlyExt(ro: boolean): Extension {
    return [EditorState.readOnly.of(ro), EditorView.editable.of(!ro)]
  }

  function wrapExt(wrap: boolean): Extension {
    return wrap ? EditorView.lineWrapping : []
  }

  function indentExt(indent: string): Extension {
    return [indentUnit.of(indent)]
  }

  function reportCursor(state: EditorState) {
    if (!config.onCursor) return
    const sel = state.selection.main
    const line = state.doc.lineAt(sel.head)
    config.onCursor(line.number, sel.head - line.from + 1, Math.abs(sel.to - sel.from))
  }

  onMounted(() => {
    if (!host.value) return

    view.value = new EditorView({
      parent: host.value,
      state: EditorState.create({
        doc: config.doc ?? '',
        extensions: [
          lineNumbers(),
          highlightActiveLineGutter(),
          highlightSpecialChars(),
          history(),
          foldGutter(),
          drawSelection(),
          dropCursor(),
          EditorState.allowMultipleSelections.of(true),
          indentOnInput(),
          bracketMatching(),
          rectangularSelection(),
          highlightActiveLine(),
          highlightSelectionMatches(),
          syntaxHighlighting(appHighlight),
          appTheme,
          placeholderExt(config.placeholder ?? ''),
          keymap.of([
            ...defaultKeymap,
            ...historyKeymap,
            ...foldKeymap,
            ...searchKeymap,
            indentWithTab,
          ]),
          languageComp.of(languageExt(config.language ?? 'json')),
          readonlyComp.of(readonlyExt(config.readonly ?? false)),
          wrapComp.of(wrapExt(config.wordWrap ?? false)),
          indentComp.of(indentExt(config.indent ?? '  ')),
          EditorView.updateListener.of((u) => {
            if (u.docChanged && !syncing) config.onChange?.(u.state.doc.toString())
            if (u.selectionSet || u.docChanged || u.focusChanged) reportCursor(u.state)
          }),
        ],
      }),
    })

    reportCursor(view.value.state)
  })

  onBeforeUnmount(() => {
    view.value?.destroy()
    view.value = null
  })

  function setDoc(text: string) {
    const v = view.value
    if (!v) return
    const current = v.state.doc.toString()
    if (current === text) return
    syncing = true
    v.dispatch({ changes: { from: 0, to: current.length, insert: text } })
    syncing = false
  }

  function setLanguage(lang: EditorLanguage) {
    view.value?.dispatch({ effects: languageComp.reconfigure(languageExt(lang)) })
  }

  function setReadonly(ro: boolean) {
    view.value?.dispatch({ effects: readonlyComp.reconfigure(readonlyExt(ro)) })
  }

  function setWordWrap(wrap: boolean) {
    view.value?.dispatch({ effects: wrapComp.reconfigure(wrapExt(wrap)) })
  }

  function setIndent(indent: string) {
    view.value?.dispatch({ effects: indentComp.reconfigure(indentExt(indent)) })
  }

  function focus() {
    view.value?.focus()
  }

  function openSearch() {
    const v = view.value
    if (!v) return
    v.focus()
    openSearchPanel(v)
  }

  /** 把光标移到指定行列（用于错误定位） */
  function gotoLine(line: number, col = 1) {
    const v = view.value
    if (!v) return
    const clamped = Math.min(Math.max(1, line), v.state.doc.lines)
    const info = v.state.doc.line(clamped)
    const pos = Math.min(info.from + Math.max(0, col - 1), info.to)
    v.dispatch({ selection: { anchor: pos }, scrollIntoView: true })
    v.focus()
  }

  return {
    view,
    setDoc,
    setLanguage,
    setReadonly,
    setWordWrap,
    setIndent,
    focus,
    openSearch,
    gotoLine,
  }
}

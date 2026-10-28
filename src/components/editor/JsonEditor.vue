<script setup lang="ts">
import { ref, watch } from 'vue'
import { useCodeMirror, type EditorLanguage } from './useCodeMirror'
import { usePrefsStore } from '@/stores/prefs'
import { useStatusStore } from '@/stores/status'

const props = withDefaults(
  defineProps<{
    modelValue: string
    language?: EditorLanguage
    readonly?: boolean
    placeholder?: string
    /** 是否把光标位置写入状态栏（同屏多个编辑器时只让主编辑器上报） */
    reportCursor?: boolean
  }>(),
  { language: 'json', readonly: false, placeholder: '', reportCursor: true },
)

const emit = defineEmits<{ 'update:modelValue': [string] }>()

const host = ref<HTMLElement | null>(null)
const prefs = usePrefsStore()
const status = useStatusStore()

const cm = useCodeMirror(host, {
  doc: props.modelValue,
  language: props.language,
  readonly: props.readonly,
  wordWrap: prefs.wordWrap,
  indent: prefs.indentText(),
  placeholder: props.placeholder,
  onChange: (v) => emit('update:modelValue', v),
  onCursor: props.reportCursor
    ? (line, col, selLen) => status.setCursor(line, col, selLen)
    : undefined,
})

watch(
  () => props.modelValue,
  (v) => cm.setDoc(v),
)
watch(
  () => props.readonly,
  (v) => cm.setReadonly(v),
)
watch(
  () => props.language,
  (v) => cm.setLanguage(v),
)
watch(
  () => prefs.wordWrap,
  (v) => cm.setWordWrap(v),
)
watch(
  () => prefs.indent,
  () => cm.setIndent(prefs.indentText()),
)

defineExpose({
  focus: () => cm.focus(),
  openSearch: () => cm.openSearch(),
  gotoLine: (line: number, col?: number) => cm.gotoLine(line, col),
})
</script>

<template>
  <div ref="host" class="cm-host" />
</template>

<style scoped>
.cm-host {
  height: 100%;
  min-height: 0;
  overflow: hidden;
}
</style>

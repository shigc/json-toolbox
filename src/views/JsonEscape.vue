<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import JsonEditor from '@/components/editor/JsonEditor.vue'
import DataSourcePicker from '@/components/common/DataSourcePicker.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import { useToolContext } from '@/composables/useToolContext'
import { useDebounced } from '@/composables/useDebounced'
import { usePrefsStore } from '@/stores/prefs'
import { useToast } from '@/composables/useToast'
import { copyText } from '@/utils/file'
import {
  escapeJsonString,
  jsonToQueryString,
  queryStringToJson,
  unescapeJsonString,
} from '@/utils/encode'
import { formatJson, parseJson } from '@/utils/json'

const { t } = useI18n()
const ctx = useToolContext()
const prefs = usePrefsStore()
const toast = useToast()

type Mode = 'escape' | 'unescape' | 'toQuery' | 'fromQuery'

const mode = ctx.option<Mode>('mode', 'escape')
const withQuotes = ctx.option<boolean>('withQuotes', true)

const MODES: Array<{ value: Mode; key: string }> = [
  { value: 'escape', key: 'escape.modeEscape' },
  { value: 'unescape', key: 'escape.modeUnescape' },
  { value: 'toQuery', key: 'escape.modeToQuery' },
  { value: 'fromQuery', key: 'escape.modeFromQuery' },
]

const debouncedInput = useDebounced(ctx.input, 180)

const result = computed(() => {
  const text = debouncedInput.value
  if (!text.trim()) return { ok: true as const, error: '', text: '' }

  try {
    switch (mode.value) {
      case 'escape': {
        const escaped = escapeJsonString(text)
        return {
          ok: true as const,
          error: '',
          text: withQuotes.value ? escaped : escaped.slice(1, -1),
        }
      }
      case 'unescape':
        return { ok: true as const, error: '', text: unescapeJsonString(text) }
      case 'toQuery': {
        const res = parseJson(text)
        if (!res.ok) {
          return {
            ok: false as const,
            error: t('escape.needValidJson', {
              location: t('common.lineCol', { line: res.error.line, col: res.error.col }),
            }),
            text: '',
          }
        }
        return { ok: true as const, error: '', text: jsonToQueryString(res.value) }
      }
      case 'fromQuery':
        return {
          ok: true as const,
          error: '',
          text: formatJson(queryStringToJson(text), prefs.indentText()),
        }
    }
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : String(e), text: '' }
  }
})

watch(
  result,
  (r) => {
    ctx.output.value = r.text
  },
  { immediate: true },
)

const outputLanguage = computed(() => (mode.value === 'fromQuery' ? 'json' : 'text'))

async function copyResult() {
  if (!result.value.ok || !result.value.text) return toast.err(t('common.noResultToCopy'))
  const ok = await copyText(result.value.text)
  ok ? toast.ok(t('common.copied')) : toast.err(t('common.copyFailed'))
}
</script>

<template>
  <div class="view">
    <div class="tool-row">
      <DataSourcePicker />
      <span class="sep" />
      <div class="seg">
        <button
          v-for="item in MODES"
          :key="item.value"
          class="seg-btn"
          :class="{ on: mode === item.value }"
          @click="mode = item.value"
        >
          {{ t(item.key) }}
        </button>
      </div>
      <label v-if="mode === 'escape'" class="app-checkbox">
        <input v-model="withQuotes" type="checkbox" />{{ t('escape.keepQuotes') }}
      </label>
      <span class="spacer" />
      <span v-if="result.ok" class="badge ok">{{ t('common.ready') }}</span>
      <span v-else class="badge err">{{ result.error }}</span>
      <button class="app-btn sm" @click="copyResult">
        <AppIcon name="copy" :size="13" />
        {{ t('common.copyResult') }}
      </button>
    </div>

    <div class="split cols-2" v-split>
      <section class="pane">
        <header class="pane-head"><span>{{ t('common.input') }}</span></header>
        <div class="pane-body">
          <JsonEditor v-model="ctx.input.value" language="text" />
        </div>
      </section>
      <section class="pane">
        <header class="pane-head">
          <span>{{ t('common.result') }}</span>
          <span class="spacer" />
          <span class="faint">
            {{ t(outputLanguage === 'json' ? 'schema.tabSchema' : 'escape.plainText') }}
          </span>
        </header>
        <div class="pane-body">
          <JsonEditor
            :model-value="result.text"
            :language="outputLanguage"
            readonly
            :report-cursor="false"
          />
        </div>
      </section>
    </div>
  </div>
</template>

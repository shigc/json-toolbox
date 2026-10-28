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
import { copyText, downloadText } from '@/utils/file'
import { flatten, formatJson, parseJson, unflatten } from '@/utils/json'

const { t } = useI18n()
const ctx = useToolContext()
const prefs = usePrefsStore()
const toast = useToast()

const direction = ctx.option<'flatten' | 'unflatten'>('direction', 'flatten')
const sep = ctx.option<string>('sep', '.')
const bracket = ctx.option<boolean>('bracket', false)

const debouncedInput = useDebounced(ctx.input, 180)

const result = computed(() => {
  const res = parseJson(debouncedInput.value)
  if (!res.ok) return { ok: false as const, error: res.error, text: '', count: 0 }

  try {
    if (direction.value === 'flatten') {
      const flat = flatten(res.value, { sep: sep.value || '.', bracket: bracket.value })
      return {
        ok: true as const,
        error: null,
        text: formatJson(flat, prefs.indentText()),
        count: Object.keys(flat).length,
      }
    }
    if (!res.value || typeof res.value !== 'object' || Array.isArray(res.value)) {
      return {
        ok: false as const,
        error: {
          message: t('jsonFlatten.needFlatObject'),
          line: 1,
          col: 1,
          index: -1,
        },
        text: '',
        count: 0,
      }
    }
    const nested = unflatten(res.value as Record<string, unknown>)
    return {
      ok: true as const,
      error: null,
      text: formatJson(nested, prefs.indentText()),
      count: Object.keys(res.value as object).length,
    }
  } catch (e) {
    return {
      ok: false as const,
      error: { message: e instanceof Error ? e.message : String(e), line: 1, col: 1, index: -1 },
      text: '',
      count: 0,
    }
  }
})

watch(
  result,
  (r) => {
    ctx.output.value = r.text
  },
  { immediate: true },
)

function replaceInput() {
  if (!result.value.ok) return toast.err(t('common.replaceFailed'))
  ctx.input.value = result.value.text
  toast.ok(t('common.replacedInput'))
}

async function copyResult() {
  if (!result.value.ok) return toast.err(t('common.noResultToCopy'))
  const ok = await copyText(result.value.text)
  ok ? toast.ok(t('common.copied')) : toast.err(t('common.copyFailed'))
}

function exportResult() {
  downloadText('flattened.json', result.value.text)
  toast.ok(t('common.downloadStarted'))
}
</script>

<template>
  <div class="view">
    <div class="tool-row">
      <DataSourcePicker />
      <span class="sep" />
      <div class="seg">
        <button
          class="seg-btn"
          :class="{ on: direction === 'flatten' }"
          @click="direction = 'flatten'"
        >
          {{ t('jsonFlatten.toFlat') }}
        </button>
        <button
          class="seg-btn"
          :class="{ on: direction === 'unflatten' }"
          @click="direction = 'unflatten'"
        >
          {{ t('jsonFlatten.toNested') }}
        </button>
      </div>
      <label class="field-inline">
        {{ t('jsonFlatten.separator') }}
        <input v-model="sep" class="app-input mono" style="width: 56px" maxlength="3" />
      </label>
      <label v-if="direction === 'flatten'" class="app-checkbox">
        <input v-model="bracket" type="checkbox" />{{ t('jsonFlatten.bracketStyle') }}
      </label>
      <span class="spacer" />
      <button class="app-btn sm" @click="replaceInput">
        <AppIcon name="arrowRight" :size="13" />
        {{ t('common.replaceInput') }}
      </button>
      <button class="app-btn sm" @click="copyResult">
        <AppIcon name="copy" :size="13" />
        {{ t('common.copyResult') }}
      </button>
      <button class="app-btn sm" @click="exportResult">
        <AppIcon name="download" :size="13" />
        {{ t('common.export') }}
      </button>
    </div>

    <div class="split cols-2" v-split>
      <section class="pane">
        <header class="pane-head">
          <span>
            {{ t(direction === 'flatten' ? 'jsonFlatten.nestedJson' : 'jsonFlatten.flatJson') }}
          </span>
        </header>
        <div class="pane-body">
          <JsonEditor v-model="ctx.input.value" language="json" />
        </div>
      </section>
      <section class="pane">
        <header class="pane-head">
          <span>
            {{ t(direction === 'flatten' ? 'jsonFlatten.flatPairs' : 'jsonFlatten.nestedJson') }}
          </span>
          <span class="spacer" />
          <span v-if="result.ok" class="badge ok">
            {{ t('common.keyCount', { count: result.count }) }}
          </span>
          <span v-else class="badge err">{{ t('common.replaceFailed') }}</span>
        </header>
        <div class="pane-body">
          <JsonEditor :model-value="result.text" language="json" readonly :report-cursor="false" />
        </div>
      </section>
    </div>
  </div>
</template>

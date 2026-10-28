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
import { dropEmpty, formatJson, parseJson, sortKeysDeep } from '@/utils/json'

const { t } = useI18n()
const ctx = useToolContext()
const prefs = usePrefsStore()
const toast = useToast()

const order = ctx.option<'asc' | 'desc'>('order', 'asc')
const dropNull = ctx.option<boolean>('dropNull', false)
const dropEmptyString = ctx.option<boolean>('dropEmptyString', false)
const dropEmptyContainer = ctx.option<boolean>('dropEmptyContainer', false)

const debouncedInput = useDebounced(ctx.input, 180)

const result = computed(() => {
  const res = parseJson(debouncedInput.value)
  if (!res.ok) return { ok: false as const, error: res.error, text: '' }
  let value = sortKeysDeep(res.value, order.value)
  if (dropNull.value || dropEmptyString.value || dropEmptyContainer.value) {
    value = dropEmpty(value, {
      null: dropNull.value,
      emptyString: dropEmptyString.value,
      emptyContainer: dropEmptyContainer.value,
    })
  }
  return { ok: true as const, error: null, text: formatJson(value, prefs.indentText()) }
})

watch(
  result,
  (r) => {
    ctx.output.value = r.text
  },
  { immediate: true },
)

function replaceInput() {
  if (!result.value.ok) {
    toast.err(t('common.invalidJson'))
    return
  }
  ctx.input.value = result.value.text
  toast.ok(t('common.replacedInput'))
}

async function copyResult() {
  if (!result.value.ok) return toast.err(t('common.noResultToCopy'))
  const ok = await copyText(result.value.text)
  ok ? toast.ok(t('common.copied')) : toast.err(t('common.copyFailed'))
}

function exportResult() {
  downloadText('sorted.json', result.value.text)
  toast.ok(t('common.downloadStarted'))
}
</script>

<template>
  <div class="view">
    <div class="tool-row">
      <DataSourcePicker />
      <span class="sep" />
      <label class="field-inline">
        {{ t('jsonSort.direction') }}
        <select v-model="order" class="app-select">
          <option value="asc">{{ t('jsonSort.asc') }}</option>
          <option value="desc">{{ t('jsonSort.desc') }}</option>
        </select>
      </label>
      <span class="sep" />
      <label class="app-checkbox">
        <input v-model="dropNull" type="checkbox" />{{ t('jsonSort.dropNull') }}
      </label>
      <label class="app-checkbox">
        <input v-model="dropEmptyString" type="checkbox" />{{ t('jsonSort.dropEmptyString') }}
      </label>
      <label class="app-checkbox">
        <input v-model="dropEmptyContainer" type="checkbox" />{{
          t('jsonSort.dropEmptyContainer')
        }}
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
        <header class="pane-head"><span>{{ t('common.input') }}</span></header>
        <div class="pane-body">
          <JsonEditor v-model="ctx.input.value" language="json" />
        </div>
      </section>
      <section class="pane">
        <header class="pane-head">
          <span>{{ t('common.result') }}</span>
          <span class="spacer" />
          <span v-if="result.ok" class="badge ok">{{ t('jsonSort.sorted') }}</span>
          <span v-else class="badge err">
            {{ t('common.lineError', { line: result.error?.line }) }}
          </span>
        </header>
        <div class="pane-body">
          <JsonEditor :model-value="result.text" language="json" readonly :report-cursor="false" />
        </div>
      </section>
    </div>
  </div>
</template>

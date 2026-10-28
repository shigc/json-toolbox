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
import { formatJson, parseJson } from '@/utils/json'
import { generateSchema } from '@/utils/schema'
import { schemaToTs } from '@/utils/schemaToTs'

const { t } = useI18n()
const ctx = useToolContext()
const prefs = usePrefsStore()
const toast = useToast()

const outTab = ctx.option<'schema' | 'ts'>('outTab', 'schema')
const title = ctx.option<string>('title', '')
const markRequired = ctx.option<boolean>('markRequired', true)

const debouncedInput = useDebounced(ctx.input, 220)

const result = computed(() => {
  const res = parseJson(debouncedInput.value)
  if (!res.ok) return { ok: false as const, error: res.error, schema: '', ts: '' }
  try {
    const schema = generateSchema(res.value, {
      title: title.value.trim() || undefined,
      markRequired: markRequired.value,
    })
    return {
      ok: true as const,
      error: null,
      schema: formatJson(schema, prefs.indentText()),
      ts: schemaToTs(schema, title.value.trim() || 'Root'),
    }
  } catch (e) {
    return {
      ok: false as const,
      error: { message: e instanceof Error ? e.message : String(e), line: 1, col: 1, index: -1 },
      schema: '',
      ts: '',
    }
  }
})

const current = computed(() => (outTab.value === 'schema' ? result.value.schema : result.value.ts))

watch(current, (v) => {
  ctx.output.value = v
})

async function copyOut() {
  if (!result.value.ok) return toast.err(t('common.invalidJson'))
  const ok = await copyText(current.value)
  ok ? toast.ok(t('common.copied')) : toast.err(t('common.copyFailed'))
}

function exportOut() {
  if (!result.value.ok) return toast.err(t('common.invalidJson'))
  const name = outTab.value === 'schema' ? 'schema.json' : 'types.ts'
  downloadText(name, current.value, outTab.value === 'ts' ? 'text/plain' : 'application/json')
  toast.ok(t('common.downloadStarted'))
}
</script>

<template>
  <div class="view">
    <div class="tool-row">
      <DataSourcePicker />
      <span class="sep" />
      <label class="field-inline">
        {{ t('schema.rootName') }}
        <input
          v-model="title"
          class="app-input"
          style="width: 140px"
          :placeholder="t('schema.rootNamePlaceholder')"
        />
      </label>
      <label class="app-checkbox">
        <input v-model="markRequired" type="checkbox" />{{ t('schema.allRequired') }}
      </label>
      <span class="spacer" />
      <span v-if="result.ok" class="badge ok">{{ t('schema.generated') }}</span>
      <span v-else class="badge err">
        {{ t('common.lineError', { line: result.error?.line }) }}
      </span>
      <button class="app-btn sm" @click="copyOut">
        <AppIcon name="copy" :size="13" />
        {{ t('common.copy') }}
      </button>
      <button class="app-btn sm" @click="exportOut">
        <AppIcon name="download" :size="13" />
        {{ t('common.export') }}
      </button>
    </div>

    <div class="split cols-2" v-split>
      <section class="pane">
        <header class="pane-head"><span>{{ t('schema.sample') }}</span></header>
        <div class="pane-body">
          <JsonEditor v-model="ctx.input.value" language="json" />
        </div>
      </section>

      <section class="pane">
        <header class="pane-head">
          <div class="seg">
            <button
              class="seg-btn"
              :class="{ on: outTab === 'schema' }"
              @click="outTab = 'schema'"
            >
              {{ t('schema.tabSchema') }}
            </button>
            <button class="seg-btn" :class="{ on: outTab === 'ts' }" @click="outTab = 'ts'">
              {{ t('schema.tabTs') }}
            </button>
          </div>
        </header>
        <div class="pane-body">
          <JsonEditor
            :model-value="current"
            :language="outTab === 'ts' ? 'text' : 'json'"
            readonly
            :report-cursor="false"
          />
        </div>
      </section>
    </div>
  </div>
</template>

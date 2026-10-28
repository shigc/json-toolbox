<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import JsonEditor from '@/components/editor/JsonEditor.vue'
import DataSourcePicker from '@/components/common/DataSourcePicker.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import { useToolContext } from '@/composables/useToolContext'
import { useDebounced } from '@/composables/useDebounced'
import { useToast } from '@/composables/useToast'
import { copyText } from '@/utils/file'
import {
  fromBase64,
  fromBase64Url,
  fromHtmlEntities,
  fromUnicode,
  toBase64,
  toBase64Url,
  toHtmlEntities,
  toUnicode,
  urlDecode,
  urlEncode,
  urlEncodeKeepStructure,
} from '@/utils/encode'

const { t } = useI18n()
const ctx = useToolContext()
const toast = useToast()

type Algo = 'base64' | 'base64url' | 'unicode' | 'html' | 'url' | 'urlKeep'

const ALGOS: Array<{ value: Algo; label: string }> = [
  { value: 'base64', label: 'Base64' },
  { value: 'base64url', label: 'Base64 URL' },
  { value: 'unicode', label: 'Unicode \\uXXXX' },
  { value: 'html', label: 'HTML' },
  { value: 'url', label: 'URL' },
  { value: 'urlKeep', label: 'URL (keep)' },
]

const algo = ctx.option<Algo>('algo', 'base64')
const direction = ctx.option<'encode' | 'decode'>('direction', 'encode')

/** 下拉里给算法加一句本地化说明，纯英文缩写看不出来是什么 */
const algoLabel = (value: Algo): string => {
  switch (value) {
    case 'base64url':
      return `${t('encode.base64url')}`
    case 'html':
      return `${t('encode.htmlEntity')}`
    case 'url':
      return `${t('encode.urlEncode')}`
    case 'urlKeep':
      return `${t('encode.urlKeep')}`
    default:
      return ALGOS.find((a) => a.value === value)?.label ?? value
  }
}

const debouncedInput = useDebounced(ctx.input, 160)

const result = computed(() => {
  const text = debouncedInput.value
  if (!text) return { ok: true as const, error: '', text: '' }

  const encoders: Record<Algo, (s: string) => string> = {
    base64: toBase64,
    base64url: toBase64Url,
    unicode: toUnicode,
    html: toHtmlEntities,
    url: urlEncode,
    urlKeep: urlEncodeKeepStructure,
  }
  const decoders: Record<Algo, (s: string) => string> = {
    base64: fromBase64,
    base64url: fromBase64Url,
    unicode: fromUnicode,
    html: fromHtmlEntities,
    url: urlDecode,
    urlKeep: urlDecode,
  }

  try {
    const fn = direction.value === 'encode' ? encoders[algo.value] : decoders[algo.value]
    return { ok: true as const, error: '', text: fn(text) }
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

function swapDirection() {
  const out = result.value.ok ? result.value.text : ''
  direction.value = direction.value === 'encode' ? 'decode' : 'encode'
  if (out) ctx.input.value = out
}

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
      <label class="field-inline">
        {{ t('encode.algorithm') }}
        <select v-model="algo" class="app-select">
          <option v-for="item in ALGOS" :key="item.value" :value="item.value">
            {{ algoLabel(item.value) }}
          </option>
        </select>
      </label>
      <div class="seg">
        <button
          class="seg-btn"
          :class="{ on: direction === 'encode' }"
          @click="direction = 'encode'"
        >
          {{ t('encode.encode') }}
        </button>
        <button
          class="seg-btn"
          :class="{ on: direction === 'decode' }"
          @click="direction = 'decode'"
        >
          {{ t('encode.decode') }}
        </button>
      </div>
      <button class="app-btn ghost sm" :title="t('encode.swapTip')" @click="swapDirection">
        <AppIcon name="swap" :size="14" />
      </button>
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
        <header class="pane-head">
          <span>
            {{ t(direction === 'encode' ? 'encode.sourcePlain' : 'encode.sourceEncoded') }}
          </span>
        </header>
        <div class="pane-body">
          <JsonEditor v-model="ctx.input.value" language="text" />
        </div>
      </section>
      <section class="pane">
        <header class="pane-head">
          <span>
            {{ t(direction === 'encode' ? 'encode.resultEncoded' : 'encode.resultDecoded') }}
          </span>
        </header>
        <div class="pane-body">
          <JsonEditor :model-value="result.text" language="text" readonly :report-cursor="false" />
        </div>
      </section>
    </div>
  </div>
</template>

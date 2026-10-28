<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import JsonEditor from '@/components/editor/JsonEditor.vue'
import DataSourcePicker from '@/components/common/DataSourcePicker.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import { useToolContext } from '@/composables/useToolContext'
import { usePrefsStore } from '@/stores/prefs'
import { useToast } from '@/composables/useToast'
import { downloadBlob, pickFile } from '@/utils/file'
import { formatJson, parseJson } from '@/utils/json'
import { jsonToXlsx, sheetNames, sheetToJson } from '@/utils/convert/excel'

const { t } = useI18n()
const ctx = useToolContext()
const prefs = usePrefsStore()
const toast = useToast()

const workbook = ref<ArrayBuffer | null>(null)
const fileName = ref('')
const sheets = ref<string[]>([])
const sheet = ref('')
const imported = ref('')
const importError = ref('')

async function chooseFile() {
  const picked = await pickFile('.xlsx,.xls,.csv')
  if (!picked) return
  try {
    const names = sheetNames(picked.buffer)
    workbook.value = picked.buffer
    fileName.value = picked.name
    sheets.value = names
    sheet.value = names[0] ?? ''
    runImport()
    toast.ok(t('excel.imported', { name: picked.name }))
  } catch (e) {
    importError.value = e instanceof Error ? e.message : String(e)
    toast.err(t('excel.readFailed'))
  }
}

function runImport() {
  importError.value = ''
  if (!workbook.value) return
  try {
    const rows = sheetToJson(workbook.value, sheet.value)
    imported.value = formatJson(rows, prefs.indentText())
  } catch (e) {
    importError.value = e instanceof Error ? e.message : String(e)
    imported.value = ''
  }
}

watch(sheet, runImport)

function useImported() {
  if (!imported.value) return
  ctx.input.value = imported.value
  toast.ok(t('excel.wroteToInput'))
}

function exportExcel() {
  const res = parseJson(ctx.input.value)
  if (!res.ok) {
    toast.err(
      t('actions.jsonError', {
        location: t('common.lineCol', { line: res.error.line, col: res.error.col }),
      }),
    )
    return
  }
  try {
    const buf = jsonToXlsx(res.value, sheet.value || 'Sheet1')
    downloadBlob(
      `${fileName.value.replace(/\.(xlsx|xls|csv)$/i, '') || 'export'}.xlsx`,
      new Blob([buf], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
    )
    toast.ok(t('excel.exportToast'))
  } catch (e) {
    toast.err(e instanceof Error ? e.message : String(e))
  }
}
</script>

<template>
  <div class="view">
    <div class="tool-row">
      <DataSourcePicker />
      <span class="sep" />
      <button class="app-btn sm" @click="chooseFile">
        <AppIcon name="upload" :size="13" />
        {{ t('excel.chooseFile') }}
      </button>
      <label v-if="sheets.length" class="field-inline">
        {{ t('excel.sheet') }}
        <select v-model="sheet" class="app-select">
          <option v-for="name in sheets" :key="name" :value="name">{{ name }}</option>
        </select>
      </label>
      <span v-if="fileName" class="faint">{{ fileName }}</span>
      <span class="spacer" />
      <button class="app-btn sm primary" @click="exportExcel">
        <AppIcon name="sheet" :size="13" />
        {{ t('excel.exportExcel') }}
      </button>
    </div>

    <div class="split cols-2" v-split>
      <section class="pane">
        <header class="pane-head">
          <span>{{ t('jsonTree.inputLabel') }}</span>
          <span class="spacer" />
          <span class="faint">{{ t('excel.exportHint') }}</span>
        </header>
        <div class="pane-body">
          <JsonEditor v-model="ctx.input.value" language="json" />
        </div>
      </section>

      <section class="pane">
        <header class="pane-head">
          <span>{{ t('excel.importResult') }}</span>
          <span class="spacer" />
          <button v-if="imported" class="app-btn ghost sm" @click="useImported">
            {{ t('excel.useImported') }}
          </button>
        </header>
        <div class="pane-body">
          <div v-if="!imported" class="empty">
            <AppIcon name="sheet" :size="20" />
            <p v-if="importError" class="err-text">{{ importError }}</p>
            <p v-else>{{ t('excel.importHint') }}</p>
          </div>
          <JsonEditor
            v-else
            :model-value="imported"
            language="json"
            readonly
            :report-cursor="false"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.err-text {
  max-width: 420px;
  color: var(--danger);
  font-family: var(--font-mono);
  font-size: 12px;
  word-break: break-all;
}
</style>

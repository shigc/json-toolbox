import { defineStore } from 'pinia'
import { ref } from 'vue'

export type StatusLevel = 'info' | 'ok' | 'err'

/**
 * 状态栏共享状态：光标位置由编辑器写入，校验结果由工具写入。
 */
export const useStatusStore = defineStore('status', () => {
  const line = ref(1)
  const col = ref(1)
  const selLen = ref(0)
  const message = ref('')
  const level = ref<StatusLevel>('info')

  function setCursor(l: number, c: number, sel = 0) {
    line.value = l
    col.value = c
    selLen.value = sel
  }

  function setMessage(msg: string, lv: StatusLevel = 'info') {
    message.value = msg
    level.value = lv
  }

  function clearMessage() {
    message.value = ''
    level.value = 'info'
  }

  return { line, col, selLen, message, level, setCursor, setMessage, clearMessage }
})

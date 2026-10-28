import { ref } from 'vue'

export type DialogName = 'shortcuts' | 'about' | null

const current = ref<DialogName>(null)

export function useAppDialog() {
  return {
    current,
    open: (name: Exclude<DialogName, null>) => {
      current.value = name
    },
    close: () => {
      current.value = null
    },
  }
}

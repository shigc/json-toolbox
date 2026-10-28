<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toasts } = useToast()
</script>

<template>
  <div class="toast-host">
    <!-- 固定过渡时长：不依赖 transitionend，页面被隐藏时也能正常移除 -->
    <TransitionGroup name="toast" :duration="200">
      <div v-for="t in toasts" :key="t.id" class="toast" :class="t.kind">
        {{ t.text }}
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-host {
  position: fixed;
  right: 16px;
  bottom: calc(var(--statusbar-h) + 14px);
  z-index: 5000;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
  pointer-events: none;
}
.toast {
  padding: 6px 12px;
  border-radius: var(--radius);
  background: var(--bg-panel);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-popup);
  font-size: 12px;
  max-width: 360px;
}
.toast.ok {
  border-color: var(--success);
  color: var(--success);
}
.toast.err {
  border-color: var(--danger);
  color: var(--danger);
}
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.18s, transform 0.18s;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>

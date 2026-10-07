<template>
  <ToastProvider :label="label" :duration="DEFAULT_DURATION">
    <ToastPortal>
      <Toast
        v-for="item in toasts"
        :key="item.id"
        :title="item.title"
        :message="item.message"
        :variant="item.variant"
        :duration="item.duration"
        @update:open="handleOpenChange(item.id, $event)"
        @exit-animation-end="handleExitAnimationEnd(item.id)"
      />

      <ToastViewport :label="label" :class="viewportClasses" data-slot="toast-viewport" />
    </ToastPortal>
  </ToastProvider>
</template>

<script setup lang="ts">
import { computed, onScopeDispose } from 'vue'
import { ToastPortal, ToastProvider, ToastViewport } from 'reka-ui'
import { cn } from '@/lib/utils'
import { useToast } from '@/composables/useToast'
import Toast from './Toast.vue'

interface Props {
  /** Accessible label shared by the provider region and the viewport. */
  label?: string
}

withDefaults(defineProps<Props>(), {
  label: 'Notifiche',
})

const DEFAULT_DURATION = 3000

// Fallback only: the source of truth for removal is the root's `animationend`
// (see handleExitAnimationEnd). This covers prefers-reduced-motion, where
// `motion-reduce:animate-none` means no animation ever runs (no event), and
// browsers without CSS animation support. 240ms of exit animation + margin.
const TOAST_EXIT_MS = 260

const { toasts, dismiss } = useToast()

const exitTimers = new Map<number, ReturnType<typeof setTimeout>>()

const viewportClasses = computed(() =>
  cn('fixed right-0 top-0 z-50 flex w-full max-w-[380px] list-none flex-col gap-2 p-4 m-0')
)

// Read once at setup: with reduced motion there is no exit animation, so the
// fallback must be 0ms instead of freezing the toast on screen for 260ms.
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
}

const exitMs = prefersReducedMotion() ? 0 : TOAST_EXIT_MS

function finalizeExit(id: number) {
  const timer = exitTimers.get(id)
  if (timer !== undefined) clearTimeout(timer)
  exitTimers.delete(id)
  dismiss(id)
}

function handleOpenChange(id: number, value: boolean) {
  if (value || exitTimers.has(id)) return

  exitTimers.set(
    id,
    setTimeout(() => finalizeExit(id), exitMs)
  )
}

function handleExitAnimationEnd(id: number) {
  // Only a toast that is already closing can exit; duplicate events (e.g. both
  // animations in a swipe close) are absorbed by the timer-map guard.
  if (!exitTimers.has(id)) return

  finalizeExit(id)
}

onScopeDispose(() => {
  exitTimers.forEach(timer => clearTimeout(timer))
  exitTimers.clear()
})
</script>

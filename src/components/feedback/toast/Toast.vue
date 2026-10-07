<template>
  <ToastRoot
    force-mount
    :duration="duration"
    :type="liveType"
    :class="rootClasses"
    data-slot="toast"
    @update:open="emit('update:open', $event)"
    @swipe-start="handleSwipeStart"
    @swipe-move="handleSwipeMove"
    @swipe-cancel="handleSwipeCancel"
    @swipe-end="handleSwipeEnd"
    @animationend="handleAnimationEnd"
  >
    <span :class="dotClasses" aria-hidden="true" data-slot="toast-dot">
      <svg
        :class="dotIconClasses"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <template v-if="variant === 'success'">
          <path d="M20 6 9 17l-5-5" />
        </template>
        <template v-else-if="variant === 'error'">
          <circle cx="12" cy="12" r="10" />
          <path d="m15 9-6 6" />
          <path d="m9 9 6 6" />
        </template>
        <template v-else>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </template>
      </svg>
    </span>

    <div :class="contentClasses" data-slot="toast-content">
      <ToastTitle v-if="title" :class="titleClasses" data-slot="toast-title">
        {{ title }}
      </ToastTitle>

      <ToastDescription
        v-if="message || $slots.default"
        :class="messageClasses"
        data-slot="toast-message"
      >
        <slot>{{ message }}</slot>
      </ToastDescription>
    </div>

    <ToastClose :class="closeClasses" aria-label="Chiudi notifica" data-slot="toast-close">
      <svg
        :class="closeIconClasses"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
        data-slot="toast-close-icon"
      >
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </svg>
    </ToastClose>
  </ToastRoot>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ToastClose, ToastDescription, ToastRoot, ToastTitle } from 'reka-ui'
import { cn, variants } from '@/lib/utils'
import type { ToastVariant } from '@/composables/useToast'

interface Props {
  /** Bold first line of the toast. */
  title?: string
  /** Second line, rendered strictly as text (never as HTML). */
  message?: string
  /** Semantic status of the notification. */
  variant?: ToastVariant
  /** Visible time in ms; overrides the provider duration. */
  duration?: number
}

/**
 * Minimal structural view of reka's SwipeEvent payload (`swipeStart/swipeMove/
 * swipeCancel/swipeEnd` emit a CustomEvent with `detail.delta` on the layer node).
 */
interface ToastSwipeEvent {
  currentTarget: EventTarget | null
  detail: { delta: { x: number; y: number } }
  preventDefault: () => void
}

const props = withDefaults(defineProps<Props>(), {
  title: undefined,
  message: undefined,
  variant: 'success',
  duration: 3000,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  /** The root's exit animation (toast-out or toast-swipe-out) has finished. */
  'exit-animation-end': []
}>()

const SWIPE_VAR = '--toast-swipe-amount'

const swipeOut = ref(false)

const dotVariants = variants({
  variants: {
    variant: {
      success: 'bg-success text-success-foreground',
      error: 'bg-destructive text-destructive-foreground',
      info: 'bg-info text-info-foreground',
    },
  },
  defaultVariants: { variant: 'success' },
})

// `type` drives the announce live region: 'foreground' is assertive, 'background' polite.
// Success and error close user actions, info is a passive notification.
const liveType = computed<'foreground' | 'background'>(() =>
  props.variant === 'info' ? 'background' : 'foreground'
)

const rootClasses = computed(() =>
  cn(
    'flex w-[380px] items-start gap-3 rounded-lg border border-border bg-card p-4',
    'shadow-[0_6px_20px_#1313111f]',
    'motion-reduce:animate-none',
    'data-[state=open]:animate-[toast-in_240ms_cubic-bezier(0.16,1,0.3,1)]',
    'data-[swipe=move]:translate-x-[var(--toast-swipe-amount)] data-[swipe=move]:transition-none',
    'data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-transform',
    swipeOut.value
      ? 'animate-[toast-swipe-out_240ms_ease-out_forwards]'
      : 'data-[state=closed]:animate-[toast-out_240ms_ease-out_forwards]'
  )
)

const dotClasses = computed(() =>
  cn(
    'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
    dotVariants({ variant: props.variant })
  )
)

const dotIconClasses = computed(() => cn('h-3 w-3'))

const contentClasses = computed(() => cn('flex flex-1 flex-col gap-0.5'))

const titleClasses = computed(() =>
  cn('text-[13px] font-semibold leading-snug text-card-foreground')
)

const messageClasses = computed(() => cn('text-[13px] leading-snug text-muted-foreground'))

const closeClasses = computed(() =>
  cn(
    'shrink-0 rounded-md p-1 text-muted-foreground transition',
    'hover:bg-accent hover:text-foreground',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
  )
)

const closeIconClasses = computed(() => cn('h-4 w-4'))

function handleAnimationEnd(event: AnimationEvent) {
  const root = event.currentTarget as HTMLElement | null

  // Only the root's own exit counts: child animations bubble up (target differs)
  // and toast-in ends while data-state is still "open".
  if (!root || event.target !== root || root.getAttribute('data-state') !== 'closed') return

  emit('exit-animation-end')
}

function swipeElement(event: ToastSwipeEvent): HTMLElement | null {
  return event.currentTarget as HTMLElement | null
}

function handleSwipeStart(event: ToastSwipeEvent) {
  swipeElement(event)?.style.setProperty(SWIPE_VAR, '0px')
}

function handleSwipeMove(event: ToastSwipeEvent) {
  swipeElement(event)?.style.setProperty(SWIPE_VAR, `${event.detail.delta.x}px`)
}

function handleSwipeCancel(event: ToastSwipeEvent) {
  swipeElement(event)?.style.removeProperty(SWIPE_VAR)
}

function handleSwipeEnd(event: ToastSwipeEvent) {
  const element = swipeElement(event)
  const { x, y } = event.detail.delta

  if (Math.abs(x) >= Math.abs(y)) {
    // Horizontal swipe: keep the node for the toast-swipe-out animation; reka closes it.
    swipeOut.value = true
    return
  }

  // Vertical-dominant swipe: prevent reka's close and revert the translation.
  event.preventDefault()
  element?.style.removeProperty(SWIPE_VAR)
  element?.removeAttribute('data-swipe')
}
</script>

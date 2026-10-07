<template>
  <DialogRoot :modal="true" :open="props.open" @update:open="emitOpenChange">
    <DialogPortal>
      <DialogOverlay :class="overlayClasses" data-slot="dialog-overlay" />

      <DialogContent
        :class="contentClasses"
        aria-modal="true"
        data-slot="dialog-content"
        @escape-key-down="handleEscapeKeyDown"
        @pointer-down-outside="handlePointerDownOutside"
      >
        <slot name="title">
          <div :class="headerClasses" data-slot="dialog-header">
            <DialogTitle :class="titleClasses" data-slot="dialog-title">
              {{ title ?? 'Finestra di dialogo' }}
            </DialogTitle>
            <DialogDescription
              v-if="description"
              :class="descriptionClasses"
              data-slot="dialog-description"
            >
              {{ description }}
            </DialogDescription>
          </div>
        </slot>

        <DialogClose :class="closeClasses" aria-label="Chiudi" data-slot="dialog-close">
          <slot name="close-icon">
            <svg
              :class="closeIconClasses"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
              data-slot="dialog-close-icon"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </slot>
        </DialogClose>

        <slot />

        <div v-if="slots.footer" :class="footerClasses" data-slot="dialog-footer">
          <slot name="footer" />
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
import type { Slots } from 'vue'
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui'
import { cn } from '@/lib/utils'

interface Props {
  /** Controlled open state, bindable as `v-model:open`. */
  open?: boolean
  /** Heading rendered inside the default header. */
  title?: string
  /** Supporting text under the title. */
  description?: string
  /** Whether Escape and backdrop click can close the dialog. */
  dismissable?: boolean
  /** Extra classes merged on the dialog content surface. */
  contentClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  title: undefined,
  description: undefined,
  dismissable: true,
  contentClass: undefined,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const slots: Readonly<Slots> = useSlots()
const overlayClasses = computed(() => cn('fixed inset-0 z-50 bg-overlay/40'))

const contentClasses = computed(() =>
  cn(
    'fixed left-1/2 top-1/2 z-50 grid max-h-[calc(100vh-2rem)] w-full max-w-[440px]',
    '-translate-x-1/2 -translate-y-1/2 gap-5 overflow-y-auto rounded-lg border border-border',
    'bg-card p-7 text-card-foreground shadow-lg',
    props.contentClass
  )
)

const headerClasses = computed(() => cn('flex flex-col gap-1.5 pr-8'))

const titleClasses = computed(() =>
  cn('text-lg font-bold text-card-foreground', !props.title && 'sr-only')
)

const descriptionClasses = computed(() => cn('text-sm text-muted-foreground'))

const closeClasses = computed(() =>
  cn(
    'absolute right-5 top-5 rounded-md p-1 text-muted-foreground transition',
    'hover:bg-accent hover:text-foreground',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
  )
)

const closeIconClasses = computed(() => cn('h-4 w-4'))

const footerClasses = computed(() => cn('flex items-center justify-end gap-2'))

function emitOpenChange(value: boolean) {
  emit('update:open', value)
}

function handleEscapeKeyDown(event: Event) {
  if (!props.dismissable) event.preventDefault()
}

function handlePointerDownOutside(event: Event) {
  if (!props.dismissable) event.preventDefault()
}
</script>

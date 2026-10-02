<template>
  <button
    v-bind="forwardedAttrs"
    :type="type"
    :disabled="disabled || loading"
    :aria-busy="loading ? 'true' : undefined"
    :class="buttonClasses"
    data-slot="button"
  >
    <svg
      v-if="loading"
      class="h-3.5 w-3.5 shrink-0 animate-spin motion-reduce:animate-none"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      data-slot="button-spinner"
    >
      <circle
        cx="12"
        cy="12"
        r="10.2"
        stroke="currentColor"
        stroke-width="3.6"
        stroke-linecap="round"
        stroke-dasharray="48.07 16.02"
      />
    </svg>

    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { cn, variants } from '@/lib/utils'

interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  type?: 'button' | 'submit' | 'reset'
  loading?: boolean
  disabled?: boolean
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  type: 'button',
  loading: false,
  disabled: false,
})

const attrs = useAttrs()

const buttonVariants = variants({
  variants: {
    variant: {
      primary: 'bg-primary text-primary-foreground',
      secondary: 'bg-secondary text-secondary-foreground',
      ghost: 'border-border bg-transparent text-foreground',
      destructive: 'bg-destructive text-destructive-foreground',
    },
  },
  defaultVariants: { variant: 'primary' },
})

const forwardedAttrs = computed(() => {
  const rest: Record<string, unknown> = { ...attrs }
  delete rest.class
  return rest
})

const buttonClasses = computed(() =>
  cn(
    'inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-[8px] border border-transparent px-4 text-sm font-semibold transition',
    'hover:brightness-95 disabled:pointer-events-none disabled:opacity-[0.45]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    buttonVariants({ variant: props.variant }),
    attrs.class
  )
)
</script>

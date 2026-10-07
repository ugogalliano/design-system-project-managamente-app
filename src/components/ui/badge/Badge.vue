<template>
  <span v-bind="forwardedAttrs" :class="badgeClasses" data-slot="badge" :data-variant="variant">
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { cn, variants } from '@/lib/utils'

interface Props {
  variant?: 'owner' | 'editor' | 'viewer'
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<Props>(), {
  variant: 'viewer',
})

const attrs = useAttrs()

const forwardedAttrs = computed(() => {
  const rest: Record<string, unknown> = { ...attrs }
  delete rest.class
  return rest
})

const badgeVariants = variants({
  variants: {
    variant: {
      owner: 'bg-secondary text-secondary-foreground',
      editor: 'bg-info text-info-foreground',
      viewer: 'bg-muted text-foreground',
    },
  },
  defaultVariants: { variant: 'viewer' },
})

const badgeClasses = computed(() =>
  cn(
    'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-[3px] text-xs font-medium',
    badgeVariants({ variant: props.variant }),
    attrs.class
  )
)
</script>

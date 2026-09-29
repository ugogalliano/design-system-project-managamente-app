<template>
  <div
    ref="root"
    data-slot="color-palette"
    :class="
      cn('rounded-[var(--radius)] bg-background p-6 text-foreground', variant === 'dark' && 'dark')
    "
  >
    <section
      v-for="group in groups"
      :key="group.title"
      data-slot="color-palette-group"
      class="mb-8 last:mb-0"
    >
      <h3 class="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {{ group.title }}
      </h3>
      <div class="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div
          v-for="token in group.tokens"
          :key="token.name"
          data-slot="color-swatch"
          class="overflow-hidden rounded-lg border border-border"
        >
          <div
            class="relative flex h-20 items-center justify-center"
            :style="{ backgroundColor: `hsl(var(--${token.name}))` }"
          >
            <span
              class="text-2xl font-bold"
              :style="{
                color: token.pair ? `hsl(var(--${token.pair}))` : 'hsl(var(--foreground))',
              }"
              >Aa</span
            >
            <span
              v-if="token.name === 'ring'"
              class="absolute inset-3 rounded-md ring-2 ring-offset-2"
              :style="{
                '--tw-ring-color': 'hsl(var(--ring))',
                backgroundColor: 'hsl(var(--background))',
                '--tw-ring-offset-color': `hsl(var(--${token.name}))`,
              }"
            />
          </div>
          <div class="space-y-1 bg-card p-3 text-xs">
            <p class="font-semibold">
              {{ token.name }}
            </p>
            <p class="font-mono text-muted-foreground">
              --{{ token.name }}: hsl({{ rawValues[token.name] }})
            </p>
            <p v-if="token.pair" class="font-mono text-muted-foreground">
              --{{ token.pair }}: hsl({{ rawValues[token.pair] }})
            </p>
            <p class="font-mono">
              {{ token.tailwind }}
            </p>
            <p v-if="token.note" class="text-muted-foreground italic">
              {{ token.note }}
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { cn } from '@/lib/utils'

withDefaults(
  defineProps<{
    variant?: 'light' | 'dark'
  }>(),
  {
    variant: 'light',
  }
)

interface TokenInfo {
  name: string
  pair?: string
  tailwind: string
  note?: string
}

interface TokenGroup {
  title: string
  tokens: TokenInfo[]
}

const groups: TokenGroup[] = [
  {
    title: 'Superfici',
    tokens: [
      { name: 'background', pair: 'foreground', tailwind: 'bg-background' },
      { name: 'card', pair: 'card-foreground', tailwind: 'bg-card' },
      { name: 'popover', pair: 'popover-foreground', tailwind: 'bg-popover' },
    ],
  },
  {
    title: 'Brand & Neutri',
    tokens: [
      { name: 'primary', pair: 'primary-foreground', tailwind: 'bg-primary' },
      { name: 'secondary', pair: 'secondary-foreground', tailwind: 'bg-secondary' },
      { name: 'muted', pair: 'muted-foreground', tailwind: 'bg-muted' },
      { name: 'accent', pair: 'accent-foreground', tailwind: 'bg-accent' },
    ],
  },
  {
    title: 'Azione',
    tokens: [
      {
        name: 'destructive',
        pair: 'destructive-foreground',
        tailwind: 'bg-destructive',
      },
    ],
  },
  {
    title: 'Contorni & Focus',
    tokens: [
      { name: 'border', tailwind: 'border-border', note: 'non ha foreground proprio' },
      { name: 'input', tailwind: 'border-input', note: 'non ha foreground proprio' },
      {
        name: 'ring',
        tailwind: 'ring-ring',
        note: 'anello di focus: 0 0 0 2px',
      },
    ],
  },
  {
    title: 'Stato',
    tokens: [
      { name: 'success', pair: 'success-foreground', tailwind: 'bg-success' },
      { name: 'warning', pair: 'warning-foreground', tailwind: 'bg-warning' },
      { name: 'info', pair: 'info-foreground', tailwind: 'bg-info' },
    ],
  },
]

const root = ref<HTMLElement | null>(null)
const rawValues = ref<Record<string, string>>({})

const tokenNames = computed(() =>
  groups.flatMap(group =>
    group.tokens.flatMap(token => (token.pair ? [token.name, token.pair] : [token.name]))
  )
)

function readValues() {
  if (!root.value) return
  const style = getComputedStyle(root.value)
  const next: Record<string, string> = {}
  for (const name of tokenNames.value) {
    next[name] = style.getPropertyValue(`--${name}`).trim()
  }
  rawValues.value = next
}

onMounted(readValues)
</script>

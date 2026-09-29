import type { Meta, StoryObj } from '@storybook/vue3'
import { expect } from '@storybook/test'

import ColorPalette from './ColorPalette.vue'

const meta = {
  title: 'Fondamenta/Design Tokens/Colori',
  component: ColorPalette,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Tutte le palette di colore del design system, generate live dai token CSS in `src/tokens/index.css`. ' +
          'I valori `hsl(var(--token))` sono letti a runtime via `getComputedStyle`, cosi la panoramica resta ' +
          'sincronizzata con i token. `border`, `input` e `ring` non hanno una variante `-foreground`: ' +
          'il campione di testo usa `--foreground`.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['light', 'dark'],
    },
  },
} satisfies Meta<typeof ColorPalette>

export default meta

type Story = StoryObj<typeof meta>

export const Light: Story = {
  args: { variant: 'light' },
}

export const Dark: Story = {
  args: { variant: 'dark' },
}

export const Confronto: Story = {
  parameters: { controls: { disable: true } },
  render: args => ({
    components: { ColorPalette },
    setup: () => ({ args }),
    template: `
      <div class="flex flex-col gap-6">
        <div>
          <h2 class="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Light</h2>
          <div class="border border-border rounded-[var(--radius)]">
            <ColorPalette v-bind="args" variant="light" />
          </div>
        </div>
        <div>
          <h2 class="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Dark</h2>
          <div class="border border-border rounded-[var(--radius)]">
            <ColorPalette v-bind="args" variant="dark" />
          </div>
        </div>
      </div>
    `,
  }),
}

export const RenderizzaTuttiToken: Story = {
  ...Confronto,
  play: async ({ canvasElement }) => {
    const swatches = canvasElement.querySelectorAll('[data-slot="color-swatch"]')
    // 14 token per palette x 2 varianti (light + dark)
    expect(swatches.length).toBe(28)
  },
}

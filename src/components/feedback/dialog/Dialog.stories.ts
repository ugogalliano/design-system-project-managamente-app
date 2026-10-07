import { ref, type Component } from 'vue'
import { useForm } from 'vee-validate'
import type { Meta, StoryObj } from '@storybook/vue3'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/form/input/Input.vue'
import Dialog from './Dialog.vue'

const meta: Meta<typeof Dialog> = {
  title: 'Feedback/Dialog',
  component: Dialog,
  tags: ['autodocs'],
  argTypes: {
    dismissable: { control: 'boolean' },
  },
  args: {
    dismissable: true,
  },
}

export default meta
type Story = StoryObj<typeof meta>
type DialogArgs = InstanceType<typeof Dialog>['$props']

interface DialogStoryConfig {
  /** Markup for the `title` slot, replacing the default header. */
  title?: string
  /** Markup for the `default` (body) slot. */
  default?: string
  /** Markup for the `footer` slot. */
  footer?: string
  /** Markup for the `close-icon` slot. */
  closeIcon?: string
  /** Extra components available to the story template. */
  components?: Record<string, Component>
  /** Extra setup bindings merged into the story wrapper. Runs in setup context. */
  setup?: () => Record<string, unknown>
}

function dialogStory(config: DialogStoryConfig) {
  return (args: DialogArgs) => ({
    components: { Dialog, Button, ...config.components },
    setup() {
      const open = ref(false)
      const extra = config.setup?.() ?? {}
      return { args, open, ...extra }
    },
    template: `
      <Button @click="open = true">Apri dialogo</Button>
      <Dialog v-model:open="open" v-bind="args">
        ${config.title ? `<template #title>${config.title}</template>` : ''}
        ${config.default ?? ''}
        ${config.footer ? `<template #footer>${config.footer}</template>` : ''}
        ${config.closeIcon ? `<template #close-icon>${config.closeIcon}</template>` : ''}
      </Dialog>
    `,
  })
}

function dialogTemplate(body: string, footer?: string) {
  return dialogStory({ default: body, footer })
}

export const Default: Story = {
  args: {
    title: 'Impostazioni progetto',
    description: 'Modifica il nome e la visibilità della board condivisa.',
  },
  render: dialogTemplate(
    `<p class="text-sm text-muted-foreground">Le modifiche sono salvate automaticamente.</p>`,
    `
      <Button variant="ghost" @click="open = false">Annulla</Button>
      <Button @click="open = false">Salva</Button>
    `
  ),
}

export const ConfermaDestructive: Story = {
  name: 'Conferma distruttiva',
  args: {
    title: 'Elimina il progetto',
    description: 'Questa azione non può essere annullata.',
  },
  render: dialogTemplate(
    `<p class="text-sm text-muted-foreground">Tutti i task e gli allegati verranno rimossi in modo permanente.</p>`,
    `
      <Button variant="ghost" @click="open = false">Annulla</Button>
      <Button variant="destructive" @click="open = false">Elimina</Button>
    `
  ),
}

export const SoloTitolo: Story = {
  name: 'Solo titolo',
  args: {
    title: 'Anteprima veloce',
  },
  render: dialogTemplate(
    `<p class="text-sm text-muted-foreground">Nessuna descrizione, nessuna azione di footer.</p>`
  ),
}

export const SlotTitle: Story = {
  name: 'Slot title personalizzato',
  args: {
    title: undefined,
    description: undefined,
  },
  render: dialogStory({
    title: `
      <div class="flex flex-col gap-1.5 pr-8">
        <h2 class="text-lg font-bold text-card-foreground">Archivia il progetto</h2>
        <p class="text-sm text-muted-foreground">
          Rimosso dalla board attiva, recuperabile in qualsiasi momento dall'archivio.
        </p>
      </div>
    `,
    default: `<p class="text-sm text-muted-foreground">Lo slot title sostituisce l'header predefinito.</p>`,
    footer: `
      <Button variant="ghost" @click="open = false">Annulla</Button>
      <Button @click="open = false">Archivia</Button>
    `,
  }),
}

export const SlotDefault: Story = {
  name: 'Slot default con Input',
  args: {
    title: 'Rinomina il progetto',
    description: 'Il nuovo nome è visibile a tutti i membri della board.',
  },
  render: dialogStory({
    default: `
      <Input
        name="projectName"
        label="Nome progetto"
        description="Usa lettere e numeri, massimo 40 caratteri."
        required
      />
    `,
    footer: `
      <Button variant="ghost" @click="open = false">Annulla</Button>
      <Button @click="open = false">Salva</Button>
    `,
    components: { Input },
    setup: () => {
      useForm({ initialValues: { projectName: 'Board Q4' } })
      return {}
    },
  }),
}

export const SlotFooter: Story = {
  name: 'Slot footer personalizzato',
  args: {
    title: 'Impostazioni di notifica',
    description: 'Le preferenze si applicano a tutti i progetti in cui sei membro.',
  },
  render: dialogStory({
    default: `<p class="text-sm text-muted-foreground">Il footer non contiene solo pulsanti: testo e azioni convivono.</p>`,
    footer: `
      <div class="flex w-full items-center justify-between gap-4">
        <span class="text-sm text-muted-foreground">Modifiche salvate localmente</span>
        <span class="flex items-center gap-2">
          <Button variant="ghost" @click="open = false">Annulla</Button>
          <Button @click="open = false">Salva</Button>
        </span>
      </div>
    `,
  }),
}

export const SlotCloseIcon: Story = {
  name: 'Slot close-icon personalizzato',
  args: {
    title: 'Torna alla board',
    description: 'Il pulsante di chiusura usa un simbolo custom via lo slot close-icon.',
  },
  render: dialogStory({
    default: `<p class="text-sm text-muted-foreground">Nessuna libreria di icone: SVG inline nel markup della story.</p>`,
    closeIcon: `
      <svg
        class="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M19 12H5" />
        <path d="m12 19-7-7 7-7" />
      </svg>
    `,
  }),
}

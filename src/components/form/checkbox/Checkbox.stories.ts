import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import Checkbox from './Checkbox.vue'

const meta: Meta<typeof Checkbox> = {
  title: 'Form/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  argTypes: {
    name: { control: 'text' },
    label: { control: 'text' },
    description: { control: 'text' },
    size: { control: 'select', options: ['sm', 'default', 'lg'] },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    required: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    id: { control: 'text' },
    rules: { control: 'text' },
    modelValue: { control: 'boolean' },
  },
  args: {
    name: 'active',
    label: 'Progetto attivo',
    size: 'default',
    disabled: false,
    invalid: false,
    required: false,
    indeterminate: false,
  },
}

export default meta
type Story = StoryObj<typeof meta>
type CheckboxArgs = InstanceType<typeof Checkbox>['$props']

function renderInForm(initialValues: Record<string, unknown>, validationSchema?: unknown) {
  return (args: CheckboxArgs) => ({
    components: { Checkbox },
    setup() {
      useForm({ initialValues, validationSchema: validationSchema as never })
      return { args }
    },
    template: `<Checkbox v-bind="args" />`,
  })
}

export const Default: Story = {
  args: {
    name: 'active',
    label: 'Progetto attivo',
  },
  render: renderInForm({ active: false }),
}

export const Checked: Story = {
  args: {
    name: 'active',
    label: 'Progetto attivo',
    modelValue: true,
  },
  render: renderInForm({ active: true }),
}

export const Indeterminate: Story = {
  args: {
    name: 'active',
    label: 'Alcuni task completati',
    indeterminate: true,
  },
  render: renderInForm({ active: false }),
}

export const Disabled: Story = {
  args: {
    name: 'active',
    label: 'Progetto attivo',
    disabled: true,
    modelValue: true,
  },
  render: renderInForm({ active: true }),
}

export const Invalid: Story = {
  args: {
    name: 'active',
    label: 'Progetto attivo',
    invalid: true,
    description: 'Stato non valido',
  },
  render: renderInForm({ active: false }),
}

export const WithDescription: Story = {
  args: {
    name: 'notify',
    label: 'Notifica i referenti',
    description: 'Invia una email ai referenti a ogni cambio di stato del progetto.',
  },
  render: renderInForm({ notify: false }),
}

const termsSchema = toTypedSchema(
  z.object({
    terms: z.boolean().refine(value => value === true, 'Devi accettare i termini per proseguire'),
  })
)

export const WithValidation: Story = {
  args: {
    name: 'terms',
    label: 'Accetto i termini di servizio',
    required: true,
  },
  render: renderInForm({ terms: false }, termsSchema),
}

export const FullForm: Story = {
  name: 'Full form',
  render: () => ({
    components: { Checkbox },
    setup() {
      const schema = toTypedSchema(
        z.object({
          active: z.boolean(),
          notify: z.boolean(),
          terms: z.boolean().refine(value => value === true, 'Devi accettare i termini'),
        })
      )
      const initialValues = { active: false, notify: false, terms: false }
      const submitted = ref<Record<string, unknown> | null>(null)

      const { handleSubmit } = useForm({
        initialValues,
        validationSchema: schema,
      })

      const onSubmit = handleSubmit(values => {
        submitted.value = values
      })

      const submitClasses = cn(
        'h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
      )

      return { submitted, onSubmit, submitClasses }
    },
    template: `
      <form class="flex w-96 flex-col gap-4" @submit="onSubmit">
        <Checkbox name="active" label="Progetto attivo" />
        <Checkbox
          name="notify"
          label="Notifica i referenti"
          description="Invia una email a ogni cambio di stato."
        />
        <Checkbox name="terms" label="Accetto i termini di servizio" required />
        <button type="submit" :class="submitClasses" data-slot="form-submit">Invia</button>
        <pre
          v-if="submitted"
          class="rounded-md bg-muted p-3 text-xs text-muted-foreground"
        >{{ JSON.stringify(submitted, null, 2) }}</pre>
      </form>
    `,
  }),
}

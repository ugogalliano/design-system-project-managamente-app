import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import RadioGroup from './RadioGroup.vue'

const priorityOptions = [
  { value: 'bassa', label: 'Bassa' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' },
  { value: 'critica', label: 'Critica', disabled: true },
]

const statusOptions = [
  { value: 'pianificazione', label: 'In pianificazione' },
  { value: 'in-corso', label: 'In corso' },
  { value: 'in-revisione', label: 'In revisione' },
  { value: 'completato', label: 'Completato' },
]

const meta: Meta<typeof RadioGroup> = {
  title: 'Form/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
  argTypes: {
    name: { control: 'text' },
    options: { control: 'object' },
    label: { control: 'text' },
    description: { control: 'text' },
    size: { control: 'select', options: ['sm', 'default', 'lg'] },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    required: { control: 'boolean' },
    orientation: { control: 'select', options: ['vertical', 'horizontal'] },
    loop: { control: 'boolean' },
    id: { control: 'text' },
    rules: { control: 'text' },
    modelValue: { control: 'text' },
  },
  args: {
    name: 'priority',
    options: priorityOptions,
    label: 'Priorità',
    size: 'default',
    disabled: false,
    invalid: false,
    required: false,
    orientation: 'vertical',
    loop: true,
  },
}

export default meta
type Story = StoryObj<typeof meta>
type RadioGroupArgs = InstanceType<typeof RadioGroup>['$props']

function renderInForm(initialValues: Record<string, unknown>, validationSchema?: unknown) {
  return (args: RadioGroupArgs) => ({
    components: { RadioGroup },
    setup() {
      useForm({ initialValues, validationSchema: validationSchema as never })
      return { args }
    },
    template: `<RadioGroup v-bind="args" />`,
  })
}

export const Default: Story = {
  args: {
    name: 'priority',
    options: priorityOptions,
    label: 'Priorità',
  },
  render: renderInForm({ priority: '' }),
}

export const Horizontal: Story = {
  args: {
    name: 'priority',
    options: priorityOptions,
    label: 'Priorità',
    orientation: 'horizontal',
  },
  render: renderInForm({ priority: 'media' }),
}

export const Disabled: Story = {
  args: {
    name: 'priority',
    options: priorityOptions,
    label: 'Priorità',
    disabled: true,
  },
  render: renderInForm({ priority: 'media' }),
}

export const Invalid: Story = {
  args: {
    name: 'priority',
    options: priorityOptions,
    label: 'Priorità',
    invalid: true,
  },
  render: renderInForm({ priority: '' }),
}

export const WithDescription: Story = {
  args: {
    name: 'status',
    options: statusOptions,
    label: 'Stato progetto',
    description: 'Lo stato viene mostrato nella board e nelle notifiche ai referenti.',
  },
  render: renderInForm({ status: '' }),
}

const statusSchema = toTypedSchema(
  z.object({
    status: z.string().min(1, 'Seleziona lo stato del progetto'),
  })
)

export const WithValidation: Story = {
  args: {
    name: 'status',
    options: statusOptions,
    label: 'Stato progetto',
    required: true,
  },
  render: renderInForm({ status: '' }, statusSchema),
}

export const FullForm: Story = {
  name: 'Full form',
  render: () => ({
    components: { RadioGroup },
    setup() {
      const schema = toTypedSchema(
        z.object({
          status: z.string().min(1, 'Seleziona lo stato del progetto'),
          priority: z.string().min(1, 'Seleziona la priorità'),
        })
      )
      const initialValues = { status: '', priority: '' }
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

      return {
        submitted,
        onSubmit,
        submitClasses,
        statusOptions,
        priorityOptions,
      }
    },
    template: `
      <form class="flex w-96 flex-col gap-4" @submit="onSubmit">
        <RadioGroup
          name="status"
          label="Stato progetto"
          :options="statusOptions"
          required
        />
        <RadioGroup
          name="priority"
          label="Priorità"
          :options="priorityOptions"
          orientation="horizontal"
          required
        />
        <button type="submit" :class="submitClasses" data-slot="form-submit">Invia</button>
        <pre
          v-if="submitted"
          class="rounded-md bg-muted p-3 text-xs text-muted-foreground"
        >{{ JSON.stringify(submitted, null, 2) }}</pre>
      </form>
    `,
  }),
}

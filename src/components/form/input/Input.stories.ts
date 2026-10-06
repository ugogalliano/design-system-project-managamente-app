import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import Input from './Input.vue'

const meta: Meta<typeof Input> = {
  title: 'Form/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    name: { control: 'text' },
    label: { control: 'text' },
    description: { control: 'text' },
    type: { control: 'text' },
    placeholder: { control: 'text' },
    size: { control: 'select', options: ['sm', 'default', 'lg'] },
    disabled: { control: 'boolean' },
    readonly: { control: 'boolean' },
    invalid: { control: 'boolean' },
    required: { control: 'boolean' },
    rules: { control: 'text' },
    modelValue: { control: 'text' },
  },
  args: {
    name: 'name',
    label: 'Nome',
    size: 'default',
    type: 'text',
    disabled: false,
    readonly: false,
    invalid: false,
    required: false,
  },
}

export default meta
type Story = StoryObj<typeof meta>
type InputArgs = InstanceType<typeof Input>['$props']

function renderInForm(initialValues: Record<string, unknown>, validationSchema?: unknown) {
  return (args: InputArgs) => ({
    components: { Input },
    setup() {
      useForm({ initialValues, validationSchema: validationSchema as never })
      return { args }
    },
    template: `<Input v-bind="args" />`,
  })
}

export const Default: Story = {
  args: {
    name: 'name',
    label: 'Nome',
    placeholder: 'Inserisci il nome del progetto',
  },
  render: renderInForm({ name: '' }),
}

export const Small: Story = {
  args: {
    name: 'name',
    label: 'Nome',
    size: 'sm',
    placeholder: 'Dimensione piccola',
  },
  render: renderInForm({ name: '' }),
}

export const Large: Story = {
  args: {
    name: 'name',
    label: 'Nome',
    size: 'lg',
    placeholder: 'Dimensione grande',
  },
  render: renderInForm({ name: '' }),
}

export const Disabled: Story = {
  args: {
    name: 'name',
    label: 'Nome',
    disabled: true,
    modelValue: 'Valore non modificabile',
  },
  render: renderInForm({ name: 'Valore non modificabile' }),
}

export const Readonly: Story = {
  args: {
    name: 'name',
    label: 'Nome',
    readonly: true,
    modelValue: 'Valore in sola lettura',
  },
  render: renderInForm({ name: 'Valore in sola lettura' }),
}

export const WithDescription: Story = {
  args: {
    name: 'name',
    label: 'Nome',
    description: 'Il nome verrà mostrato nella lista dei progetti.',
    placeholder: 'Inserisci il nome del progetto',
  },
  render: renderInForm({ name: '' }),
}

const emailSchema = toTypedSchema(
  z.object({
    email: z
      .string()
      .min(1, 'Campo obbligatorio')
      .check(z.email('Inserisci un indirizzo email valido')),
  })
)

export const WithValidation: Story = {
  args: {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'nome@azienda.it',
  },
  render: renderInForm({ email: '' }, emailSchema),
}

export const FullForm: Story = {
  name: 'Full form',
  render: () => ({
    components: { Input },
    setup() {
      const schema = toTypedSchema(
        z.object({
          projectName: z.string().min(1, 'Il nome del progetto è obbligatorio'),
          ownerEmail: z.string().min(1, 'Campo obbligatorio').check(z.email('Email non valida')),
          budget: z.string().min(1, 'Campo obbligatorio'),
        })
      )
      const initialValues = { projectName: '', ownerEmail: '', budget: '' }
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
        <Input name="projectName" label="Nome progetto" required />
        <Input name="ownerEmail" label="Email referente" type="email" required />
        <Input name="budget" label="Budget" type="number" required />
        <button type="submit" :class="submitClasses" data-slot="form-submit">Invia</button>
        <pre
          v-if="submitted"
          class="rounded-md bg-muted p-3 text-xs text-muted-foreground"
        >{{ JSON.stringify(submitted, null, 2) }}</pre>
      </form>
    `,
  }),
}

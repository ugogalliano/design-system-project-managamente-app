import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import Autocomplete from './Autocomplete.vue'

const projectOptions = [
  { value: 'redesign-portale-clienti', label: 'Redesign portale clienti' },
  { value: 'migrazione-aws', label: 'Migrazione AWS' },
  { value: 'crm-vendite', label: 'CRM vendite' },
  { value: 'app-mobile-field-service', label: 'App mobile field service' },
  { value: 'integrazione-pagamenti', label: 'Integrazione pagamenti' },
]

const contactOptions = [
  { value: 'mario.rossi', label: 'mario.rossi@azienda.it' },
  { value: 'giulia.bianchi', label: 'giulia.bianchi@azienda.it' },
  { value: 'luca.verdi', label: 'luca.verdi@azienda.it' },
]

const meta: Meta<typeof Autocomplete> = {
  title: 'Form/Autocomplete',
  component: Autocomplete,
  tags: ['autodocs'],
  argTypes: {
    name: { control: 'text' },
    options: { control: 'object' },
    label: { control: 'text' },
    description: { control: 'text' },
    placeholder: { control: 'text' },
    size: { control: 'select', options: ['sm', 'default', 'lg'] },
    disabled: { control: 'boolean' },
    readonly: { control: 'boolean' },
    required: { control: 'boolean' },
    invalid: { control: 'boolean' },
    id: { control: 'text' },
    rules: { control: 'text' },
    modelValue: { control: 'text' },
    openOnFocus: { control: 'boolean' },
    openOnClick: { control: 'boolean' },
    ignoreFilter: { control: 'boolean' },
  },
  args: {
    name: 'project',
    label: 'Progetto',
    size: 'default',
    disabled: false,
    readonly: false,
    required: false,
    invalid: false,
    openOnFocus: true,
    openOnClick: true,
    ignoreFilter: false,
  },
}

export default meta
type Story = StoryObj<typeof meta>
type AutocompleteArgs = InstanceType<typeof Autocomplete>['$props']

function renderInForm(initialValues: Record<string, unknown>, validationSchema?: unknown) {
  return (args: AutocompleteArgs) => ({
    components: { Autocomplete },
    setup() {
      useForm({ initialValues, validationSchema: validationSchema as never })
      return { args }
    },
    template: `<Autocomplete v-bind="args" />`,
  })
}

export const Default: Story = {
  args: {
    name: 'project',
    label: 'Progetto',
    placeholder: 'Cerca un progetto',
    options: projectOptions,
  },
  render: renderInForm({ project: '' }),
}

export const WithDescription: Story = {
  args: {
    name: 'project',
    label: 'Progetto',
    description: 'Inizia a digitare per filtrare i progetti disponibili.',
    placeholder: 'Cerca un progetto',
    options: projectOptions,
  },
  render: renderInForm({ project: '' }),
}

export const Small: Story = {
  args: {
    name: 'project',
    label: 'Progetto',
    size: 'sm',
    placeholder: 'Dimensione piccola',
    options: projectOptions,
  },
  render: renderInForm({ project: '' }),
}

export const Large: Story = {
  args: {
    name: 'project',
    label: 'Progetto',
    size: 'lg',
    placeholder: 'Dimensione grande',
    options: projectOptions,
  },
  render: renderInForm({ project: '' }),
}

export const Disabled: Story = {
  args: {
    name: 'project',
    label: 'Progetto',
    disabled: true,
    options: projectOptions,
  },
  render: renderInForm({ project: 'Migrazione AWS' }),
}

export const Readonly: Story = {
  args: {
    name: 'project',
    label: 'Progetto',
    readonly: true,
    options: projectOptions,
  },
  render: renderInForm({ project: 'Migrazione AWS' }),
}

const projectSchema = toTypedSchema(
  z.object({
    project: z.string().min(1, 'Seleziona un progetto'),
  })
)

export const WithValidation: Story = {
  args: {
    name: 'project',
    label: 'Progetto',
    placeholder: 'Cerca un progetto',
    options: projectOptions,
  },
  render: renderInForm({ project: '' }, projectSchema),
}

export const FullForm: Story = {
  name: 'Full form',
  render: () => ({
    components: { Autocomplete },
    setup() {
      const schema = toTypedSchema(
        z.object({
          project: z.string().min(1, 'Il progetto è obbligatorio'),
          owner: z
            .string()
            .min(1, 'Il referente è obbligatorio')
            .check(z.email('Email non valida')),
        })
      )
      const initialValues = {
        project: '',
        owner: '',
      }

      const { handleSubmit } = useForm({
        validationSchema: schema,
        initialValues: initialValues,
      })

      const submitted = ref<Record<string, unknown> | null>(null)

      const onSubmit = handleSubmit(values => {
        submitted.value = values as Record<string, unknown>
      })

      const submitClasses = cn(
        'h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
      )

      return {
        onSubmit,
        submitted,
        submitClasses,
        projectOptions,
        contactOptions,
      }
    },
    template: `
      <form @submit="onSubmit">
        <div class="flex w-96 flex-col gap-4">
          <Autocomplete
            name="project"
            label="Progetto"
            placeholder="Cerca un progetto"
            :options="projectOptions"
          />
          <Autocomplete
            name="owner"
            label="Referente"
            placeholder="Cerca un referente"
            :options="contactOptions"
          />
          <button type="submit" :class="submitClasses" data-slot="form-submit">Invia</button>
          <pre
            v-if="submitted"
            class="rounded-md bg-muted p-3 text-xs text-muted-foreground"
          >{{ JSON.stringify(submitted, null, 2) }}</pre>
        </div>
      </form>
    `,
  }),
}

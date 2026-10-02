import type { Meta, StoryObj } from '@storybook/vue3'
import Button from './Button.vue'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'destructive'] },
    type: { control: 'select', options: ['button', 'submit', 'reset'] },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    variant: 'primary',
    type: 'button',
    loading: false,
    disabled: false,
  },
}

export default meta
type Story = StoryObj<typeof meta>
type ButtonArgs = InstanceType<typeof Button>['$props']

function renderWithLabel(label: string) {
  return (args: ButtonArgs) => ({
    components: { Button },
    setup() {
      return { args }
    },
    template: `<Button v-bind="args">${label}</Button>`,
  })
}

export const Primary: Story = {
  args: { variant: 'primary' },
  render: renderWithLabel('Crea board'),
}

export const Secondary: Story = {
  args: { variant: 'secondary' },
  render: renderWithLabel('Membri'),
}

export const Ghost: Story = {
  args: { variant: 'ghost' },
  render: renderWithLabel('Rinomina'),
}

export const Destructive: Story = {
  args: { variant: 'destructive' },
  render: renderWithLabel('Elimina'),
}

export const Loading: Story = {
  args: { loading: true },
  render: renderWithLabel('Salva'),
}

export const Disabled: Story = {
  args: { disabled: true },
  render: renderWithLabel('Crea board'),
}

export const FullWidth: Story = {
  name: 'Full width',
  render: (args: ButtonArgs) => ({
    components: { Button },
    setup() {
      return { args }
    },
    template: `<Button v-bind="args" class="w-full">Accedi</Button>`,
  }),
}

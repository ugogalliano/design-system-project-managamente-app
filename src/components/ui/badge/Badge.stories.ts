import type { Meta, StoryObj } from '@storybook/vue3'
import Badge from './Badge.vue'

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['owner', 'editor', 'viewer'] },
  },
  args: {
    variant: 'viewer',
  },
}

export default meta
type Story = StoryObj<typeof meta>
type BadgeArgs = InstanceType<typeof Badge>['$props']

function renderWithLabel(label: string) {
  return (args: BadgeArgs) => ({
    components: { Badge },
    setup() {
      return { args }
    },
    template: `<Badge v-bind="args">${label}</Badge>`,
  })
}

export const Owner: Story = {
  args: { variant: 'owner' },
  render: renderWithLabel('Proprietario'),
}

export const Editor: Story = {
  args: { variant: 'editor' },
  render: renderWithLabel('Editor'),
}

export const Viewer: Story = {
  args: { variant: 'viewer' },
  render: renderWithLabel('Spettatore'),
}

export const WithDot: Story = {
  name: 'Con pallino',
  args: { variant: 'editor' },
  render: (args: BadgeArgs) => ({
    components: { Badge },
    setup() {
      return { args }
    },
    template: `<Badge v-bind="args"><span class="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true"></span>Live</Badge>`,
  }),
}

export const Custom: Story = {
  render: (args: BadgeArgs) => ({
    components: { Badge },
    setup() {
      return { args }
    },
    template: `<Badge v-bind="args" class="bg-success text-success-foreground">Approvato</Badge>`,
  }),
}

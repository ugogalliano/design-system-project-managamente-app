import type { Preview } from '@storybook/vue3'
import '../src/tokens/index.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
    },
    layout: 'centered',
    options: {
      storySort: {
        order: ['Fondamenta', 'UI', 'Feedback', 'Form', 'Navigation', 'Data Display', 'Layout'],
      },
    },
  },
  globalTypes: {
    theme: {
      description: 'Tema del design system (darkMode: class)',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { title: 'Light', value: 'light' },
          { title: 'Dark', value: 'dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (story, context) => {
      const isDark = context.globals.theme === 'dark'
      document
        .getElementById('storybook-root')
        ?.classList.toggle('dark', isDark)
      return story()
    },
  ],
}

export default preview

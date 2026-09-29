import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { flushPromises, mountWithForm, toTypedSchema } from '../../../../tests/utils.ts'
import RadioGroup from './RadioGroup.vue'

const options = [
  { value: 'bassa', label: 'Bassa' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' },
]

const prioritySchema = toTypedSchema(
  z.object({
    priority: z.string().min(1, 'Seleziona una priorità'),
  })
)

describe('RadioGroup', () => {
  it('renders the options with linked labels and data-slots', () => {
    const wrapper = mountWithForm(RadioGroup, {
      props: { name: 'priority', label: 'Priorità', options },
    })

    const group = wrapper.find('[data-slot="radio-group"]')
    const items = wrapper.findAll('[data-slot="radio-group-item"]')
    const labels = wrapper.findAll('label')

    expect(group.exists()).toBe(true)
    expect(group.attributes('role')).toBe('radiogroup')
    expect(items.length).toBe(3)
    expect(labels.length).toBe(3)
    expect(labels[0].attributes('for')).toBe(items[0].attributes('id'))
    expect(labels[0].text()).toBe('Bassa')
    expect(wrapper.find('[data-slot="radio-group-label"]').text()).toContain('Priorità')
  })

  it('emits update:modelValue when an option is selected', async () => {
    const wrapper = mountWithForm(RadioGroup, {
      props: { name: 'priority', options },
      initialValues: { priority: '' },
    })
    const items = wrapper.findAll('[data-slot="radio-group-item"]')

    await items[1].trigger('click')
    await flushPromises()

    expect(wrapper.findComponent(RadioGroup).emitted('update:modelValue')).toContainEqual(['media'])
    expect(items[1].attributes('data-state')).toBe('checked')
    expect(items[1].attributes('aria-checked')).toBe('true')
  })

  it('moves the selection with the arrow keys', async () => {
    const wrapper = mountWithForm(RadioGroup, {
      props: { name: 'priority', options },
      initialValues: { priority: 'bassa' },
      attachTo: document.body,
    })
    const items = wrapper.findAll('[data-slot="radio-group-item"]')

    await flushPromises()

    ;(items[0].element as HTMLElement).focus()
    expect(document.activeElement).toBe(items[0].element)

    await items[0].trigger('keydown', { key: 'ArrowDown' })
    await flushPromises()

    await vi.waitFor(() => {
      expect(wrapper.findComponent(RadioGroup).emitted('update:modelValue')).toContainEqual([
        'media',
      ])
    })

    expect(items[1].attributes('data-state')).toBe('checked')
    expect(document.activeElement).toBe(items[1].element)
  })

  it('prevents interaction when disabled', async () => {
    const wrapper = mountWithForm(RadioGroup, {
      props: { name: 'priority', options, disabled: true },
      initialValues: { priority: '' },
    })
    const items = wrapper.findAll('[data-slot="radio-group-item"]')

    expect(items[0].attributes()).toHaveProperty('disabled')

    await items[0].trigger('click')
    await flushPromises()

    expect(wrapper.findComponent(RadioGroup).emitted('update:modelValue')).toBeUndefined()
  })

  it('shows a form-level Zod error after blur and marks the group invalid', async () => {
    const wrapper = mountWithForm(RadioGroup, {
      props: { name: 'priority', label: 'Priorità', options },
      initialValues: { priority: '' },
      validationSchema: prioritySchema as unknown as Record<string, unknown>,
    })
    const group = wrapper.find('[data-slot="radio-group"]')
    const item = wrapper.find('[data-slot="radio-group-item"]')

    expect(group.attributes('aria-invalid')).toBeUndefined()

    await item.trigger('blur')
    await flushPromises()

    await vi.waitFor(() => {
      expect(wrapper.find('[data-slot="radio-group-error"]').exists()).toBe(true)
    })

    expect(wrapper.find('[data-slot="radio-group-error"]').text()).toBe('Seleziona una priorità')
    expect(group.attributes('aria-invalid')).toBe('true')
    expect(item.classes()).toContain('border-destructive')
  })

  it('links description and error ids through aria-describedby', async () => {
    const wrapper = mountWithForm(RadioGroup, {
      props: { name: 'priority', label: 'Priorità', options, description: 'Scegli una priorità' },
      initialValues: { priority: '' },
      validationSchema: prioritySchema as unknown as Record<string, unknown>,
    })
    const group = wrapper.find('[data-slot="radio-group"]')

    expect(group.attributes('aria-describedby')).toBe('priority-description')

    await wrapper.find('[data-slot="radio-group-item"]').trigger('blur')
    await flushPromises()

    await vi.waitFor(() => {
      expect(group.attributes('aria-describedby')).toBe('priority-error')
    })

    expect(wrapper.find('[data-slot="radio-group-error"]').attributes('id')).toBe('priority-error')
  })
})

import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { flushPromises, mountWithForm, toTypedSchema } from '../../../../tests/utils.ts'
import Checkbox from './Checkbox.vue'

const termsSchema = toTypedSchema(
  z.object({
    terms: z.boolean().refine(value => value === true, 'Devi accettare i termini'),
  })
)

describe('Checkbox', () => {
  it('renders label, checkbox and description with linked ids and data-slots', () => {
    const wrapper = mountWithForm(Checkbox, {
      props: { name: 'active', label: 'Progetto attivo', description: 'Visibile in board' },
    })

    const checkbox = wrapper.find('[data-slot="checkbox"]')
    const label = wrapper.find('[data-slot="checkbox-label"]')
    const description = wrapper.find('[data-slot="checkbox-description"]')

    expect(wrapper.find('[data-slot="checkbox-field"]').exists()).toBe(true)
    expect(checkbox.exists()).toBe(true)
    expect(checkbox.attributes('role')).toBe('checkbox')
    expect(checkbox.attributes('id')).toBe('active')
    expect(label.attributes('for')).toBe('active')
    expect(description.attributes('id')).toBe('active-description')
    expect(checkbox.attributes('aria-describedby')).toBe('active-description')
  })

  it('emits update:modelValue when toggled by click', async () => {
    const wrapper = mountWithForm(Checkbox, {
      props: { name: 'active', label: 'Progetto attivo' },
      initialValues: { active: false },
    })
    const checkbox = wrapper.find('[data-slot="checkbox"]')

    expect(checkbox.attributes('aria-checked')).toBe('false')

    await checkbox.trigger('click')
    await flushPromises()

    expect(wrapper.findComponent(Checkbox).emitted('update:modelValue')).toEqual([[true]])
    expect(checkbox.attributes('aria-checked')).toBe('true')
  })

  it('supports v-model through the modelValue prop', async () => {
    const wrapper = mountWithForm(Checkbox, {
      props: { name: 'active', label: 'Progetto attivo', modelValue: true },
      initialValues: { active: true },
    })
    const checkbox = wrapper.find('[data-slot="checkbox"]')

    expect(checkbox.attributes('aria-checked')).toBe('true')

    await checkbox.trigger('click')
    await flushPromises()

    expect(wrapper.findComponent(Checkbox).emitted('update:modelValue')).toEqual([[false]])
  })

  it('prevents interaction when disabled', async () => {
    const wrapper = mountWithForm(Checkbox, {
      props: { name: 'active', label: 'Progetto attivo', disabled: true },
    })
    const checkbox = wrapper.find('[data-slot="checkbox"]')

    expect(checkbox.attributes()).toHaveProperty('disabled')
    expect(checkbox.attributes('data-disabled')).toBe('')
    expect(checkbox.classes()).toContain('disabled:opacity-50')

    await checkbox.trigger('click')
    await flushPromises()

    expect(wrapper.findComponent(Checkbox).emitted('update:modelValue')).toBeUndefined()
  })

  it('renders the indeterminate state with a mixed value', () => {
    const wrapper = mountWithForm(Checkbox, {
      props: { name: 'active', label: 'Alcuni task completati', indeterminate: true },
    })
    const checkbox = wrapper.find('[data-slot="checkbox"]')

    expect(checkbox.attributes('aria-checked')).toBe('mixed')
    expect(checkbox.attributes('data-state')).toBe('indeterminate')
    expect(wrapper.find('[data-slot="checkbox-indicator"]').exists()).toBe(true)
  })

  it('shows a form-level Zod error after blur and marks the field invalid', async () => {
    const wrapper = mountWithForm(Checkbox, {
      props: { name: 'terms', label: 'Accetto i termini' },
      initialValues: { terms: false },
      validationSchema: termsSchema as unknown as Record<string, unknown>,
    })
    const checkbox = wrapper.find('[data-slot="checkbox"]')

    expect(checkbox.attributes('aria-invalid')).toBeUndefined()

    await checkbox.trigger('blur')
    await flushPromises()

    await vi.waitFor(() => {
      expect(wrapper.find('[data-slot="checkbox-error"]').exists()).toBe(true)
    })

    expect(wrapper.find('[data-slot="checkbox-error"]').text()).toBe('Devi accettare i termini')
    expect(checkbox.attributes('aria-invalid')).toBe('true')
    expect(checkbox.classes()).toContain('border-destructive')
  })

  it('points aria-describedby to the error id when an error is present', async () => {
    const wrapper = mountWithForm(Checkbox, {
      props: { name: 'terms', label: 'Accetto i termini' },
      initialValues: { terms: false },
      validationSchema: termsSchema as unknown as Record<string, unknown>,
    })
    const checkbox = wrapper.find('[data-slot="checkbox"]')

    await checkbox.trigger('blur')
    await flushPromises()

    await vi.waitFor(() => {
      expect(checkbox.attributes('aria-describedby')).toBe('terms-error')
    })

    expect(wrapper.find('[data-slot="checkbox-error"]').attributes('id')).toBe('terms-error')
  })

  it('forwards extra attributes to the checkbox element', () => {
    const wrapper = mountWithForm(Checkbox, {
      props: { name: 'active' },
      attrs: { 'data-test': 'field', 'aria-label': 'Progetto attivo' },
    })
    const checkbox = wrapper.find('[data-slot="checkbox"]')

    expect(checkbox.attributes('data-test')).toBe('field')
    expect(checkbox.attributes('aria-label')).toBe('Progetto attivo')
  })
})

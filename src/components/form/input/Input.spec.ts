import { describe, expect, it, vi } from 'vitest'
import { defineRule } from 'vee-validate'
import { z } from 'zod'
import { flushPromises, mountWithForm, toTypedSchema } from '../../../../tests/utils.ts'
import Input from './Input.vue'

defineRule('required', (value: unknown) => {
  if (value === undefined || value === null || value === '') return 'Campo obbligatorio'
  return true
})

const emailSchema = toTypedSchema(
  z.object({
    email: z.string().min(1, 'Campo obbligatorio').check(z.email('Email non valida')),
  })
)

describe('Input', () => {
  it('renders label, input and description with linked ids', () => {
    const wrapper = mountWithForm(Input, {
      props: { name: 'email', label: 'Email', description: 'Inserisci la tua email' },
    })

    const label = wrapper.find('[data-slot="input-label"]')
    const input = wrapper.find('[data-slot="input"]')
    const description = wrapper.find('[data-slot="input-description"]')

    expect(label.exists()).toBe(true)
    expect(input.exists()).toBe(true)
    expect(description.exists()).toBe(true)
    expect(label.attributes('for')).toBe('email')
    expect(input.attributes('id')).toBe('email')
    expect(input.attributes('name')).toBe('email')
    expect(description.attributes('id')).toBe('email-description')
    expect(input.attributes('aria-describedby')).toBe('email-description')
  })

  it('allows overriding the generated id', () => {
    const wrapper = mountWithForm(Input, {
      props: { name: 'email', id: 'custom-email' },
    })

    expect(wrapper.find('[data-slot="input"]').attributes('id')).toBe('custom-email')
  })

  it('shows a rule error after blur and marks the input invalid', async () => {
    const wrapper = mountWithForm(Input, {
      props: { name: 'email', label: 'Email', rules: 'required' },
    })
    const input = wrapper.find('[data-slot="input"]')

    expect(wrapper.find('[data-slot="input-error"]').exists()).toBe(false)

    await input.trigger('blur')
    await flushPromises()

    await vi.waitFor(() => {
      expect(wrapper.find('[data-slot="input-error"]').exists()).toBe(true)
    })

    expect(wrapper.find('[data-slot="input-error"]').text()).toBe('Campo obbligatorio')
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.classes()).toContain('border-destructive')
  })

  it('shows a form-level Zod schema error after blur', async () => {
    const wrapper = mountWithForm(Input, {
      props: { name: 'email', label: 'Email' },
      initialValues: { email: '' },
      validationSchema: emailSchema as unknown as Record<string, unknown>,
    })
    const input = wrapper.find('[data-slot="input"]')

    expect(input.attributes('aria-invalid')).toBeUndefined()

    await input.trigger('blur')
    await flushPromises()

    await vi.waitFor(() => {
      expect(wrapper.find('[data-slot="input-error"]').text()).toBe('Campo obbligatorio')
    })

    expect(input.attributes('aria-invalid')).toBe('true')
  })

  it('emits update:modelValue when the value changes', async () => {
    const wrapper = mountWithForm(Input, {
      props: { name: 'email', modelValue: '' },
      initialValues: { email: '' },
    })
    const input = wrapper.find('[data-slot="input"]')

    await input.setValue('ciao')
    await flushPromises()

    expect(wrapper.findComponent(Input).emitted('update:modelValue')).toEqual([['ciao']])
  })

  it('applies size classes from the size prop', () => {
    const sm = mountWithForm(Input, { props: { name: 'a', size: 'sm' } })
    const md = mountWithForm(Input, { props: { name: 'b' } })
    const lg = mountWithForm(Input, { props: { name: 'c', size: 'lg' } })

    expect(sm.find('[data-slot="input"]').classes()).toContain('h-8')
    expect(md.find('[data-slot="input"]').classes()).toContain('h-10')
    expect(lg.find('[data-slot="input"]').classes()).toContain('h-12')
  })

  it('applies invalid styles when the invalid prop is set', () => {
    const input = mountWithForm(Input, {
      props: { name: 'email', invalid: true },
    }).find('[data-slot="input"]')

    expect(input.classes()).toContain('border-destructive')
    expect(input.attributes('aria-invalid')).toBe('true')
  })

  it('forwards disabled and extra attributes to the native input', () => {
    const input = mountWithForm(Input, {
      props: { name: 'email', disabled: true },
      attrs: { autocomplete: 'email', 'data-test': 'field' },
    }).find('[data-slot="input"]')

    expect(input.attributes()).toHaveProperty('disabled')
    expect(input.attributes('autocomplete')).toBe('email')
    expect(input.attributes('data-test')).toBe('field')
  })

  it('points aria-describedby to the error id when an error is present', async () => {
    const wrapper = mountWithForm(Input, {
      props: { name: 'email', label: 'Email', rules: 'required' },
    })
    const input = wrapper.find('[data-slot="input"]')

    await input.trigger('blur')
    await flushPromises()

    await vi.waitFor(() => {
      expect(input.attributes('aria-describedby')).toBe('email-error')
    })

    expect(wrapper.find('[data-slot="input-error"]').attributes('id')).toBe('email-error')
  })
})

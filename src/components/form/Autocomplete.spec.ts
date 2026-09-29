import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { flushPromises, mountWithForm, toTypedSchema, type VueWrapper } from '../../../tests/utils'
import Autocomplete from './Autocomplete.vue'

const options = [
  { value: 'alpha', label: 'Progetto Alpha' },
  { value: 'beta', label: 'Progetto Beta' },
  { value: 'gamma', label: 'Progetto Gamma' },
]

function queryBody<T extends Element = HTMLElement>(selector: string): T | null {
  return document.body.querySelector<T>(selector)
}

function queryBodyAll(selector: string) {
  return document.body.querySelectorAll(selector)
}

function inputOf(wrapper: VueWrapper) {
  return wrapper.find('[data-slot="autocomplete-input"]')
}

async function openPopup(wrapper: VueWrapper) {
  const input = inputOf(wrapper)
  await input.trigger('focus')
  await flushPromises()
  return input
}

describe('Autocomplete', () => {
  it('renders label and input with linked ids and data-slots', () => {
    const wrapper = mountWithForm(Autocomplete, {
      props: { name: 'project', label: 'Progetto', options },
      attachTo: document.body,
    })

    const label = wrapper.find('[data-slot="autocomplete-label"]')
    const input = inputOf(wrapper)

    expect(wrapper.find('[data-slot="autocomplete"]').exists()).toBe(true)
    expect(label.exists()).toBe(true)
    expect(input.exists()).toBe(true)
    expect(label.attributes('for')).toBe('project')
    expect(input.attributes('id')).toBe('project')
    expect(input.attributes('name')).toBe('project')
  })

  it('opens the popup on focus and lists the options', async () => {
    const wrapper = mountWithForm(Autocomplete, {
      props: { name: 'project', label: 'Progetto', options },
      attachTo: document.body,
    })

    await openPopup(wrapper)

    expect(queryBody('[data-slot="autocomplete-content"]')).not.toBeNull()
    expect(queryBodyAll('[data-slot="autocomplete-item"]').length).toBe(3)
    expect(queryBody('[data-slot="autocomplete-item"]')?.textContent).toContain('Progetto Alpha')
  })

  it('filters the options while typing', async () => {
    const wrapper = mountWithForm(Autocomplete, {
      props: { name: 'project', label: 'Progetto', options },
      attachTo: document.body,
    })

    const input = await openPopup(wrapper)
    await input.setValue('Beta')
    await flushPromises()

    const items = queryBodyAll('[data-slot="autocomplete-item"]')

    expect(items.length).toBe(1)
    expect(items[0].textContent).toContain('Progetto Beta')
  })

  it('updates the field value when an option is selected', async () => {
    const wrapper = mountWithForm(Autocomplete, {
      props: { name: 'project', label: 'Progetto', options },
      attachTo: document.body,
    })

    const input = await openPopup(wrapper)
    const firstItem = queryBodyAll('[data-slot="autocomplete-item"]')[0] as HTMLElement

    firstItem.click()
    await flushPromises()

    expect(wrapper.findComponent(Autocomplete).emitted('update:modelValue')).toContainEqual([
      'Progetto Alpha',
    ])
    expect((input.element as HTMLInputElement).value).toBe('Progetto Alpha')
  })

  it('shows the empty state when no option matches the filter', async () => {
    const wrapper = mountWithForm(Autocomplete, {
      props: { name: 'project', label: 'Progetto', options },
      attachTo: document.body,
    })

    const input = await openPopup(wrapper)
    await input.setValue('inesistente')
    await flushPromises()

    const empty = queryBody('[data-slot="autocomplete-empty"]')

    expect(empty).not.toBeNull()
    expect(empty?.textContent).toContain('Nessun risultato')
    expect(queryBodyAll('[data-slot="autocomplete-item"]').length).toBe(0)
  })

  it('shows a form-level Zod error after blur and marks the input invalid', async () => {
    const schema = toTypedSchema(
      z.object({
        project: z.string().min(1, 'Seleziona un progetto'),
      })
    )

    const wrapper = mountWithForm(Autocomplete, {
      props: { name: 'project', label: 'Progetto', options },
      initialValues: { project: '' },
      validationSchema: schema as unknown as Record<string, unknown>,
      attachTo: document.body,
    })

    const input = inputOf(wrapper)

    expect(input.attributes('aria-invalid')).toBeUndefined()

    await input.trigger('blur')
    await flushPromises()

    await vi.waitFor(() => {
      expect(wrapper.find('[data-slot="autocomplete-error"]').exists()).toBe(true)
    })

    expect(wrapper.find('[data-slot="autocomplete-error"]').text()).toBe('Seleziona un progetto')
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('aria-describedby')).toBe('project-error')
    expect(input.classes()).toContain('border-destructive')
  })

  it('prevents interaction when disabled', async () => {
    const wrapper = mountWithForm(Autocomplete, {
      props: { name: 'project', label: 'Progetto', options, disabled: true },
      attachTo: document.body,
    })

    const input = inputOf(wrapper)

    expect(input.attributes()).toHaveProperty('disabled')

    await input.trigger('focus')
    await flushPromises()

    expect(queryBody('[data-slot="autocomplete-content"]')).toBeNull()
  })

  it('keeps the field readonly without opening the popup', async () => {
    const wrapper = mountWithForm(Autocomplete, {
      props: { name: 'project', label: 'Progetto', options, readonly: true },
      attachTo: document.body,
    })

    const input = inputOf(wrapper)

    expect(input.attributes()).toHaveProperty('readonly')

    await input.trigger('focus')
    await flushPromises()

    expect(queryBody('[data-slot="autocomplete-content"]')).toBeNull()
  })
})

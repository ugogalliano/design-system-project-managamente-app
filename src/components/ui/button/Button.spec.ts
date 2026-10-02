import { describe, expect, it, vi } from 'vitest'
import { mount } from '../../../../tests/utils.ts'
import Button from './Button.vue'

describe('Button', () => {
  it('renders the slot content with the design sizing', () => {
    const wrapper = mount(Button, { slots: { default: 'Crea board' } })

    expect(wrapper.attributes('data-slot')).toBe('button')
    expect(wrapper.text()).toBe('Crea board')
    expect(wrapper.classes()).toContain('h-10')
    expect(wrapper.classes()).toContain('gap-2')
    expect(wrapper.classes()).toContain('rounded-[8px]')
  })

  it('uses the primary variant by default', () => {
    const wrapper = mount(Button, { slots: { default: 'Crea board' } })

    expect(wrapper.classes()).toContain('bg-primary')
    expect(wrapper.classes()).toContain('text-primary-foreground')
  })

  it('applies the secondary, ghost and destructive variants', () => {
    const secondary = mount(Button, { props: { variant: 'secondary' } })
    const ghost = mount(Button, { props: { variant: 'ghost' } })
    const destructive = mount(Button, { props: { variant: 'destructive' } })

    expect(secondary.classes()).toContain('bg-secondary')
    expect(secondary.classes()).toContain('text-secondary-foreground')

    expect(ghost.classes()).toContain('bg-transparent')
    expect(ghost.classes()).toContain('border-border')
    expect(ghost.classes()).not.toContain('bg-primary')

    expect(destructive.classes()).toContain('bg-destructive')
    expect(destructive.classes()).toContain('text-destructive-foreground')
  })

  it('shows the spinner and marks the button busy while loading', () => {
    const wrapper = mount(Button, { props: { loading: true }, slots: { default: 'Salva' } })

    expect(wrapper.find('[data-slot="button-spinner"]').exists()).toBe(true)
    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.attributes()).toHaveProperty('disabled')
  })

  it('hides the spinner when not loading', () => {
    const wrapper = mount(Button, { slots: { default: 'Salva' } })

    expect(wrapper.find('[data-slot="button-spinner"]').exists()).toBe(false)
    expect(wrapper.attributes('aria-busy')).toBeUndefined()
  })

  it('disables the button with the design opacity and shows the focus ring', () => {
    const wrapper = mount(Button, { props: { disabled: true } })

    expect(wrapper.attributes()).toHaveProperty('disabled')
    expect(wrapper.classes()).toContain('disabled:opacity-[0.45]')
    expect(wrapper.classes()).toContain('focus-visible:ring-2')
  })

  it('defaults to type button and forwards the type prop', () => {
    expect(mount(Button).attributes('type')).toBe('button')
    expect(mount(Button, { props: { type: 'submit' } }).attributes('type')).toBe('submit')
  })

  it('merges consumer classes over the variant classes', () => {
    const wrapper = mount(Button, {
      props: { variant: 'ghost' },
      attrs: { class: 'w-full text-destructive' },
    })

    expect(wrapper.classes()).toContain('w-full')
    expect(wrapper.classes()).toContain('text-destructive')
    expect(wrapper.classes()).not.toContain('text-foreground')
  })

  it('forwards click listeners to the root button', async () => {
    const onClick = vi.fn()
    const wrapper = mount(Button, { attrs: { onClick }, slots: { default: 'Crea board' } })

    await wrapper.trigger('click')

    expect(onClick).toHaveBeenCalledOnce()
  })
})

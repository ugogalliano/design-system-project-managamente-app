import { describe, expect, it } from 'vitest'
import { mount } from '../../../../tests/utils.ts'
import Badge from './Badge.vue'

describe('Badge', () => {
  it('renders the slot content inside a span with the pill design', () => {
    const wrapper = mount(Badge, { slots: { default: 'Proprietario' } })

    expect(wrapper.element.tagName).toBe('SPAN')
    expect(wrapper.attributes('data-slot')).toBe('badge')
    expect(wrapper.text()).toBe('Proprietario')
    expect(wrapper.classes()).toContain('rounded-full')
    expect(wrapper.classes()).toContain('px-2.5')
    expect(wrapper.classes()).toContain('py-[3px]')
    expect(wrapper.classes()).toContain('text-xs')
    expect(wrapper.classes()).toContain('font-medium')
    expect(wrapper.classes()).toContain('inline-flex')
    expect(wrapper.classes()).toContain('items-center')
    expect(wrapper.classes()).toContain('gap-1')
    expect(wrapper.classes()).toContain('whitespace-nowrap')
  })

  it('uses the viewer variant by default', () => {
    const wrapper = mount(Badge, { slots: { default: 'Spettatore' } })

    expect(wrapper.attributes('data-variant')).toBe('viewer')
    expect(wrapper.classes()).toContain('bg-muted')
    expect(wrapper.classes()).toContain('text-foreground')
  })

  it('applies the owner and editor variants', () => {
    const owner = mount(Badge, { props: { variant: 'owner' } })
    const editor = mount(Badge, { props: { variant: 'editor' } })

    expect(owner.attributes('data-variant')).toBe('owner')
    expect(owner.classes()).toContain('bg-secondary')
    expect(owner.classes()).toContain('text-secondary-foreground')
    expect(owner.classes()).not.toContain('bg-muted')

    expect(editor.attributes('data-variant')).toBe('editor')
    expect(editor.classes()).toContain('bg-info')
    expect(editor.classes()).toContain('text-info-foreground')
    expect(editor.classes()).not.toContain('bg-secondary')
  })

  it('merges consumer classes over the variant classes via cn()', () => {
    const wrapper = mount(Badge, {
      props: { variant: 'viewer' },
      attrs: { class: 'bg-success text-success-foreground' },
    })

    expect(wrapper.classes()).toContain('bg-success')
    expect(wrapper.classes()).toContain('text-success-foreground')
    expect(wrapper.classes()).not.toContain('bg-muted')
    expect(wrapper.classes()).not.toContain('text-foreground')
  })

  it('forwards non-class attributes to the root span', () => {
    const wrapper = mount(Badge, {
      attrs: { id: 'role-badge', title: 'Ruolo del membro' },
      slots: { default: 'Editor' },
    })

    expect(wrapper.attributes('id')).toBe('role-badge')
    expect(wrapper.attributes('title')).toBe('Ruolo del membro')
  })
})

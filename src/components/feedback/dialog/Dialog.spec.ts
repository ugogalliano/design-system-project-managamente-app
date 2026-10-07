import { describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import Dialog from './Dialog.vue'

const TITLE = 'Elimina il progetto'
const DESCRIPTION = 'Questa azione non può essere annullata.'

function queryContent() {
  return document.body.querySelector('[data-slot="dialog-content"]')
}

function queryTitle() {
  return document.body.querySelector('[data-slot="dialog-title"]')
}

describe('Dialog', () => {
  it('renders title and description in the portal when open', async () => {
    mount(Dialog, {
      props: { open: true, title: TITLE, description: DESCRIPTION },
      slots: { default: '<p>Contenuto</p>' },
      attachTo: document.body,
    })

    await flushPromises()

    const content = queryContent()

    expect(content).not.toBeNull()
    expect(content?.getAttribute('role')).toBe('dialog')
    expect(content?.getAttribute('aria-modal')).toBe('true')
    expect(content?.textContent).toContain(TITLE)
    expect(content?.textContent).toContain(DESCRIPTION)
    expect(document.body.querySelector('[data-slot="dialog-overlay"]')).not.toBeNull()
  })

  it('does not render the content when closed', () => {
    mount(Dialog, {
      props: { open: false, title: TITLE, description: DESCRIPTION },
      attachTo: document.body,
    })

    expect(queryContent()).toBeNull()
  })

  it('populates the default and footer slots', async () => {
    mount(Dialog, {
      props: { open: true, title: TITLE, description: DESCRIPTION },
      slots: {
        default: '<p class="body-text">Muovi il task in Archivio</p>',
        footer: '<button type="button">Annulla</button>',
      },
      attachTo: document.body,
    })

    await flushPromises()

    const content = queryContent()

    expect(content?.querySelector('.body-text')?.textContent).toBe('Muovi il task in Archivio')
    expect(content?.querySelector('[data-slot="dialog-footer"]')?.textContent).toContain('Annulla')
  })

  it('emits update:open false when the close button is clicked', async () => {
    const wrapper = mount(Dialog, {
      props: { open: true, title: TITLE, description: DESCRIPTION },
      attachTo: document.body,
    })

    await flushPromises()

    const closeButton = document.body.querySelector<HTMLButtonElement>('[data-slot="dialog-close"]')

    expect(closeButton).not.toBeNull()
    expect(closeButton?.getAttribute('aria-label')).toBe('Chiudi')
    closeButton?.click()

    expect(wrapper.emitted('update:open')).toContainEqual([false])
  })

  // The backdrop click is not reliably testable in jsdom (pointer capture is stubbed),
  // so dismissal is exercised through the Escape keydown path instead.
  it('emits update:open false on Escape keydown', async () => {
    const wrapper = mount(Dialog, {
      props: { open: true, title: TITLE, description: DESCRIPTION },
      attachTo: document.body,
    })

    await flushPromises()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(wrapper.emitted('update:open')).toContainEqual([false])
  })

  it('does not emit update:open on Escape when dismissable is false', async () => {
    const wrapper = mount(Dialog, {
      props: { open: true, title: TITLE, description: DESCRIPTION, dismissable: false },
      attachTo: document.body,
    })

    await flushPromises()

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
    )
    expect(wrapper.emitted('update:open')).toBeUndefined()

    const content = queryContent()
    expect(content).not.toBeNull()
    expect(content?.getAttribute('role')).toBe('dialog')
    expect(content?.getAttribute('aria-modal')).toBe('true')
  })

  it('renders a visually hidden title when no title prop is provided', async () => {
    mount(Dialog, {
      props: { open: true, description: DESCRIPTION },
      slots: { default: '<p>Contenuto</p>' },
      attachTo: document.body,
    })

    await flushPromises()

    const content = queryContent()
    const title = queryTitle()

    expect(content).not.toBeNull()
    expect(title).not.toBeNull()
    expect(title?.className).toContain('sr-only')
  })
})

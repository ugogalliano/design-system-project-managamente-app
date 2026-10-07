import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '../../../../tests/utils.ts'
import Toaster from './Toaster.vue'
import { useToast } from '@/composables/useToast'

const store = useToast()

// jsdom exposes no CSS namespace; reka's own usePresence animationend listener
// calls CSS.escape, so a minimal fallback is needed for dispatched events.
const globalScope = globalThis as unknown as { CSS?: { escape: (value: string) => string } }
if (typeof globalScope.CSS?.escape !== 'function') {
  globalScope.CSS = { escape: (value: string) => String(value) }
}

function queryViewport() {
  return document.body.querySelector('[data-slot="toast-viewport"]')
}

function queryToast() {
  return document.body.querySelector('[data-slot="toast"]')
}

async function mountToaster() {
  mount(Toaster, { attachTo: document.body })
  await flushPromises()
}

function swipe(
  element: HTMLElement,
  moves: Array<{ x: number; y: number }>,
  direction: { x: number; y: number }
) {
  element.dispatchEvent(new PointerEvent('pointerdown', { clientX: 0, clientY: 0, bubbles: true }))
  moves.forEach(point => {
    element.dispatchEvent(
      new PointerEvent('pointermove', { clientX: point.x, clientY: point.y, bubbles: true })
    )
  })
  element.dispatchEvent(
    new PointerEvent('pointerup', { clientX: direction.x, clientY: direction.y, bubbles: true })
  )
}

beforeEach(() => {
  store.clear()
})

afterEach(() => {
  store.clear()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('useToast', () => {
  it('grows with toast() and empties with dismiss() and clear()', () => {
    const firstId = store.toast({ title: 'Primo' })
    store.toast({ title: 'Secondo' })

    expect(store.toasts.value).toHaveLength(2)
    expect(store.toasts.value[0]?.title).toBe('Primo')

    store.dismiss(firstId)

    expect(store.toasts.value).toHaveLength(1)
    expect(store.toasts.value[0]?.title).toBe('Secondo')

    store.clear()

    expect(store.toasts.value).toHaveLength(0)
  })

  it('returns incremental ids and marks new toasts open', () => {
    const a = store.toast({ title: 'A' })
    const b = store.toast({ title: 'B' })

    expect(b).toBeGreaterThan(a)
    expect(store.toasts.value.every(item => item.open)).toBe(true)
  })

  it('ignores dismiss for an unknown id', () => {
    store.toast({ title: 'A' })
    store.dismiss(999999)

    expect(store.toasts.value).toHaveLength(1)
  })
})

describe('Toaster', () => {
  it('renders an accessible fixed viewport region', async () => {
    await mountToaster()

    const viewport = queryViewport()

    expect(viewport).not.toBeNull()
    expect(viewport?.tagName.toLowerCase()).toBe('ol')
    expect(viewport?.classList.contains('fixed')).toBe(true)
    expect(document.body.querySelector('[aria-label="Notifiche"]')).not.toBeNull()
  })

  it('renders title and message of a pushed toast inside the viewport', async () => {
    await mountToaster()
    store.toast({
      title: 'Progetto salvato',
      message: 'Le modifiche sono online.',
      variant: 'success',
    })
    await flushPromises()

    const toastEl = queryToast()

    expect(toastEl).not.toBeNull()
    expect(queryViewport()?.contains(toastEl)).toBe(true)
    // Enter animation utility is present from the first render (forceMount keeps data-state in sync).
    expect(toastEl?.getAttribute('class')).toContain('toast-in')
    expect(toastEl?.getAttribute('data-state')).toBe('open')
    expect(toastEl?.querySelector('[data-slot="toast-title"]')?.textContent?.trim()).toBe(
      'Progetto salvato'
    )
    expect(toastEl?.querySelector('[data-slot="toast-message"]')?.textContent?.trim()).toBe(
      'Le modifiche sono online.'
    )
  })

  // Safety: `message` must never reach the DOM as HTML.
  it('renders HTML-like messages as literal text with no injected element', async () => {
    await mountToaster()
    store.toast({ message: '<img src=x onerror=alert(1)>', variant: 'error' })
    await flushPromises()

    const toastEl = queryToast()

    expect(toastEl).not.toBeNull()
    expect(toastEl?.querySelector('img')).toBeNull()
    expect(toastEl?.querySelector('[data-slot="toast-message"]')?.textContent).toContain(
      '<img src=x onerror=alert(1)>'
    )
  })

  // Exit is smooth: after reka's duration timer the node stays mounted with
  // data-state="closed" while the toast-out animation runs (forwards keeps the
  // final frame, no flash); the store drops it when animationend fires or via
  // the 260ms fallback (jsdom never fires animationend).
  it('auto-dismisses: keeps the node closed-but-mounted, then removes it', async () => {
    vi.useFakeTimers()

    await mountToaster()
    store.toast({ title: 'Temporaneo', duration: 1500 })

    await vi.advanceTimersByTimeAsync(1200)
    expect(queryToast()?.getAttribute('data-state')).toBe('open')

    await vi.advanceTimersByTimeAsync(400)
    expect(store.toasts.value).toHaveLength(1)
    expect(queryToast()?.getAttribute('data-state')).toBe('closed')

    await vi.advanceTimersByTimeAsync(400)
    expect(store.toasts.value).toHaveLength(0)
    expect(queryToast()).toBeNull()
  })

  it('removes the toast through the exit animation when the close button is clicked', async () => {
    await mountToaster()
    store.toast({ title: 'Chiudimi', message: 'Usa il pulsante X.' })
    await flushPromises()

    const closeButton = queryToast()?.querySelector<HTMLButtonElement>('[data-slot="toast-close"]')

    expect(closeButton).not.toBeNull()
    expect(closeButton?.getAttribute('aria-label')).toBe('Chiudi notifica')

    closeButton?.click()
    await flushPromises()

    // Node still mounted, mid toast-out animation.
    expect(queryToast()?.getAttribute('data-state')).toBe('closed')
    expect(store.toasts.value).toHaveLength(1)

    await vi.waitFor(() => {
      expect(store.toasts.value).toHaveLength(0)
    })
    expect(queryToast()).toBeNull()
  })

  // Source of truth for removal is the real animation, not the clock: the
  // fake timer is frozen at click time, so store=0 can only come from
  // `animationend`.
  it('dismisses on animationend without waiting for the fallback timer', async () => {
    vi.useFakeTimers()

    await mountToaster()
    store.toast({ title: 'Animazione' })
    await flushPromises()

    const toastEl = queryToast() as HTMLElement
    toastEl.querySelector<HTMLButtonElement>('[data-slot="toast-close"]')?.click()
    await flushPromises()

    expect(store.toasts.value).toHaveLength(1)

    // jsdom 25 does not implement AnimationEvent: a generic Event with the same
    // type plus animationName is enough — our handler only reads
    // target/currentTarget/data-state, reka's listener reads animationName.
    const animationEnd = new Event('animationend')
    Object.defineProperty(animationEnd, 'animationName', { value: 'toast-out' })
    toastEl.dispatchEvent(animationEnd)
    await flushPromises()

    expect(store.toasts.value).toHaveLength(0)
    expect(queryToast()).toBeNull()

    // The 260ms fallback was cleared by the animationend path.
    await vi.advanceTimersByTimeAsync(500)
    expect(store.toasts.value).toHaveLength(0)
  })

  it('falls back to the 260ms exit timer when animationend never fires', async () => {
    vi.useFakeTimers()

    await mountToaster()
    store.toast({ title: 'Senza evento' })
    await flushPromises()

    queryToast()?.querySelector<HTMLButtonElement>('[data-slot="toast-close"]')?.click()
    await flushPromises()

    expect(store.toasts.value).toHaveLength(1)

    await vi.advanceTimersByTimeAsync(259)
    expect(store.toasts.value).toHaveLength(1)
    expect(queryToast()?.getAttribute('data-state')).toBe('closed')

    await vi.advanceTimersByTimeAsync(1)
    expect(store.toasts.value).toHaveLength(0)
    expect(queryToast()).toBeNull()
  })

  // The default jsdom stub (tests/setup.ts) returns matches:false; the Toaster
  // reads the query once at setup, so matchMedia is stubbed before mounting.
  it('removes immediately under prefers-reduced-motion instead of freezing for 260ms', async () => {
    vi.useFakeTimers()
    const matchMediaSpy = vi.spyOn(window, 'matchMedia').mockImplementation(
      (query: string) =>
        ({
          matches: true,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }) as unknown as MediaQueryList
    )

    try {
      await mountToaster()
      store.toast({ title: 'Movimento ridotto' })
      await flushPromises()

      queryToast()?.querySelector<HTMLButtonElement>('[data-slot="toast-close"]')?.click()
      await flushPromises()

      expect(store.toasts.value).toHaveLength(1)

      // exitMs is 0: one tick is enough, long before the 260ms fallback.
      await vi.advanceTimersByTimeAsync(1)
      expect(store.toasts.value).toHaveLength(0)
      expect(queryToast()).toBeNull()
      expect(matchMediaSpy).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
    } finally {
      matchMediaSpy.mockRestore()
    }
  })

  it('closes with the swipe-out animation on a horizontal swipe', async () => {
    await mountToaster()
    store.toast({ title: 'Scorri via', message: 'Trascina verso destra.' })
    await flushPromises()

    const toastEl = queryToast() as HTMLElement

    toastEl.dispatchEvent(
      new PointerEvent('pointerdown', { clientX: 0, clientY: 0, bubbles: true })
    )
    toastEl.dispatchEvent(
      new PointerEvent('pointermove', { clientX: 80, clientY: 0, bubbles: true })
    )
    await flushPromises()
    toastEl.dispatchEvent(
      new PointerEvent('pointermove', { clientX: 120, clientY: 0, bubbles: true })
    )
    toastEl.dispatchEvent(
      new PointerEvent('pointerup', { clientX: 120, clientY: 0, bubbles: true })
    )
    await flushPromises()

    expect(toastEl.style.getPropertyValue('--toast-swipe-amount')).toBe('120px')
    expect(toastEl.getAttribute('data-state')).toBe('closed')
    expect(toastEl.getAttribute('class')).toContain('toast-swipe-out')

    await vi.waitFor(() => {
      expect(store.toasts.value).toHaveLength(0)
    })
  })

  it('does not dismiss on a vertical-dominant swipe', async () => {
    await mountToaster()
    store.toast({ title: 'Non chiudere', message: 'Scorri verso il basso.' })
    await flushPromises()

    const toastEl = queryToast() as HTMLElement

    // reka treats a vertical-dominant delta as a cancelled horizontal gesture.
    swipe(toastEl, [{ x: 20, y: 140 }], { x: 20, y: 140 })
    await flushPromises()

    expect(toastEl.getAttribute('data-state')).toBe('open')
    expect(toastEl.getAttribute('class')).not.toContain('toast-swipe-out')
    expect(store.toasts.value).toHaveLength(1)
  })

  it('uses an assertive live region for errors and a polite one for info', async () => {
    await mountToaster()
    store.toast({ message: 'Sincronizzazione fallita', variant: 'error' })

    // The announce region is scheduled on a macrotask by reka, so waitFor is needed.
    await vi.waitFor(() => {
      expect(
        document.body.querySelector('[role="alert"][aria-live="assertive"]')?.textContent
      ).toContain('Sincronizzazione fallita')
    })

    store.clear()
    await flushPromises()

    store.toast({ message: 'Nuovo commento', variant: 'info' })

    await vi.waitFor(() => {
      expect(document.body.querySelector('[aria-live="polite"]')?.textContent).toContain(
        'Nuovo commento'
      )
    })
  })
})

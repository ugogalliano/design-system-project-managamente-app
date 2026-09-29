import { afterEach, vi } from 'vitest'
import { enableAutoUnmount } from '@vue/test-utils'

enableAutoUnmount(afterEach)

// jsdom non implementa matchMedia: le primitive Reka lo interrogano al mount.
if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string): MediaQueryList =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }) as unknown as MediaQueryList,
  })
}

// jsdom non implementa ResizeObserver.
if (!('ResizeObserver' in globalThis)) {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  Object.defineProperty(globalThis, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: ResizeObserverStub,
  })
}

// jsdom non implementa IntersectionObserver (usato da menu/popover Reka).
if (!('IntersectionObserver' in globalThis)) {
  class IntersectionObserverStub {
    readonly root = null
    readonly rootMargin = ''
    readonly thresholds: readonly number[] = []

    constructor(_callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {}

    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return []
    }
  }

  Object.defineProperty(globalThis, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: IntersectionObserverStub,
  })
}

// jsdom non implementa PointerEvent: Reka lo usa per mouse/pointer interactions.
if (!('PointerEvent' in globalThis)) {
  class PointerEventStub extends MouseEvent {
    pointerId: number
    pointerType: string
    isPrimary: boolean
    pressure: number
    width: number
    height: number
    tiltX: number
    tiltY: number
    twist: number
    tangentialPressure: number

    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params)
      this.pointerId = params.pointerId ?? 1
      this.pointerType = params.pointerType ?? 'mouse'
      this.isPrimary = params.isPrimary ?? true
      this.pressure = params.pressure ?? 0
      this.width = params.width ?? 1
      this.height = params.height ?? 1
      this.tiltX = params.tiltX ?? 0
      this.tiltY = params.tiltY ?? 0
      this.twist = params.twist ?? 0
      this.tangentialPressure = params.tangentialPressure ?? 0
    }
  }

  Object.defineProperty(globalThis, 'PointerEvent', {
    writable: true,
    configurable: true,
    value: PointerEventStub,
  })
}

// jsdom restituisce sempre DOMRect a zero: garantiamo dimensioni numeriche.
if (typeof Element !== 'undefined') {
  Element.prototype.getBoundingClientRect = function getBoundingClientRect(): DOMRect {
    return {
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
      toJSON: () => ({}),
    } as DOMRect
  }

  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = vi.fn()
  }

  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false
  }

  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => {}
  }

  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {}
  }
}

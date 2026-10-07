import { readonly, ref } from 'vue'

export type ToastVariant = 'success' | 'error' | 'info'

export interface ToastInput {
  title?: string
  /** Plain text only: rendered as interpolated text, never as HTML. */
  message?: string
  variant?: ToastVariant
  duration?: number
}

export interface ToastItem extends ToastInput {
  id: number
  open: boolean
}

let idCounter = 0

const toasts = ref<ToastItem[]>([])

export function useToast() {
  function toast(input: ToastInput): number {
    const id = ++idCounter
    toasts.value.push({ ...input, id, open: true })
    return id
  }

  function dismiss(id: number): void {
    const index = toasts.value.findIndex(item => item.id === id)
    if (index !== -1) toasts.value.splice(index, 1)
  }

  function clear(): void {
    toasts.value = []
  }

  return {
    toasts: readonly(toasts),
    toast,
    dismiss,
    clear,
  }
}

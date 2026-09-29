import { defineComponent, h, type Component, type VNodeChild } from 'vue'
import { useForm } from 'vee-validate'
import { mount, type VueWrapper } from '@vue/test-utils'

export { flushPromises, mount } from '@vue/test-utils'
export type { MountingOptions, VueWrapper } from '@vue/test-utils'
export { toTypedSchema } from '@vee-validate/zod'

export type FormValues = Record<string, unknown>

export interface MountWithFormOptions {
  props?: Record<string, unknown>
  attrs?: Record<string, unknown>
  slots?: Record<string, string | (() => VNodeChild)>
  initialValues?: FormValues
  validationSchema?: unknown
  attachTo?: HTMLElement
}

/**
 * Monta un componente dentro un contesto form creato con `useForm` (composition API),
 * come richiesto dalle convenzioni del design system: nessun componente `<Form>`.
 * `useForm` fornisce il contesto ai figli che chiamano `useField`.
 */
export function mountWithForm<C extends Component>(
  component: C,
  options: MountWithFormOptions = {}
): VueWrapper {
  const { props, attrs, slots, initialValues, validationSchema, attachTo } = options

  const Host = defineComponent({
    name: 'UseFormHost',
    setup() {
      useForm({
        initialValues,
        validationSchema: validationSchema as never,
      })

      return () =>
        h(component, { ...props, ...attrs }, slots as Record<string, () => VNodeChild> | undefined)
    },
  })

  return mount(Host, { attachTo })
}

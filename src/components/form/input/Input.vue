<template>
  <div class="space-y-2" data-slot="input-field">
    <label v-if="label" :for="fieldId" :class="labelClasses" data-slot="input-label">
      {{ label }}
      <span v-if="required" aria-hidden="true" class="text-destructive">*</span>
    </label>

    <input
      v-bind="$attrs"
      :id="fieldId"
      :name="name"
      :type="type"
      :value="value"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :aria-invalid="isInvalid ? 'true' : undefined"
      :aria-required="required ? 'true' : undefined"
      :aria-describedby="describedBy"
      :class="inputClasses"
      data-slot="input"
      v-on="validationListeners"
    />

    <p
      v-if="description && !showError"
      :id="descriptionId"
      class="text-sm text-muted-foreground"
      data-slot="input-description"
    >
      {{ description }}
    </p>

    <p
      v-if="showError"
      :id="errorId"
      class="text-sm font-medium text-destructive"
      data-slot="input-error"
    >
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useField } from 'vee-validate'
import { cn, variants } from '@/lib/utils'

interface Props {
  name: string
  label?: string
  description?: string
  type?: string
  placeholder?: string
  size?: 'sm' | 'default' | 'lg'
  disabled?: boolean
  readonly?: boolean
  invalid?: boolean
  required?: boolean
  id?: string
  rules?: string
  modelValue?: string
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  description: undefined,
  type: 'text',
  placeholder: undefined,
  size: 'default',
  disabled: false,
  readonly: false,
  invalid: false,
  required: false,
  id: undefined,
  rules: undefined,
  modelValue: undefined,
})

defineEmits<{
  'update:modelValue': [value: string]
}>()

const { errorMessage, value, handleChange, handleBlur } = useField<string>(
  () => props.name,
  computed(() => props.rules),
  { validateOnValueUpdate: false, syncVModel: true }
)

const validationListeners = {
  blur: (event: FocusEvent) => handleBlur(event, true),
  change: (event: Event) => handleChange(event),
  input: (event: Event) => handleChange(event, Boolean(errorMessage.value)),
}

const inputVariants = variants({
  variants: {
    size: {
      sm: 'h-8 px-2 text-sm',
      default: 'h-10 px-3 text-sm',
      lg: 'h-12 px-4 text-base',
    },
    state: {
      default: 'border-input focus-visible:ring-ring',
      invalid: 'border-destructive focus-visible:ring-destructive',
    },
  },
  defaultVariants: { size: 'default', state: 'default' },
})

const fieldId = computed(() => props.id ?? props.name)
const errorId = computed(() => `${fieldId.value}-error`)
const descriptionId = computed(() => `${fieldId.value}-description`)
const showError = computed(() => Boolean(errorMessage.value))
const isInvalid = computed(() => props.invalid || showError.value)

const describedBy = computed(() => {
  const ids: string[] = []
  if (props.description && !showError.value) ids.push(descriptionId.value)
  if (showError.value) ids.push(errorId.value)

  return ids.length > 0 ? ids.join(' ') : undefined
})

const inputClasses = computed(() =>
  cn(
    'w-full rounded-md border bg-background text-foreground shadow-sm transition-colors',
    'placeholder:text-muted-foreground',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'readonly:bg-muted',
    inputVariants({ size: props.size, state: isInvalid.value ? 'invalid' : 'default' })
  )
)

const labelClasses = computed(() =>
  cn('text-sm font-medium leading-none', props.disabled && 'cursor-not-allowed opacity-70')
)
</script>

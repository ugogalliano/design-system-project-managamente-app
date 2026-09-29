<template>
  <div class="space-y-2" data-slot="checkbox-field">
    <div class="flex items-start gap-2">
      <CheckboxRoot
        v-bind="$attrs"
        :id="fieldId"
        :model-value="checkboxState"
        :name="name"
        :disabled="disabled"
        :required="required"
        :aria-invalid="isInvalid ? 'true' : undefined"
        :aria-required="required ? 'true' : undefined"
        :aria-describedby="describedBy"
        :class="checkboxClasses"
        data-slot="checkbox"
        v-on="validationListeners"
        @update:model-value="handleValueChange"
      >
        <CheckboxIndicator :class="indicatorClasses" data-slot="checkbox-indicator">
          <svg
            v-if="indeterminate"
            :class="iconClasses"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <path d="M5 12h14" />
          </svg>
          <svg
            v-else
            :class="iconClasses"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </CheckboxIndicator>
      </CheckboxRoot>

      <div class="space-y-1 leading-none">
        <label v-if="label" :for="fieldId" :class="labelClasses" data-slot="checkbox-label">
          {{ label }}
          <span v-if="required" aria-hidden="true" class="text-destructive">*</span>
        </label>

        <p
          v-if="description && !showError"
          :id="descriptionId"
          class="text-sm text-muted-foreground"
          data-slot="checkbox-description"
        >
          {{ description }}
        </p>

        <p
          v-if="showError"
          :id="errorId"
          class="text-sm font-medium text-destructive"
          data-slot="checkbox-error"
        >
          {{ errorMessage }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useField } from 'vee-validate'
import { CheckboxIndicator, CheckboxRoot } from 'reka-ui'
import { cn, variants } from '@/lib/utils'

interface Props {
  name: string
  label?: string
  description?: string
  size?: 'sm' | 'default' | 'lg'
  disabled?: boolean
  invalid?: boolean
  required?: boolean
  indeterminate?: boolean
  id?: string
  rules?: string
  modelValue?: boolean
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  description: undefined,
  size: 'default',
  disabled: false,
  invalid: false,
  required: false,
  indeterminate: false,
  id: undefined,
  rules: undefined,
  modelValue: undefined,
})

defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { errorMessage, value, handleChange, handleBlur } = useField<boolean>(
  () => props.name,
  computed(() => props.rules),
  { validateOnValueUpdate: false, syncVModel: true }
)

const validationListeners = {
  blur: (event: FocusEvent) => handleBlur(event, true),
  change: (event: Event) => handleChange(event, Boolean(errorMessage.value)),
  input: (event: Event) => handleChange(event, Boolean(errorMessage.value)),
}

function handleValueChange(next: boolean | 'indeterminate') {
  if (props.disabled) return

  handleChange(next === 'indeterminate' ? true : next, Boolean(errorMessage.value))
}

const checkboxVariants = variants({
  variants: {
    size: {
      sm: 'h-4 w-4',
      default: 'h-5 w-5',
      lg: 'h-6 w-6',
    },
    state: {
      default: 'border-input',
      invalid: 'border-destructive focus-visible:ring-destructive',
    },
  },
  defaultVariants: { size: 'default', state: 'default' },
})

const iconVariants = variants({
  variants: {
    size: {
      sm: 'h-3 w-3',
      default: 'h-3.5 w-3.5',
      lg: 'h-4 w-4',
    },
  },
  defaultVariants: { size: 'default' },
})

const fieldId = computed(() => props.id ?? props.name)
const errorId = computed(() => `${fieldId.value}-error`)
const descriptionId = computed(() => `${fieldId.value}-description`)
const showError = computed(() => Boolean(errorMessage.value))
const isInvalid = computed(() => props.invalid || showError.value)

const checkboxState = computed<boolean | 'indeterminate'>(() =>
  props.indeterminate ? 'indeterminate' : Boolean(value.value)
)

const describedBy = computed(() => {
  const ids: string[] = []
  if (props.description && !showError.value) ids.push(descriptionId.value)
  if (showError.value) ids.push(errorId.value)

  return ids.length > 0 ? ids.join(' ') : undefined
})

const checkboxClasses = computed(() =>
  cn(
    'inline-flex shrink-0 items-center justify-center rounded-sm border shadow-sm transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
    'data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground',
    checkboxVariants({ size: props.size, state: isInvalid.value ? 'invalid' : 'default' })
  )
)

const indicatorClasses = computed(() => cn('flex items-center justify-center text-current'))

const iconClasses = computed(() => iconVariants({ size: props.size }))

const labelClasses = computed(() =>
  cn('text-sm font-medium leading-none', props.disabled && 'cursor-not-allowed opacity-70')
)
</script>

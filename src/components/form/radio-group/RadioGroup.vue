<template>
  <div class="space-y-2">
    <span v-if="label" :id="labelId" :class="labelClasses" data-slot="radio-group-label">
      {{ label }}
      <span v-if="required" aria-hidden="true" class="text-destructive">*</span>
    </span>

    <RadioGroupRoot
      v-bind="$attrs"
      :model-value="value"
      :name="name"
      :disabled="disabled"
      :required="required"
      :orientation="orientation"
      :loop="loop"
      :aria-labelledby="label ? labelId : undefined"
      :aria-required="required ? 'true' : undefined"
      :aria-invalid="isInvalid ? 'true' : undefined"
      :aria-describedby="describedBy"
      :class="groupClasses"
      data-slot="radio-group"
      @update:model-value="handleValueChange"
    >
      <div v-for="option in options" :key="option.value" class="flex items-center gap-2">
        <RadioGroupItem
          :id="optionId(option.value)"
          :value="option.value"
          :disabled="option.disabled"
          :class="itemClasses"
          data-slot="radio-group-item"
          @blur="handleBlur($event, true)"
        >
          <RadioGroupIndicator
            class="flex items-center justify-center"
            data-slot="radio-group-indicator"
          >
            <span class="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
          </RadioGroupIndicator>
        </RadioGroupItem>

        <label :for="optionId(option.value)" :class="optionLabelClasses(option.disabled)">
          {{ option.label }}
        </label>
      </div>
    </RadioGroupRoot>

    <p
      v-if="description && !showError"
      :id="descriptionId"
      class="text-sm text-muted-foreground"
      data-slot="radio-group-description"
    >
      {{ description }}
    </p>

    <p
      v-if="showError"
      :id="errorId"
      class="text-sm font-medium text-destructive"
      data-slot="radio-group-error"
    >
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useField } from 'vee-validate'
import { RadioGroupIndicator, RadioGroupItem, RadioGroupRoot, type AcceptableValue } from 'reka-ui'
import { cn, variants } from '@/lib/utils'

interface RadioOption {
  value: string
  label: string
  disabled?: boolean
}

interface Props {
  name: string
  options: RadioOption[]
  label?: string
  description?: string
  size?: 'sm' | 'default' | 'lg'
  disabled?: boolean
  invalid?: boolean
  required?: boolean
  orientation?: 'vertical' | 'horizontal'
  loop?: boolean
  id?: string
  rules?: string
  modelValue?: string
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  description: undefined,
  size: 'default',
  disabled: false,
  invalid: false,
  required: false,
  orientation: 'vertical',
  loop: true,
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

function handleValueChange(next: AcceptableValue) {
  if (props.disabled) return

  const resolved = next === null ? '' : String(next)

  handleChange(resolved, Boolean(errorMessage.value))
}

const groupVariants = variants({
  variants: {
    orientation: {
      vertical: 'flex flex-col gap-2',
      horizontal: 'flex flex-row flex-wrap items-center gap-4',
    },
  },
  defaultVariants: { orientation: 'vertical' },
})

const itemVariants = variants({
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

const fieldId = computed(() => props.id ?? props.name)
const labelId = computed(() => `${fieldId.value}-label`)
const errorId = computed(() => `${fieldId.value}-error`)
const descriptionId = computed(() => `${fieldId.value}-description`)
const showError = computed(() => Boolean(errorMessage.value))
const isInvalid = computed(() => props.invalid || showError.value)

function optionId(optionValue: string) {
  return `${fieldId.value}-${optionValue}`
}

const describedBy = computed(() => {
  const ids: string[] = []
  if (props.description && !showError.value) ids.push(descriptionId.value)
  if (showError.value) ids.push(errorId.value)

  return ids.length > 0 ? ids.join(' ') : undefined
})

const groupClasses = computed(() => cn(groupVariants({ orientation: props.orientation })))

const itemClasses = computed(() =>
  cn(
    'inline-flex shrink-0 items-center justify-center rounded-full border bg-background text-primary shadow-sm transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'data-[state=checked]:border-primary',
    itemVariants({ size: props.size, state: isInvalid.value ? 'invalid' : 'default' })
  )
)

const labelClasses = computed(() =>
  cn('text-sm font-medium leading-none', props.disabled && 'cursor-not-allowed opacity-70')
)

function optionLabelClasses(optionDisabled?: boolean) {
  return cn(
    'text-sm leading-none',
    (props.disabled || optionDisabled) && 'cursor-not-allowed opacity-70'
  )
}
</script>

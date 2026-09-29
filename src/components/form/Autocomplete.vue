<template>
  <div class="space-y-2" data-slot="autocomplete">
    <label v-if="label" :for="fieldId" :class="labelClasses" data-slot="autocomplete-label">
      {{ label }}
      <span v-if="required" aria-hidden="true" class="text-destructive">*</span>
    </label>

    <AutocompleteRoot
      :model-value="value"
      :open="open"
      :disabled="disabled"
      :name="name"
      :open-on-focus="effectiveOpenOnFocus"
      :open-on-click="effectiveOpenOnClick"
      :ignore-filter="ignoreFilter"
      class="z-10"
      @update:model-value="handleValueChange"
      @update:open="handleOpenChange"
    >
      <AutocompleteAnchor class="relative block">
        <AutocompleteInput
          v-bind="$attrs"
          :id="fieldId"
          :name="name"
          :placeholder="placeholder"
          :disabled="disabled"
          :readonly="readonly"
          :aria-invalid="isInvalid ? 'true' : undefined"
          :aria-required="required ? 'true' : undefined"
          :aria-describedby="describedBy"
          :class="inputClasses"
          data-slot="autocomplete-input"
          @blur="handleInputBlur"
        />
      </AutocompleteAnchor>

      <AutocompletePortal>
        <AutocompleteContent
          position="popper"
          align="start"
          :side-offset="4"
          class="max-h-60 min-w-[var(--reka-popper-anchor-width)] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md"
          data-slot="autocomplete-content"
        >
          <AutocompleteViewport class="p-1">
            <AutocompleteEmpty
              class="py-6 text-center text-sm text-muted-foreground"
              data-slot="autocomplete-empty"
            >
              Nessun risultato
            </AutocompleteEmpty>

            <AutocompleteItem
              v-for="option in options"
              :key="option.value"
              :value="option.label"
              :text-value="option.label"
              :disabled="option.disabled"
              class="relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              data-slot="autocomplete-item"
            >
              <span>{{ option.label }}</span>
              <AutocompleteItemIndicator class="ml-auto" data-slot="autocomplete-item-indicator">
                <svg
                  class="h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </AutocompleteItemIndicator>
            </AutocompleteItem>
          </AutocompleteViewport>
        </AutocompleteContent>
      </AutocompletePortal>
    </AutocompleteRoot>

    <p
      v-if="description && !showError"
      :id="descriptionId"
      class="text-sm text-muted-foreground"
      data-slot="autocomplete-description"
    >
      {{ description }}
    </p>

    <p
      v-if="showError"
      :id="errorId"
      class="text-sm font-medium text-destructive"
      data-slot="autocomplete-error"
    >
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useField } from 'vee-validate'
import {
  AutocompleteAnchor,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteItemIndicator,
  AutocompletePortal,
  AutocompleteRoot,
  AutocompleteViewport,
} from 'reka-ui'
import { cn, variants } from '@/lib/utils'

interface Props {
  name: string
  options?: Array<{ value: string; label: string; disabled?: boolean }>
  label?: string
  description?: string
  placeholder?: string
  size?: 'sm' | 'default' | 'lg'
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  invalid?: boolean
  id?: string
  rules?: string
  modelValue?: string
  openOnFocus?: boolean
  openOnClick?: boolean
  ignoreFilter?: boolean
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<Props>(), {
  options: () => [],
  label: undefined,
  description: undefined,
  placeholder: undefined,
  size: 'default',
  disabled: false,
  readonly: false,
  required: false,
  invalid: false,
  id: undefined,
  rules: undefined,
  modelValue: undefined,
  openOnFocus: true,
  openOnClick: true,
  ignoreFilter: false,
})

defineEmits<{
  'update:modelValue': [value: string]
}>()

const { errorMessage, value, handleChange, handleBlur } = useField<string>(
  () => props.name,
  computed(() => props.rules),
  { validateOnValueUpdate: false, syncVModel: true }
)

const open = ref(false)

const effectiveOpenOnFocus = computed(() => props.openOnFocus && !props.disabled && !props.readonly)
const effectiveOpenOnClick = computed(() => props.openOnClick && !props.disabled && !props.readonly)

function handleOpenChange(next: boolean) {
  open.value = props.disabled || props.readonly ? false : next
}

function handleValueChange(next: string) {
  handleChange(next, Boolean(errorMessage.value))
}

function handleInputBlur(event: FocusEvent) {
  handleBlur(event, true)
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

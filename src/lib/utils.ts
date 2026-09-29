import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type VariantRecord = Record<string, Record<string, string>>

type VariantSelection<V extends VariantRecord> = Partial<{
  [K in keyof V]: keyof V[K] & string
}>

export interface VariantsConfig<V extends VariantRecord> {
  variants?: V
  defaultVariants?: VariantSelection<V>
  compoundVariants?: Array<VariantSelection<V> & { class?: ClassValue }>
}

export type VariantsProps<V extends VariantRecord> = VariantSelection<V> & {
  class?: ClassValue
  className?: ClassValue
}

export function variants<V extends VariantRecord>(config: VariantsConfig<V>) {
  const { variants: variantMap, defaultVariants, compoundVariants } = config

  return (props: VariantsProps<V> = {}): string => {
    const { class: classProp, className, ...selection } = props
    const selected: Record<string, unknown> = { ...defaultVariants }

    for (const [name, value] of Object.entries(selection)) {
      if (value === null || value === undefined || (value as unknown) === false) continue
      selected[name] = value
    }

    const classes: ClassValue[] = []

    for (const [name, options] of Object.entries(variantMap ?? {})) {
      const value = selected[name]
      if (value === null || value === undefined || value === false) continue

      const variantClass = options[String(value)]
      if (variantClass) classes.push(variantClass)
    }

    for (const compound of compoundVariants ?? []) {
      const { class: compoundClass, ...conditions } = compound
      const isMatch = Object.entries(conditions).every(([name, value]) => selected[name] === value)

      if (isMatch && compoundClass) classes.push(compoundClass)
    }

    return cn(...classes, classProp, className)
  }
}

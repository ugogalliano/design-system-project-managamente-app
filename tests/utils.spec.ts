import { describe, it, expect } from 'vitest'
import { cn, variants } from '@/lib/utils'

describe('utils', () => {
  it('cn merges classes correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })
})

describe('variants', () => {
  const inputVariants = variants({
    variants: {
      size: {
        sm: 'h-8 px-2 text-sm',
        default: 'h-10 px-3 text-sm',
        lg: 'h-12 px-4 text-base',
      },
      state: {
        default: 'border-input',
        invalid: 'border-destructive focus-visible:ring-destructive',
      },
    },
    defaultVariants: { size: 'default', state: 'default' },
    compoundVariants: [{ size: 'lg', state: 'invalid', class: 'border-2' }],
  })

  it('applies defaultVariants when no prop is passed', () => {
    expect(inputVariants()).toBe('h-10 px-3 text-sm border-input')
  })

  it('applies the selected variant over the default', () => {
    expect(inputVariants({ size: 'sm' })).toBe('h-8 px-2 text-sm border-input')
  })

  it('skips null, undefined and false values', () => {
    expect(inputVariants({ size: undefined, state: undefined })).toBe(
      'h-10 px-3 text-sm border-input'
    )
    expect(inputVariants({ size: false as never })).toBe('h-10 px-3 text-sm border-input')
  })

  it('applies compoundVariants only when every condition matches', () => {
    expect(inputVariants({ size: 'lg', state: 'invalid' })).toBe(
      'h-12 px-4 text-base border-destructive focus-visible:ring-destructive border-2'
    )
    expect(inputVariants({ size: 'lg' })).toBe('h-12 px-4 text-base border-input')
  })

  it('lets the class override win over variant classes', () => {
    expect(inputVariants({ size: 'sm', class: 'h-9' })).toBe('px-2 text-sm border-input h-9')
  })
})

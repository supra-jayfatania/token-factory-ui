import { cva, type VariantProps } from 'class-variance-authority'
import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all active:scale-[0.98] disabled:pointer-events-none disabled:active:scale-100 disabled:border-transparent disabled:bg-surface-hover disabled:text-text-faint disabled:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60',
  {
    variants: {
      variant: {
        primary: 'bg-accent text-white shadow-sm shadow-accent/30 hover:bg-accent-hover',
        secondary:
          'bg-surface-raised text-text border border-border hover:border-accent/50 hover:bg-surface-hover',
        ghost: 'text-text-muted hover:text-text hover:bg-surface-raised',
        danger: 'bg-negative-soft text-negative border border-negative/30 hover:bg-negative/20',
      },
      size: {
        sm: 'h-8 px-3',
        md: 'h-10 px-4',
        lg: 'h-11 px-5 text-base',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
)
Button.displayName = 'Button'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MinusIcon, PlusIcon } from 'lucide-react'

interface QuantityInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  value: number
  onValueChange: (value: number) => void
  min?: number
  max?: number
  className?: string
}

const QuantityInput = React.forwardRef<HTMLDivElement, QuantityInputProps>(
  (
    { value, onValueChange, min = 0, max = 99, className, disabled, ...props },
    ref
  ) => {
    const handleIncrement = () => {
      if (value < max) {
        onValueChange(value + 1)
      }
    }

    const handleDecrement = () => {
      if (value > min) {
        onValueChange(value - 1)
      }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseInt(e.target.value)
      if (!isNaN(newValue) && newValue >= min && newValue <= max) {
        onValueChange(newValue)
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex h-10 items-center rounded-md border border-input bg-background',
          className
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="size-9 rounded-r-none"
          onClick={handleDecrement}
          disabled={value <= min || disabled}
          type="button"
        >
          <MinusIcon className="size-4" />
        </Button>
        <Input
          type="number"
          value={value}
          onChange={handleChange}
          className="h-9 w-14 border-0 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          min={min}
          max={max}
          disabled={disabled}
          {...props}
        />
        <Button
          variant="ghost"
          size="icon"
          className="size-9 rounded-l-none"
          onClick={handleIncrement}
          disabled={value >= max || disabled}
          type="button"
        >
          <PlusIcon className="size-4" />
        </Button>
      </div>
    )
  }
)
QuantityInput.displayName = 'QuantityInput'

export { QuantityInput }

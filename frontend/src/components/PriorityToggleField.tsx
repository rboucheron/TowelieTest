import type { StatusTone } from '@/components/StatusBadge'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui'
import { cn } from '@/lib/utils'

export interface PriorityOption<T extends string> {
  value: T
  label: string
  tone: StatusTone
}

export interface PriorityToggleFieldProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: Array<PriorityOption<T>>
}

const TONE_ACTIVE_CLASSES: Record<StatusTone, string> = {
  success:
    'data-[state=on]:bg-status-success-bg data-[state=on]:text-status-success-fg data-[state=on]:border-status-success-border',
  warning:
    'data-[state=on]:bg-status-warning-bg data-[state=on]:text-status-warning-fg data-[state=on]:border-status-warning-border',
  danger:
    'data-[state=on]:bg-status-danger-bg data-[state=on]:text-status-danger-fg data-[state=on]:border-status-danger-border',
  neutral:
    'data-[state=on]:bg-status-neutral-bg data-[state=on]:text-status-neutral-fg data-[state=on]:border-status-neutral-border',
}

export function PriorityToggleField<T extends string>({
  value,
  onChange,
  options,
}: PriorityToggleFieldProps<T>) {
  return (
    <ToggleGroup
      type="single"
      variant="outline"
      value={value}
      onValueChange={(next) => {
        if (next) onChange(next as T)
      }}
      className="flex-wrap"
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          className={cn('font-medium', TONE_ACTIVE_CLASSES[option.tone])}
        >
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

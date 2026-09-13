import { cn } from '@/lib/utils'

export type StatusTone = 'success' | 'warning' | 'danger' | 'neutral'

export interface StatusBadgeProps {
  tone: StatusTone
  children: React.ReactNode
  className?: string
}

const TONE_CLASSES: Record<StatusTone, string> = {
  success:
    'bg-status-success-bg text-status-success-fg border-status-success-border',
  warning:
    'bg-status-warning-bg text-status-warning-fg border-status-warning-border',
  danger: 'bg-status-danger-bg text-status-danger-fg border-status-danger-border',
  neutral:
    'bg-status-neutral-bg text-status-neutral-fg border-status-neutral-border',
}

export function StatusBadge({ tone, children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex w-fit shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

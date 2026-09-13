import { avatarColorFor } from '@/lib/avatar-color'
import { cn } from '@/lib/utils'

export interface GroupAvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_CLASSES = {
  sm: 'size-6 text-xs',
  md: 'size-9 text-sm',
  lg: 'size-11 text-base',
}

export function GroupAvatar({ name, size = 'md', className }: GroupAvatarProps) {
  const { bg, fg } = avatarColorFor(name)

  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-md font-bold',
        SIZE_CLASSES[size],
        className,
      )}
      style={{ backgroundColor: bg, color: fg }}
      aria-hidden
    >
      {name.charAt(0).toUpperCase()}
    </span>
  )
}

import type { UserSummary } from '@/api'
import { avatarColorFor } from '@/lib/avatar-color'
import { cn } from '@/lib/utils'

export interface UserAvatarProps {
  user: UserSummary | null
  size?: 'sm' | 'md'
  className?: string
}

const SIZE_CLASSES = {
  sm: 'size-7 text-xs',
  md: 'size-9 text-sm',
}

export function userDisplayName(user: UserSummary | null): string {
  return user ? `${user.firstName} ${user.lastName}` : 'Deleted user'
}

export function UserAvatar({ user, size = 'md', className }: UserAvatarProps) {
  const { bg, fg } = avatarColorFor(user?.id ?? 'unknown')
  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : '?'

  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-semibold',
        SIZE_CLASSES[size],
        className,
      )}
      style={{ backgroundColor: bg, color: fg }}
      aria-hidden
    >
      {initials}
    </span>
  )
}

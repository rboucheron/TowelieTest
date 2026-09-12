import { createFileRoute } from '@tanstack/react-router'
import { GroupsList } from '@/features/groups'

export const Route = createFileRoute('/_authenticated/groups/')({
  component: GroupsList,
})

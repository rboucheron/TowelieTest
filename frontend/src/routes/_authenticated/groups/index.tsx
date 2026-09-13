import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { GroupsList } from '@/features/groups'

const groupsSearchSchema = z.object({
  q: z.string().optional(),
})

export const Route = createFileRoute('/_authenticated/groups/')({
  validateSearch: groupsSearchSchema,
  component: GroupsPage,
})

function GroupsPage() {
  const { q } = Route.useSearch()
  return <GroupsList query={q} />
}

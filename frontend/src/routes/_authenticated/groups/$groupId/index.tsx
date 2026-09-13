import { createFileRoute, Link } from '@tanstack/react-router'
import { z } from 'zod'
import { useCan } from '@/features/auth'
import { useGroupQuery } from '@/features/groups'
import { RecipeBooksList } from '@/features/recipe-books'

const groupOverviewSearchSchema = z.object({
  q: z.string().optional(),
})

export const Route = createFileRoute('/_authenticated/groups/$groupId/')({
  validateSearch: groupOverviewSearchSchema,
  component: GroupPage,
})

function GroupPage() {
  const { groupId } = Route.useParams()
  const { q } = Route.useSearch()
  const groupQuery = useGroupQuery(groupId)
  const canManage = useCan(groupId, 'ADMIN')

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">
          {groupQuery.data?.name}
        </h1>
        {canManage ? (
          <Link
            to="/groups/$groupId/settings"
            params={{ groupId }}
            className="text-sm underline underline-offset-4"
          >
            Group settings
          </Link>
        ) : null}
      </div>
      <RecipeBooksList groupId={groupId} query={q} />
    </div>
  )
}

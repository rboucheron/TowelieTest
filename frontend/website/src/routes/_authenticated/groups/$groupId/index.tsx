import { createFileRoute, Link } from '@tanstack/react-router'
import { useGroupQuery } from '@/features/groups'
import { useCan } from '@/features/auth'
import { RecipeBooksList } from '@/features/recipe-books'

export const Route = createFileRoute('/_authenticated/groups/$groupId/')({
  component: GroupPage,
})

function GroupPage() {
  const { groupId } = Route.useParams()
  const groupQuery = useGroupQuery(groupId)
  const canManage = useCan(groupId, 'ADMIN')

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{groupQuery.data?.name}</h1>
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
      <RecipeBooksList groupId={groupId} />
    </div>
  )
}

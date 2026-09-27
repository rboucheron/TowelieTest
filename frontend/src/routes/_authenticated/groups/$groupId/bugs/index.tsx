import { createFileRoute } from '@tanstack/react-router'
import { useIsDeveloper } from '@/features/auth'
import { GroupBugsBoard } from '@/features/bugs'

export const Route = createFileRoute('/_authenticated/groups/$groupId/bugs/')({
  component: GroupBugsPage,
})

function GroupBugsPage() {
  const { groupId } = Route.useParams()
  const isDeveloper = useIsDeveloper(groupId)

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Bugs</h1>
        <p className="text-sm text-muted-foreground">
          {isDeveloper
            ? 'Bugs affecting the products you are assigned to, grouped by priority.'
            : "Every bug reported across this group's recipe books, grouped by priority."}
        </p>
      </div>
      <GroupBugsBoard groupId={groupId} />
    </div>
  )
}

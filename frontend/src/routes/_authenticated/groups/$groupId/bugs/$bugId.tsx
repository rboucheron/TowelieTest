import { createFileRoute } from '@tanstack/react-router'
import { BugDetailView } from '@/features/bugs'

export const Route = createFileRoute(
  '/_authenticated/groups/$groupId/bugs/$bugId',
)({
  component: BugDetailPage,
})

function BugDetailPage() {
  const { groupId, bugId } = Route.useParams()

  return (
    <div className="mx-auto max-w-3xl p-6">
      <BugDetailView groupId={groupId} bugId={bugId} />
    </div>
  )
}

import { createFileRoute } from '@tanstack/react-router'
import { MembersPanel } from '@/features/groups'
import { ProductsPanel } from '@/features/products'

export const Route = createFileRoute(
  '/_authenticated/groups/$groupId/settings',
)({
  component: GroupSettingsPage,
})

function GroupSettingsPage() {
  const { groupId } = Route.useParams()

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6">
      <h1 className="text-2xl font-semibold">Group settings</h1>
      <MembersPanel groupId={groupId} />
      <ProductsPanel groupId={groupId} />
    </div>
  )
}

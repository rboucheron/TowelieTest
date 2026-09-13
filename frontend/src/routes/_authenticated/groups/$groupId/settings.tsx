import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { MembersPanel } from '@/features/groups'
import { ProductsPanel } from '@/features/products'

const settingsSearchSchema = z.object({
  tab: z.enum(['members', 'products']).optional(),
})

export const Route = createFileRoute(
  '/_authenticated/groups/$groupId/settings',
)({
  validateSearch: settingsSearchSchema,
  component: GroupSettingsPage,
})

function GroupSettingsPage() {
  const { groupId } = Route.useParams()
  const { tab } = Route.useSearch()
  const navigate = Route.useNavigate()

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <h1 className="text-xl font-semibold text-foreground">Group settings</h1>

      <Tabs
        value={tab ?? 'members'}
        onValueChange={(value) =>
          navigate({ search: { tab: value as 'members' | 'products' } })
        }
      >
        <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>
        <TabsContent value="members">
          <MembersPanel groupId={groupId} />
        </TabsContent>
        <TabsContent value="products">
          <ProductsPanel groupId={groupId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

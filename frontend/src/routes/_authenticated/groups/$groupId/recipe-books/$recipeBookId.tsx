import { createFileRoute, Navigate } from '@tanstack/react-router'
import { z } from 'zod'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { useIsDeveloper } from '@/features/auth'
import { BugsPanel } from '@/features/bugs'
import { useRecipeBookQuery } from '@/features/recipe-books'
import { TestCasesPanel } from '@/features/test-cases'

const recipeBookSearchSchema = z.object({
  tab: z.enum(['test-cases', 'bugs']).optional(),
})

export const Route = createFileRoute(
  '/_authenticated/groups/$groupId/recipe-books/$recipeBookId',
)({
  validateSearch: recipeBookSearchSchema,
  component: RecipeBookPage,
})

function RecipeBookPage() {
  const { groupId, recipeBookId } = Route.useParams()
  const { tab } = Route.useSearch()
  const navigate = Route.useNavigate()
  const isDeveloper = useIsDeveloper(groupId)
  const recipeBookQuery = useRecipeBookQuery(recipeBookId, !isDeveloper)

  if (isDeveloper) {
    return <Navigate to="/groups/$groupId/bugs" params={{ groupId }} replace />
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          {recipeBookQuery.data?.title}
        </h1>
        <p className="text-muted-foreground">
          {recipeBookQuery.data?.description}
        </p>
      </div>

      <Tabs
        value={tab ?? 'test-cases'}
        onValueChange={(value) =>
          navigate({ search: { tab: value as 'test-cases' | 'bugs' } })
        }
      >
        <TabsList>
          <TabsTrigger value="test-cases">Test cases</TabsTrigger>
          <TabsTrigger value="bugs">Bugs</TabsTrigger>
        </TabsList>
        <TabsContent value="test-cases">
          <TestCasesPanel groupId={groupId} recipeBookId={recipeBookId} />
        </TabsContent>
        <TabsContent value="bugs">
          <BugsPanel groupId={groupId} recipeBookId={recipeBookId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

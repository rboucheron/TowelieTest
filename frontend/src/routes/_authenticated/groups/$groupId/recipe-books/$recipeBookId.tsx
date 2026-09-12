import { createFileRoute } from '@tanstack/react-router'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { useRecipeBookQuery } from '@/features/recipe-books'
import { TestCasesPanel } from '@/features/test-cases'
import { BugsPanel } from '@/features/bugs'

export const Route = createFileRoute(
  '/_authenticated/groups/$groupId/recipe-books/$recipeBookId',
)({
  component: RecipeBookPage,
})

function RecipeBookPage() {
  const { groupId, recipeBookId } = Route.useParams()
  const recipeBookQuery = useRecipeBookQuery(recipeBookId)

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">
          {recipeBookQuery.data?.title}
        </h1>
        <p className="text-muted-foreground">
          {recipeBookQuery.data?.description}
        </p>
      </div>

      <Tabs defaultValue="test-cases">
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

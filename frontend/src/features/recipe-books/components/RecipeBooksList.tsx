import { Link } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui'
import { useCan } from '@/features/auth/hooks/use-can'
import { CreateRecipeBookDialog } from '@/features/recipe-books/components/CreateRecipeBookDialog'
import { useRecipeBooksQuery } from '@/features/recipe-books/hooks/use-recipe-books'

export interface RecipeBooksListProps {
  groupId: string
  query?: string
}

export function RecipeBooksList({ groupId, query }: RecipeBooksListProps) {
  const recipeBooksQuery = useRecipeBooksQuery(groupId)
  const canCreate = useCan(groupId, 'MAINTAINER')

  const recipeBooks = (recipeBooksQuery.data ?? []).filter((recipeBook) =>
    query ? recipeBook.title.toLowerCase().includes(query.toLowerCase()) : true,
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Recipe books</h2>
        {canCreate ? <CreateRecipeBookDialog groupId={groupId} /> : null}
      </div>

      {recipeBooksQuery.data?.length === 0 ? (
        <p className="text-sm text-muted-foreground">No recipe books yet.</p>
      ) : null}

      {recipeBooksQuery.data &&
      recipeBooksQuery.data.length > 0 &&
      recipeBooks.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No recipe books match “{query}”.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {recipeBooks.map((recipeBook) => (
          <Link
            key={recipeBook.id}
            to="/groups/$groupId/recipe-books/$recipeBookId"
            params={{ groupId, recipeBookId: recipeBook.id }}
          >
            <Card className="transition hover:-translate-y-0.5 hover:shadow-md">
              <CardHeader>
                <CardTitle>{recipeBook.title}</CardTitle>
                <CardDescription>{recipeBook.description}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

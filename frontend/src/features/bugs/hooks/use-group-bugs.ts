import { useQueries } from '@tanstack/react-query'
import { listBugs } from '@/api'
import type { Bug } from '@/api'
import { useRecipeBooksQuery } from '@/features/recipe-books'
import { queryKeys } from '@/lib/query-keys'

export interface GroupBugEntry extends Bug {
  recipeBookTitle: string
}

export function useGroupBugsQuery(groupId: string) {
  const recipeBooksQuery = useRecipeBooksQuery(groupId)
  const recipeBooks = recipeBooksQuery.data ?? []

  const bugQueries = useQueries({
    queries: recipeBooks.map((recipeBook) => ({
      queryKey: queryKeys.bugs(recipeBook.id),
      queryFn: () => listBugs(recipeBook.id),
      enabled: recipeBooksQuery.isSuccess,
    })),
  })

  const isLoading =
    recipeBooksQuery.isLoading || bugQueries.some((query) => query.isLoading)

  const bugs: GroupBugEntry[] = recipeBooks.flatMap((recipeBook, index) => {
    const data = bugQueries[index]?.data ?? []
    return data.map((bug) => ({ ...bug, recipeBookTitle: recipeBook.title }))
  })

  return { bugs, isLoading }
}

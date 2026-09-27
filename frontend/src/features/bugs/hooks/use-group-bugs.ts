import { useQuery } from '@tanstack/react-query'
import { listGroupBugs } from '@/api'
import { queryKeys } from '@/lib/query-keys'

export function useGroupBugsQuery(groupId: string) {
  const query = useQuery({
    queryKey: queryKeys.groupBugs(groupId),
    queryFn: () => listGroupBugs(groupId),
  })

  return { bugs: query.data ?? [], isLoading: query.isLoading }
}

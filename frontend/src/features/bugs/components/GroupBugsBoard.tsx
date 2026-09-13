import { Link } from '@tanstack/react-router'
import { BUG_PRIORITIES } from '@/api'
import { StatusBadge } from '@/components/StatusBadge'
import { BUG_PRIORITY_TONE } from '@/lib/status-tones'
import { useGroupBugsQuery } from '@/features/bugs/hooks/use-group-bugs'

export interface GroupBugsBoardProps {
  groupId: string
}

const PRIORITY_LABELS: Record<(typeof BUG_PRIORITIES)[number], string> = {
  BLOCKING: 'Blocking',
  MAJOR: 'Major',
  MINOR: 'Minor',
}

export function GroupBugsBoard({ groupId }: GroupBugsBoardProps) {
  const { bugs, isLoading } = useGroupBugsQuery(groupId)

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>
  }

  if (bugs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No bugs reported in this group yet.
      </p>
    )
  }

  const columns = [...BUG_PRIORITIES].reverse()

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {columns.map((priority) => {
        const bugsForColumn = bugs.filter((bug) => bug.priority === priority)

        return (
          <div
            key={priority}
            className="flex min-h-40 flex-col gap-3 rounded-lg border bg-muted/40 p-3"
          >
            <div className="flex items-center justify-between px-1">
              <StatusBadge tone={BUG_PRIORITY_TONE[priority]}>
                {PRIORITY_LABELS[priority]}
              </StatusBadge>
              <span className="text-xs font-medium text-muted-foreground">
                {bugsForColumn.length}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {bugsForColumn.map((bug) => (
                <Link
                  key={bug.id}
                  to="/groups/$groupId/recipe-books/$recipeBookId"
                  params={{ groupId, recipeBookId: bug.recipeBookId }}
                  search={{ tab: 'bugs' }}
                  className="rounded-md border bg-card p-3 text-sm shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <p className="line-clamp-3 font-medium text-card-foreground">
                    {bug.problemDescription}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {bug.recipeBookTitle} · {bug.environment}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

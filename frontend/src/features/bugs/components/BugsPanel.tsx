import { Link, useNavigate } from '@tanstack/react-router'
import { StatusBadge } from '@/components/StatusBadge'
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'
import { useCan } from '@/features/auth/hooks/use-can'
import { CreateBugDialog } from '@/features/bugs/components/CreateBugDialog'
import {
  useBugsQuery,
  useRemoveBugMutation,
} from '@/features/bugs/hooks/use-bugs'
import { BUG_PRIORITY_TONE } from '@/lib/status-tones'

export interface BugsPanelProps {
  groupId: string
  recipeBookId: string
}

export function BugsPanel({ groupId, recipeBookId }: BugsPanelProps) {
  const bugsQuery = useBugsQuery(recipeBookId)
  const removeBugMutation = useRemoveBugMutation(recipeBookId)
  const canManage = useCan(groupId, 'QA')
  const navigate = useNavigate()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Bugs</h3>
        {canManage ? (
          <CreateBugDialog groupId={groupId} recipeBookId={recipeBookId} />
        ) : null}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Problem</TableHead>
            <TableHead>Environment</TableHead>
            <TableHead>Priority</TableHead>
            {canManage ? <TableHead /> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {bugsQuery.data?.map((bug) => (
            <TableRow
              key={bug.id}
              className="cursor-pointer"
              onClick={() =>
                navigate({
                  to: '/groups/$groupId/bugs/$bugId',
                  params: { groupId, bugId: bug.id },
                })
              }
            >
              <TableCell className="max-w-md whitespace-pre-wrap">
                <Link
                  to="/groups/$groupId/bugs/$bugId"
                  params={{ groupId, bugId: bug.id }}
                  className="font-medium hover:underline"
                  onClick={(event) => event.stopPropagation()}
                >
                  {bug.problemDescription}
                </Link>
              </TableCell>
              <TableCell>{bug.environment}</TableCell>
              <TableCell>
                <StatusBadge tone={BUG_PRIORITY_TONE[bug.priority]}>
                  {bug.priority}
                </StatusBadge>
              </TableCell>
              {canManage ? (
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(event) => {
                      event.stopPropagation()
                      removeBugMutation.mutate(bug.id)
                    }}
                  >
                    Remove
                  </Button>
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

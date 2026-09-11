import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@towelie/ui'
import { useCan } from '@/features/auth/hooks/use-can'
import { CreateBugDialog } from '@/features/bugs/components/CreateBugDialog'
import {
  useBugsQuery,
  useRemoveBugMutation,
} from '@/features/bugs/hooks/use-bugs'

export interface BugsPanelProps {
  groupId: string
  recipeBookId: string
}

const PRIORITY_VARIANT = {
  BLOCKING: 'destructive',
  MAJOR: 'default',
  MINOR: 'secondary',
} as const

export function BugsPanel({ groupId, recipeBookId }: BugsPanelProps) {
  const bugsQuery = useBugsQuery(recipeBookId)
  const removeBugMutation = useRemoveBugMutation(recipeBookId)
  const canManage = useCan(groupId, 'QA')

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
            <TableRow key={bug.id}>
              <TableCell className="max-w-md whitespace-pre-wrap">
                {bug.problemDescription}
              </TableCell>
              <TableCell>{bug.environment}</TableCell>
              <TableCell>
                <Badge variant={PRIORITY_VARIANT[bug.priority]}>
                  {bug.priority}
                </Badge>
              </TableCell>
              {canManage ? (
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeBugMutation.mutate(bug.id)}
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

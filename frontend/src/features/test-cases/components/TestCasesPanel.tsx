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
import { CreateTestCaseDialog } from '@/features/test-cases/components/CreateTestCaseDialog'
import {
  useRemoveTestCaseMutation,
  useTestCasesQuery,
} from '@/features/test-cases/hooks/use-test-cases'
import { TEST_CASE_PRIORITY_TONE } from '@/lib/status-tones'

export interface TestCasesPanelProps {
  groupId: string
  recipeBookId: string
}

export function TestCasesPanel({ groupId, recipeBookId }: TestCasesPanelProps) {
  const testCasesQuery = useTestCasesQuery(recipeBookId)
  const removeTestCaseMutation = useRemoveTestCaseMutation(recipeBookId)
  const canManage = useCan(groupId, 'QA')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Test cases</h3>
        {canManage ? (
          <CreateTestCaseDialog recipeBookId={recipeBookId} />
        ) : null}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead>Priority</TableHead>
            {canManage ? <TableHead /> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {testCasesQuery.data?.map((testCase) => (
            <TableRow key={testCase.id}>
              <TableCell className="max-w-md whitespace-pre-wrap">
                {testCase.description}
              </TableCell>
              <TableCell>{testCase.platform}</TableCell>
              <TableCell>
                <StatusBadge tone={TEST_CASE_PRIORITY_TONE[testCase.priority]}>
                  {testCase.priority}
                </StatusBadge>
              </TableCell>
              {canManage ? (
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTestCaseMutation.mutate(testCase.id)}
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

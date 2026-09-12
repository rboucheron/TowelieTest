import { GROUP_ROLES, ROLE_LABELS  } from '@/api'
import type {GroupRole} from '@/api';
import {
  Badge,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'
import { useCan } from '@/features/auth/hooks/use-can'
import { AddMemberDialog } from '@/features/groups/components/AddMemberDialog'
import {
  useMembersQuery,
  useRemoveMemberMutation,
  useUpdateMemberRoleMutation,
} from '@/features/groups/hooks/use-groups'

export interface MembersPanelProps {
  groupId: string
}

export function MembersPanel({ groupId }: MembersPanelProps) {
  const membersQuery = useMembersQuery(groupId)
  const updateRoleMutation = useUpdateMemberRoleMutation(groupId)
  const removeMemberMutation = useRemoveMemberMutation(groupId)
  const canManage = useCan(groupId, 'ADMIN')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Members</h2>
        {canManage ? <AddMemberDialog groupId={groupId} /> : null}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            {canManage ? <TableHead /> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {membersQuery.data?.map((member) => (
            <TableRow key={member.userId}>
              <TableCell>
                {member.firstName} {member.lastName}
              </TableCell>
              <TableCell>{member.email}</TableCell>
              <TableCell>
                {canManage ? (
                  <Select
                    value={member.role}
                    onValueChange={(role) =>
                      updateRoleMutation.mutate({
                        userId: member.userId,
                        role: role as GroupRole,
                      })
                    }
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GROUP_ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {ROLE_LABELS[role]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="secondary">{ROLE_LABELS[member.role]}</Badge>
                )}
              </TableCell>
              {canManage ? (
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMemberMutation.mutate(member.userId)}
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

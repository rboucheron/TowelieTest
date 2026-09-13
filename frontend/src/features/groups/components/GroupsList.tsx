import { Link } from '@tanstack/react-router'
import { formatDistanceToNow } from 'date-fns'
import { ROLE_LABELS } from '@/api'
import { GroupAvatar } from '@/components/GroupAvatar'
import { StatusBadge } from '@/components/StatusBadge'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { CreateGroupDialog } from '@/features/groups/components/CreateGroupDialog'
import { GroupActionsMenu } from '@/features/groups/components/GroupActionsMenu'
import { useGroupsQuery } from '@/features/groups/hooks/use-groups'
import { ROLE_TONE } from '@/lib/status-tones'

export interface GroupsListProps {
  query?: string
}

export function GroupsList({ query }: GroupsListProps) {
  const groupsQuery = useGroupsQuery()
  const meQuery = useMeQuery()

  const groups = (groupsQuery.data ?? []).filter((group) =>
    query ? group.name.toLowerCase().includes(query.toLowerCase()) : true,
  )

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Groups</h1>
        {meQuery.data?.user.isSuperAdmin ? <CreateGroupDialog /> : null}
      </div>

      {groupsQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : null}

      {groupsQuery.data?.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          You are not a member of any group yet.
        </p>
      ) : null}

      {groupsQuery.data && groupsQuery.data.length > 0 && groups.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No groups match “{query}”.
        </p>
      ) : null}

      {groups.length > 0 ? (
        <div className="divide-y divide-border rounded-lg border bg-card">
          {groups.map((group) => {
            const canManage = Boolean(
              meQuery.data?.user.isSuperAdmin || group.myRole === 'ADMIN',
            )

            return (
              <div key={group.id} className="flex items-center gap-3 px-4 py-3">
                <GroupAvatar name={group.name} />
                <div className="min-w-0 flex-1">
                  <Link
                    to="/groups/$groupId"
                    params={{ groupId: group.id }}
                    className="font-semibold text-foreground hover:underline"
                  >
                    {group.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    Created{' '}
                    {formatDistanceToNow(new Date(group.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                {group.myRole ? (
                  <StatusBadge tone={ROLE_TONE[group.myRole]}>
                    {ROLE_LABELS[group.myRole]}
                  </StatusBadge>
                ) : null}
                <GroupActionsMenu group={group} canManage={canManage} />
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

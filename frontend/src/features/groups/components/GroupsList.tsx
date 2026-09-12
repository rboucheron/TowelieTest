import { Link } from '@tanstack/react-router'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { CreateGroupDialog } from '@/features/groups/components/CreateGroupDialog'
import { useGroupsQuery } from '@/features/groups/hooks/use-groups'

export function GroupsList() {
  const groupsQuery = useGroupsQuery()
  const meQuery = useMeQuery()

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Groups</h1>
        {meQuery.data?.user.isSuperAdmin ? <CreateGroupDialog /> : null}
      </div>

      {groupsQuery.isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : null}

      {groupsQuery.data?.length === 0 ? (
        <p className="text-muted-foreground">
          You are not a member of any group yet.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {groupsQuery.data?.map((group) => (
          <Link
            key={group.id}
            to="/groups/$groupId"
            params={{ groupId: group.id }}
          >
            <Card className="transition hover:-translate-y-0.5 hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {group.name}
                  {group.myRole ? (
                    <Badge variant="secondary">{group.myRole}</Badge>
                  ) : null}
                </CardTitle>
              </CardHeader>
              <CardContent />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

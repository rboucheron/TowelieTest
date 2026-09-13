import { Link } from '@tanstack/react-router'
import { Bug, LayoutGrid, Package, Settings, Users } from 'lucide-react'
import { ROLE_LABELS } from '@/api'
import { GroupAvatar } from '@/components/GroupAvatar'
import { StatusBadge } from '@/components/StatusBadge'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui'
import { useCan } from '@/features/auth'
import { useGroupBugsQuery } from '@/features/bugs'
import { useGroupQuery, useMembersQuery } from '@/features/groups'
import { useRecipeBooksQuery } from '@/features/recipe-books'
import { ROLE_TONE } from '@/lib/status-tones'

export interface AppSidebarProps {
  groupId: string
}

export function AppSidebar({ groupId }: AppSidebarProps) {
  const groupQuery = useGroupQuery(groupId)
  const membersQuery = useMembersQuery(groupId)
  const recipeBooksQuery = useRecipeBooksQuery(groupId)
  const { bugs } = useGroupBugsQuery(groupId)
  const canManage = useCan(groupId, 'ADMIN')
  const group = groupQuery.data

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="gap-2 border-b px-3 py-3">
        <div className="flex items-center gap-2 overflow-hidden group-data-[collapsible=icon]:justify-center">
          <GroupAvatar name={group?.name ?? '?'} size="md" />
          <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold text-sidebar-foreground">
              {group?.name ?? '…'}
            </span>
            {group?.myRole ? (
              <StatusBadge tone={ROLE_TONE[group.myRole]} className="mt-0.5 w-fit">
                {ROLE_LABELS[group.myRole]}
              </StatusBadge>
            ) : null}
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Group</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Recipe books">
                  <Link to="/groups/$groupId" params={{ groupId }}>
                    <LayoutGrid />
                    <span>Recipe books</span>
                  </Link>
                </SidebarMenuButton>
                <SidebarMenuBadge>
                  {recipeBooksQuery.data?.length ?? 0}
                </SidebarMenuBadge>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Bugs">
                  <Link to="/groups/$groupId/bugs" params={{ groupId }}>
                    <Bug />
                    <span>Bugs</span>
                  </Link>
                </SidebarMenuButton>
                <SidebarMenuBadge>{bugs.length}</SidebarMenuBadge>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Members">
                  <Link
                    to="/groups/$groupId/settings"
                    params={{ groupId }}
                    search={{ tab: 'members' }}
                  >
                    <Users />
                    <span>Members</span>
                  </Link>
                </SidebarMenuButton>
                <SidebarMenuBadge>
                  {membersQuery.data?.length ?? 0}
                </SidebarMenuBadge>
              </SidebarMenuItem>

              {canManage ? (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Products">
                    <Link
                      to="/groups/$groupId/settings"
                      params={{ groupId }}
                      search={{ tab: 'products' }}
                    >
                      <Package />
                      <span>Products</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : null}

              {canManage ? (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Settings">
                    <Link to="/groups/$groupId/settings" params={{ groupId }}>
                      <Settings />
                      <span>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : null}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

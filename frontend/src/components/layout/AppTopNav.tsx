import { Link, useLocation, useNavigate, useParams } from '@tanstack/react-router'
import { Bug, ChevronDown, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { CreateBugDialog } from '@/features/bugs/components/CreateBugDialog'
import { useGroupBugsQuery } from '@/features/bugs/hooks/use-group-bugs'
import { CreateRecipeBookDialog } from '@/features/recipe-books/components/CreateRecipeBookDialog'
import { useRecipeBooksQuery } from '@/features/recipe-books/hooks/use-recipe-books'
import { CreateTestCaseDialog } from '@/features/test-cases/components/CreateTestCaseDialog'
import ThemeToggle from '@/components/ThemeToggle'
import {
  Avatar,
  AvatarFallback,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  SidebarTrigger,
} from '@/components/ui'
import { useLogoutMutation, useMeQuery } from '@/features/auth'
import { CreateGroupDialog } from '@/features/groups/components/CreateGroupDialog'

type ActiveCreate = 'group' | 'recipe-book' | 'test-case' | 'bug' | null

function GroupCounters({ groupId }: { groupId: string }) {
  const recipeBooksQuery = useRecipeBooksQuery(groupId)
  const { bugs } = useGroupBugsQuery(groupId)

  return (
    <>
      <Link
        to="/groups/$groupId"
        params={{ groupId }}
        className="flex items-center gap-1.5 rounded-md border bg-card px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        {recipeBooksQuery.data?.length ?? 0} recipe books
      </Link>
      <Link
        to="/groups/$groupId/bugs"
        params={{ groupId }}
        className="flex items-center gap-1.5 rounded-md border bg-card px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        <Bug className="size-3.5" />
        {bugs.length}
      </Link>
    </>
  )
}

export function AppTopNav() {
  const meQuery = useMeQuery()
  const logoutMutation = useLogoutMutation()
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams({ strict: false })
  const search = location.search as { q?: string }
  const [activeCreate, setActiveCreate] = useState<ActiveCreate>(null)

  const { groupId, recipeBookId } = params
  const segments = location.pathname.split('/').filter(Boolean)
  const isGroupsList = segments.length === 1 && segments[0] === 'groups'
  const isGroupOverview =
    !!groupId && segments.length === 2 && segments[1] === groupId
  const searchEnabled = isGroupsList || isGroupOverview

  function handleSearchChange(value: string) {
    if (isGroupsList) {
      void navigate({
        to: '/groups',
        search: { q: value || undefined },
      })
    } else if (isGroupOverview && groupId) {
      void navigate({
        to: '/groups/$groupId',
        params: { groupId },
        search: { q: value || undefined },
      })
    }
  }

  const user = meQuery.data?.user
  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : '?'

  return (
    <header className="flex h-14 items-center gap-3 border-b bg-card px-3">
      <SidebarTrigger />
      <Link
        to="/groups"
        className="text-sm font-bold tracking-tight text-foreground"
      >
        Towelie Test
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" className="gap-1">
            <Plus className="size-4" />
            Create
            <ChevronDown className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {user?.isSuperAdmin ? (
            <DropdownMenuItem onSelect={() => setActiveCreate('group')}>
              New group
            </DropdownMenuItem>
          ) : null}
          {groupId ? (
            <DropdownMenuItem onSelect={() => setActiveCreate('recipe-book')}>
              New recipe book
            </DropdownMenuItem>
          ) : null}
          {groupId && recipeBookId ? (
            <>
              <DropdownMenuItem onSelect={() => setActiveCreate('test-case')}>
                New test case
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setActiveCreate('bug')}>
                Report a bug
              </DropdownMenuItem>
            </>
          ) : null}
          {!user?.isSuperAdmin && !groupId ? (
            <DropdownMenuItem disabled>
              Open a group to create content
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateGroupDialog
        trigger={null}
        open={activeCreate === 'group'}
        onOpenChange={(open) => setActiveCreate(open ? 'group' : null)}
      />
      {groupId ? (
        <CreateRecipeBookDialog
          groupId={groupId}
          trigger={null}
          open={activeCreate === 'recipe-book'}
          onOpenChange={(open) => setActiveCreate(open ? 'recipe-book' : null)}
        />
      ) : null}
      {groupId && recipeBookId ? (
        <>
          <CreateTestCaseDialog
            recipeBookId={recipeBookId}
            trigger={null}
            open={activeCreate === 'test-case'}
            onOpenChange={(open) => setActiveCreate(open ? 'test-case' : null)}
          />
          <CreateBugDialog
            groupId={groupId}
            recipeBookId={recipeBookId}
            trigger={null}
            open={activeCreate === 'bug'}
            onOpenChange={(open) => setActiveCreate(open ? 'bug' : null)}
          />
        </>
      ) : null}

      <div className="relative w-full max-w-sm">
        <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search.q ?? ''}
          onChange={(event) => handleSearchChange(event.target.value)}
          disabled={!searchEnabled}
          placeholder={searchEnabled ? 'Search' : 'Search unavailable here'}
          className="h-8 pl-8"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {groupId ? <GroupCounters groupId={groupId} /> : null}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Avatar size="sm">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="flex flex-col">
              <span className="font-semibold">
                {user?.firstName} {user?.lastName}
                {user?.isSuperAdmin ? ' (Super-Admin)' : ''}
              </span>
              <span className="text-xs font-normal text-muted-foreground">
                {user?.email}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-sm">Theme</span>
              <ThemeToggle />
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => logoutMutation.mutate()}
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

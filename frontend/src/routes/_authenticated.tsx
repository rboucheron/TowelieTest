import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
} from '@tanstack/react-router'
import { useEffect } from 'react'
import { Button } from '@/components/ui'
import { useLogoutMutation, useMeQuery } from '@/features/auth'

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const meQuery = useMeQuery()
  const logoutMutation = useLogoutMutation()
  const navigate = useNavigate()

  useEffect(() => {
    if (meQuery.isError) {
      void navigate({ to: '/login' })
    }
  }, [meQuery.isError, navigate])

  if (meQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    )
  }

  if (!meQuery.data) {
    return null
  }

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <Link to="/groups" className="font-semibold">
          Towelie Test
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <span>
            {meQuery.data.user.firstName} {meQuery.data.user.lastName}
            {meQuery.data.user.isSuperAdmin ? ' (Super-Admin)' : ''}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => logoutMutation.mutate()}
          >
            Sign out
          </Button>
        </div>
      </header>
      <Outlet />
    </div>
  )
}

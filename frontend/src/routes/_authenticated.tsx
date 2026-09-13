import { createFileRoute, Outlet, useNavigate, useParams } from '@tanstack/react-router'
import { useEffect } from 'react'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { AppTopNav } from '@/components/layout/AppTopNav'
import { SidebarInset, SidebarProvider } from '@/components/ui'
import { useMeQuery } from '@/features/auth'

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const meQuery = useMeQuery()
  const navigate = useNavigate()
  const { groupId } = useParams({ strict: false })

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
    <SidebarProvider>
      {groupId ? <AppSidebar groupId={groupId} /> : null}
      <SidebarInset>
        <AppTopNav />
        <main className="flex-1 bg-background">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { LoginForm } from '@/features/auth'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6 rounded-xl border p-8 shadow-sm">
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-semibold">Towelie Test</h1>
          <p className="text-muted-foreground text-sm">
            Sign in to your account
          </p>
        </div>
        <LoginForm onSuccess={() => navigate({ to: '/groups' })} />
      </div>
    </div>
  )
}

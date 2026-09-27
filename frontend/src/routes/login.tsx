import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { Alert, AlertDescription } from '@/components/ui'
import { AuthDivider, GithubLoginButton, LoginForm } from '@/features/auth'

const GITHUB_ERROR_MESSAGES = {
  github_unavailable: 'GitHub sign-in is not configured on this server.',
  github_no_email:
    'Your GitHub account has no verified primary email, so we could not sign you in.',
  github_failed: 'GitHub sign-in failed, please try again.',
} as const

const LoginSearchSchema = z.object({
  error: z
    .enum(['github_unavailable', 'github_no_email', 'github_failed'])
    .optional()
    .catch(undefined),
})

export const Route = createFileRoute('/login')({
  validateSearch: LoginSearchSchema,
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const { error } = Route.useSearch()

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6 rounded-xl border p-8 shadow-sm">
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-semibold">Towelie Test</h1>
          <p className="text-muted-foreground text-sm">
            Sign in to your account
          </p>
        </div>
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{GITHUB_ERROR_MESSAGES[error]}</AlertDescription>
          </Alert>
        ) : null}
        <GithubLoginButton />
        <AuthDivider />
        <LoginForm onSuccess={() => navigate({ to: '/groups' })} />
        <p className="text-muted-foreground text-center text-sm">
          No account yet?{' '}
          <Link to="/register" className="text-foreground underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}

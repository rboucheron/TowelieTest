import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { AuthDivider, GithubLoginButton, RegisterForm } from '@/features/auth'

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})

function RegisterPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6 rounded-xl border p-8 shadow-sm">
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-semibold">Towelie Test</h1>
          <p className="text-muted-foreground text-sm">Create your account</p>
        </div>
        <GithubLoginButton />
        <AuthDivider />
        <RegisterForm onSuccess={() => navigate({ to: '/groups' })} />
        <p className="text-muted-foreground text-center text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-foreground underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

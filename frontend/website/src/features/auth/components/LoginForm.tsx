import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { LoginInputSchema  } from '@towelie/api'
import type {LoginInput} from '@towelie/api';
import {
  Alert,
  AlertDescription,
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@towelie/ui'
import { useLoginMutation } from '@/features/auth/hooks/use-auth'

export interface LoginFormProps {
  onSuccess: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const loginMutation = useLoginMutation()
  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginInputSchema),
    defaultValues: { email: '', password: '' },
  })

  function onSubmit(values: LoginInput) {
    loginMutation.mutate(values, { onSuccess })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {loginMutation.isError ? (
          <Alert variant="destructive">
            <AlertDescription>Invalid email or password.</AlertDescription>
          </Alert>
        ) : null}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="current-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </Form>
  )
}

import { zodResolver } from '@hookform/resolvers/zod'
import { formatDistanceToNow } from 'date-fns'
import { useForm } from 'react-hook-form'
import { CreateBugCommentInputSchema } from '@/api'
import type { CreateBugCommentInput } from '@/api'
import { UserAvatar, userDisplayName } from '@/components/UserAvatar'
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Textarea,
} from '@/components/ui'
import {
  useBugCommentsQuery,
  useCreateBugCommentMutation,
} from '@/features/bugs/hooks/use-bug-detail'

export interface BugCommentsProps {
  bugId: string
  reporterId: string
}

export function BugComments({ bugId, reporterId }: BugCommentsProps) {
  const commentsQuery = useBugCommentsQuery(bugId)
  const createCommentMutation = useCreateBugCommentMutation(bugId)
  const form = useForm<CreateBugCommentInput>({
    resolver: zodResolver(CreateBugCommentInputSchema),
    defaultValues: { content: '' },
  })

  function onSubmit(values: CreateBugCommentInput) {
    createCommentMutation.mutate(values, {
      onSuccess: () => form.reset(),
    })
  }

  const comments = commentsQuery.data ?? []

  return (
    <section className="space-y-4">
      <h2 className="text-base font-semibold">
        Comments
        <span className="ml-2 text-sm font-normal text-muted-foreground">
          {comments.length}
        </span>
      </h2>

      {commentsQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No comments yet. Be the first to add context.
        </p>
      ) : (
        <ol className="space-y-3">
          {comments.map((comment) => (
            <li key={comment.id} className="flex gap-3">
              <UserAvatar user={comment.author} size="sm" className="mt-1" />
              <div className="min-w-0 flex-1 rounded-lg border bg-card p-3">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                  <span className="font-medium text-card-foreground">
                    {userDisplayName(comment.author)}
                  </span>
                  {comment.author?.id === reporterId ? (
                    <span className="rounded-full border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      Reporter
                    </span>
                  ) : null}
                  <time
                    dateTime={comment.createdAt}
                    title={new Date(comment.createdAt).toLocaleString()}
                    className="text-xs text-muted-foreground"
                  >
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                    })}
                  </time>
                </div>
                <p className="mt-1.5 text-sm break-words whitespace-pre-wrap text-card-foreground">
                  {comment.content}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder="Add a comment…"
                    aria-label="Add a comment"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {createCommentMutation.isError ? (
            <p className="text-sm text-destructive">
              Your comment could not be posted. Please try again.
            </p>
          ) : null}
          <div className="flex justify-end">
            <Button type="submit" disabled={createCommentMutation.isPending}>
              {createCommentMutation.isPending ? 'Posting…' : 'Comment'}
            </Button>
          </div>
        </form>
      </Form>
    </section>
  )
}

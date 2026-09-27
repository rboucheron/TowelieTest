import { Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import { ArrowLeft } from 'lucide-react'
import type { BugPriority } from '@/api'
import { StatusBadge } from '@/components/StatusBadge'
import { UserAvatar, userDisplayName } from '@/components/UserAvatar'
import { Separator } from '@/components/ui'
import { BugComments } from '@/features/bugs/components/BugComments'
import { useBugQuery } from '@/features/bugs/hooks/use-bug-detail'
import { useProductsQuery } from '@/features/products/hooks/use-products'
import { useRecipeBooksQuery } from '@/features/recipe-books'
import { BUG_PRIORITY_TONE } from '@/lib/status-tones'

const PRIORITY_LABELS: Record<BugPriority, string> = {
  BLOCKING: 'Blocking',
  MAJOR: 'Major',
  MINOR: 'Minor',
}

export interface BugDetailViewProps {
  groupId: string
  bugId: string
}

function Section({
  title,
  children,
  className,
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={className}>
      <h2 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </h2>
      {children}
    </section>
  )
}

export function BugDetailView({ groupId, bugId }: BugDetailViewProps) {
  const bugQuery = useBugQuery(bugId)
  const productsQuery = useProductsQuery(groupId)
  const recipeBooksQuery = useRecipeBooksQuery(groupId)

  if (bugQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>
  }

  const bug = bugQuery.data
  if (!bug) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          This bug does not exist or you no longer have access to it.
        </p>
        <Link
          to="/groups/$groupId/bugs"
          params={{ groupId }}
          className="text-sm font-medium text-primary hover:underline"
        >
          Back to bugs
        </Link>
      </div>
    )
  }

  const recipeBook = recipeBooksQuery.data?.find(
    (rb) => rb.id === bug.recipeBookId,
  )
  const productNames = bug.affectedProductIds.map(
    (id) => productsQuery.data?.find((p) => p.id === id)?.name ?? '…',
  )
  const steps = bug.stepsToReproduce.split('\n').filter((s) => s.trim())

  return (
    <div className="space-y-6">
      <Link
        to="/groups/$groupId/recipe-books/$recipeBookId"
        params={{ groupId, recipeBookId: bug.recipeBookId }}
        search={{ tab: 'bugs' }}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {recipeBook?.title ?? 'Recipe book'}
      </Link>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone={BUG_PRIORITY_TONE[bug.priority]}>
            {PRIORITY_LABELS[bug.priority]}
          </StatusBadge>
          <StatusBadge tone="neutral">{bug.environment}</StatusBadge>
          {productNames.map((name, index) => (
            <StatusBadge key={bug.affectedProductIds[index]} tone="neutral">
              {name}
            </StatusBadge>
          ))}
        </div>
        <h1 className="text-xl font-semibold break-words whitespace-pre-wrap text-foreground">
          {bug.problemDescription}
        </h1>
        <div className="flex items-center gap-3">
          <UserAvatar user={bug.createdBy} />
          <div className="text-sm">
            <p className="font-medium text-foreground">
              {userDisplayName(bug.createdBy)}
            </p>
            <p className="text-muted-foreground">
              Reported on{' '}
              <time dateTime={bug.createdAt}>
                {format(new Date(bug.createdAt), "d MMM yyyy 'at' HH:mm")}
              </time>
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Section
          title="Expected behavior"
          className="rounded-lg border border-status-success-border bg-status-success-bg/40 p-4"
        >
          <p className="text-sm break-words whitespace-pre-wrap">
            {bug.expectedBehavior}
          </p>
        </Section>
        <Section
          title="Observed behavior"
          className="rounded-lg border border-status-danger-border bg-status-danger-bg/40 p-4"
        >
          <p className="text-sm break-words whitespace-pre-wrap">
            {bug.observedBehavior}
          </p>
        </Section>
      </div>

      <Section title="Steps to reproduce">
        <ol className="list-decimal space-y-1 pl-5 text-sm">
          {steps.map((step, index) => (
            <li key={index} className="break-words">
              {step}
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Evidence and context">
        {bug.evidenceAndContext.trim() ? (
          <p className="text-sm break-words whitespace-pre-wrap">
            {bug.evidenceAndContext}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">None provided.</p>
        )}
      </Section>

      <Separator />

      <BugComments bugId={bug.id} reporterId={bug.createdById} />
    </div>
  )
}

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { BUG_PRIORITIES, CreateBugInputSchema } from '@/api'
import type { BugPriority, CreateBugInput } from '@/api'
import { OrderedStepsField } from '@/components/OrderedStepsField'
import { PriorityToggleField } from '@/components/PriorityToggleField'
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/components/ui'
import { BUG_PRIORITY_TONE } from '@/lib/status-tones'
import { useCreateBugMutation } from '@/features/bugs/hooks/use-bugs'
import { useProductsQuery } from '@/features/products/hooks/use-products'

const ENVIRONMENT_OPTIONS = ['Recette', 'Staging', 'Pre-Prod', 'Production']

const PRIORITY_OPTIONS: Array<{
  value: BugPriority
  label: string
  tone: (typeof BUG_PRIORITY_TONE)[BugPriority]
}> = BUG_PRIORITIES.map((priority) => ({
  value: priority,
  label:
    priority === 'MINOR' ? 'Minor' : priority === 'MAJOR' ? 'Major' : 'Blocking',
  tone: BUG_PRIORITY_TONE[priority],
}))

export interface CreateBugDialogProps {
  groupId: string
  recipeBookId: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode | null
}

export function CreateBugDialog({
  groupId,
  recipeBookId,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  trigger,
}: CreateBugDialogProps) {
  const [openState, setOpenState] = useState(false)
  const open = openProp ?? openState
  const setOpen = onOpenChangeProp ?? setOpenState
  const productsQuery = useProductsQuery(groupId)
  const createBugMutation = useCreateBugMutation(recipeBookId)
  const form = useForm<
    z.input<typeof CreateBugInputSchema>,
    undefined,
    CreateBugInput
  >({
    resolver: zodResolver(CreateBugInputSchema),
    defaultValues: {
      affectedProductIds: [],
      environment: '',
      problemDescription: '',
      expectedBehavior: '',
      observedBehavior: '',
      stepsToReproduce: '',
      evidenceAndContext: '',
      priority: 'MINOR',
    },
  })

  function onSubmit(values: CreateBugInput) {
    createBugMutation.mutate(values, {
      onSuccess: () => {
        setOpen(false)
        form.reset()
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger !== null ? (
        <DialogTrigger asChild>
          {trigger ?? <Button variant="destructive">Report bug</Button>}
        </DialogTrigger>
      ) : null}
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Report a bug</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="affectedProductIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Affected products</FormLabel>
                  <div className="flex flex-wrap gap-3">
                    {productsQuery.data?.map((product) => {
                      const checked = field.value.includes(product.id)
                      return (
                        <label
                          key={product.id}
                          className="flex items-center gap-2 rounded-md border bg-card px-2.5 py-1.5 text-sm"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(value) => {
                              field.onChange(
                                value
                                  ? [...field.value, product.id]
                                  : field.value.filter(
                                      (id: string) => id !== product.id,
                                    ),
                              )
                            }}
                          />
                          {product.name}
                        </label>
                      )
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="environment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Environment</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select an environment" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ENVIRONMENT_OPTIONS.map((environment) => (
                          <SelectItem key={environment} value={environment}>
                            {environment}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority / business impact</FormLabel>
                    <PriorityToggleField
                      value={field.value}
                      onChange={field.onChange}
                      options={PRIORITY_OPTIONS}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="problemDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Problem description</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 rounded-lg border bg-muted/40 p-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="expectedBehavior"
                render={({ field }) => (
                  <FormItem className="rounded-md border border-status-success-border bg-status-success-bg/40 p-3">
                    <FormLabel className="text-status-success-fg">
                      Expected behavior
                    </FormLabel>
                    <FormControl>
                      <Textarea rows={4} className="bg-card" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="observedBehavior"
                render={({ field }) => (
                  <FormItem className="rounded-md border border-status-danger-border bg-status-danger-bg/40 p-3">
                    <FormLabel className="text-status-danger-fg">
                      Observed behavior
                    </FormLabel>
                    <FormControl>
                      <Textarea rows={4} className="bg-card" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="stepsToReproduce"
              render={({ field }) => {
                const steps = field.value ? field.value.split('\n') : ['']
                return (
                  <FormItem>
                    <FormLabel>Steps to reproduce</FormLabel>
                    <OrderedStepsField
                      value={steps}
                      onChange={(next) => field.onChange(next.join('\n'))}
                    />
                    <FormMessage />
                  </FormItem>
                )
              }}
            />

            <FormField
              control={form.control}
              name="evidenceAndContext"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Evidence and context</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Logs, screenshot links…"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={createBugMutation.isPending}>
                {createBugMutation.isPending ? 'Reporting…' : 'Report bug'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

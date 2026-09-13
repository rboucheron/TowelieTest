import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { CreateTestCaseInputSchema } from '@/api'
import type { CreateTestCaseInput, TestCasePriority } from '@/api'
import { OrderedStepsField } from '@/components/OrderedStepsField'
import { PriorityToggleField } from '@/components/PriorityToggleField'
import {
  Button,
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
import { TEST_CASE_PRIORITY_TONE } from '@/lib/status-tones'
import { useCreateTestCaseMutation } from '@/features/test-cases/hooks/use-test-cases'

const PRIORITY_OPTIONS: Array<{
  value: TestCasePriority
  label: string
  tone: (typeof TEST_CASE_PRIORITY_TONE)[TestCasePriority]
}> = [
  { value: 'LOW', label: 'Low', tone: TEST_CASE_PRIORITY_TONE.LOW },
  { value: 'MEDIUM', label: 'Medium', tone: TEST_CASE_PRIORITY_TONE.MEDIUM },
  { value: 'HIGH', label: 'High', tone: TEST_CASE_PRIORITY_TONE.HIGH },
  {
    value: 'CRITICAL',
    label: 'Critical',
    tone: TEST_CASE_PRIORITY_TONE.CRITICAL,
  },
]

const PLATFORM_OPTIONS = ['Web', 'Mobile iOS', 'Mobile Android', 'API']

export interface CreateTestCaseDialogProps {
  recipeBookId: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode | null
}

export function CreateTestCaseDialog({
  recipeBookId,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  trigger,
}: CreateTestCaseDialogProps) {
  const [openState, setOpenState] = useState(false)
  const open = openProp ?? openState
  const setOpen = onOpenChangeProp ?? setOpenState
  const createTestCaseMutation = useCreateTestCaseMutation(recipeBookId)
  const form = useForm<
    z.input<typeof CreateTestCaseInputSchema>,
    undefined,
    CreateTestCaseInput
  >({
    resolver: zodResolver(CreateTestCaseInputSchema),
    defaultValues: {
      description: '',
      platform: '',
      steps: '',
      expectedResult: '',
      priority: 'MEDIUM',
    },
  })

  function onSubmit(values: CreateTestCaseInput) {
    createTestCaseMutation.mutate(values, {
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
          {trigger ?? <Button>New test case</Button>}
        </DialogTrigger>
      ) : null}
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create a test case</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title / description</FormLabel>
                      <FormControl>
                        <Textarea rows={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="platform"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Platform</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a platform" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PLATFORM_OPTIONS.map((platform) => (
                            <SelectItem key={platform} value={platform}>
                              {platform}
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
                      <FormLabel>Priority</FormLabel>
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

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="steps"
                  render={({ field }) => {
                    const steps = field.value ? field.value.split('\n') : ['']
                    return (
                      <FormItem>
                        <FormLabel>Steps</FormLabel>
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
                  name="expectedResult"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected result</FormLabel>
                      <FormControl>
                        <Textarea rows={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={createTestCaseMutation.isPending}>
                {createTestCaseMutation.isPending ? 'Creating…' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

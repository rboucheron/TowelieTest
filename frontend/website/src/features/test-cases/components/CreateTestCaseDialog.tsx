import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  CreateTestCaseInputSchema,
  TEST_CASE_PRIORITIES
  
} from '@towelie/api'
import type {CreateTestCaseInput} from '@towelie/api';
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
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@towelie/ui'
import { useCreateTestCaseMutation } from '@/features/test-cases/hooks/use-test-cases'

export interface CreateTestCaseDialogProps {
  recipeBookId: string
}

export function CreateTestCaseDialog({
  recipeBookId,
}: CreateTestCaseDialogProps) {
  const [open, setOpen] = useState(false)
  const createTestCaseMutation = useCreateTestCaseMutation(recipeBookId)
  const form = useForm<CreateTestCaseInput>({
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
      <DialogTrigger asChild>
        <Button>New test case</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a test case</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
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
                  <FormControl>
                    <Input placeholder="Web, Mobile, API…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="steps"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Steps</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expectedResult"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected result</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
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
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TEST_CASE_PRIORITIES.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {priority}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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

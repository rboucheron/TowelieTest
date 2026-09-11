import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  BUG_PRIORITIES,
  CreateBugInputSchema
  
} from '@towelie/api'
import type {CreateBugInput} from '@towelie/api';
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
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@towelie/ui'
import { useCreateBugMutation } from '@/features/bugs/hooks/use-bugs'
import { useProductsQuery } from '@/features/products/hooks/use-products'

export interface CreateBugDialogProps {
  groupId: string
  recipeBookId: string
}

export function CreateBugDialog({
  groupId,
  recipeBookId,
}: CreateBugDialogProps) {
  const [open, setOpen] = useState(false)
  const productsQuery = useProductsQuery(groupId)
  const createBugMutation = useCreateBugMutation(recipeBookId)
  const form = useForm<CreateBugInput>({
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
      <DialogTrigger asChild>
        <Button variant="destructive">Report bug</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
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
                  <div className="space-y-2">
                    {productsQuery.data?.map((product) => {
                      const checked = field.value.includes(product.id)
                      return (
                        <label
                          key={product.id}
                          className="flex items-center gap-2 text-sm"
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
            <FormField
              control={form.control}
              name="environment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Environment</FormLabel>
                  <FormControl>
                    <Input placeholder="Staging, Production…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="problemDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Problem description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expectedBehavior"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected behavior</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="observedBehavior"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observed behavior</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stepsToReproduce"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Steps to reproduce</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="evidenceAndContext"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Evidence and context</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Logs, screenshots, links…"
                      {...field}
                    />
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
                  <FormLabel>Priority / business impact</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BUG_PRIORITIES.map((priority) => (
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

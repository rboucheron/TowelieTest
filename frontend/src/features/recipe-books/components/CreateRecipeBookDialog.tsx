import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  CreateRecipeBookInputSchema
  
} from '@/api'
import type {CreateRecipeBookInput} from '@/api';
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
  Textarea,
} from '@/components/ui'
import { useProductsQuery } from '@/features/products/hooks/use-products'
import { useCreateRecipeBookMutation } from '@/features/recipe-books/hooks/use-recipe-books'

export interface CreateRecipeBookDialogProps {
  groupId: string
}

export function CreateRecipeBookDialog({
  groupId,
}: CreateRecipeBookDialogProps) {
  const [open, setOpen] = useState(false)
  const productsQuery = useProductsQuery(groupId)
  const createRecipeBookMutation = useCreateRecipeBookMutation(groupId)
  const form = useForm<z.input<typeof CreateRecipeBookInputSchema>, undefined, CreateRecipeBookInput>({
    resolver: zodResolver(CreateRecipeBookInputSchema),
    defaultValues: { title: '', description: '', productIds: [] },
  })

  function onSubmit(values: CreateRecipeBookInput) {
    createRecipeBookMutation.mutate(values, {
      onSuccess: () => {
        setOpen(false)
        form.reset()
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New recipe book</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a recipe book</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
              name="productIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Products</FormLabel>
                  <div className="space-y-2">
                    {productsQuery.data?.map((product) => {
                      const productIds = field.value ?? []
                      const checked = productIds.includes(product.id)
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
                                  ? [...productIds, product.id]
                                  : productIds.filter(
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
            <DialogFooter>
              <Button
                type="submit"
                disabled={createRecipeBookMutation.isPending}
              >
                {createRecipeBookMutation.isPending ? 'Creating…' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

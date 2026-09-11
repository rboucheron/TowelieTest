import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { CreateProductInputSchema  } from '@towelie/api'
import type {CreateProductInput} from '@towelie/api';
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
} from '@towelie/ui'
import { useCreateProductMutation } from '@/features/products/hooks/use-products'

export interface CreateProductDialogProps {
  groupId: string
}

export function CreateProductDialog({ groupId }: CreateProductDialogProps) {
  const [open, setOpen] = useState(false)
  const createProductMutation = useCreateProductMutation(groupId)
  const form = useForm<CreateProductInput>({
    resolver: zodResolver(CreateProductInputSchema),
    defaultValues: { name: '' },
  })

  function onSubmit(values: CreateProductInput) {
    createProductMutation.mutate(values, {
      onSuccess: () => {
        setOpen(false)
        form.reset()
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New product</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a product</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={createProductMutation.isPending}>
                {createProductMutation.isPending ? 'Creating…' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { CreateGroupInputSchema  } from '@towelie/api'
import type {CreateGroupInput} from '@towelie/api';
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
import { useCreateGroupMutation } from '@/features/groups/hooks/use-groups'

export function CreateGroupDialog() {
  const [open, setOpen] = useState(false)
  const createGroupMutation = useCreateGroupMutation()
  const form = useForm<CreateGroupInput>({
    resolver: zodResolver(CreateGroupInputSchema),
    defaultValues: { name: '' },
  })

  function onSubmit(values: CreateGroupInput) {
    createGroupMutation.mutate(values, {
      onSuccess: () => {
        setOpen(false)
        form.reset()
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New group</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a group</DialogTitle>
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
              <Button type="submit" disabled={createGroupMutation.isPending}>
                {createGroupMutation.isPending ? 'Creating…' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

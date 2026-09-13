import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { MoreVertical } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { UpdateGroupInputSchema } from '@/api'
import type { Group, UpdateGroupInput } from '@/api'
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@/components/ui'
import { useUpdateGroupMutation } from '@/features/groups/hooks/use-groups'

export interface GroupActionsMenuProps {
  group: Group
  canManage: boolean
}

export function GroupActionsMenu({ group, canManage }: GroupActionsMenuProps) {
  const [renameOpen, setRenameOpen] = useState(false)
  const updateGroupMutation = useUpdateGroupMutation(group.id)
  const form = useForm<
    z.input<typeof UpdateGroupInputSchema>,
    undefined,
    UpdateGroupInput
  >({
    resolver: zodResolver(UpdateGroupInputSchema),
    defaultValues: { name: group.name },
  })

  function onSubmit(values: UpdateGroupInput) {
    updateGroupMutation.mutate(values, {
      onSuccess: () => setRenameOpen(false),
    })
  }

  if (!canManage) {
    return null
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Group actions">
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link to="/groups/$groupId/settings" params={{ groupId: group.id }}>
              Group settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              form.reset({ name: group.name })
              setRenameOpen(true)
            }}
          >
            Rename
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename group</DialogTitle>
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
                <Button type="submit" disabled={updateGroupMutation.isPending}>
                  {updateGroupMutation.isPending ? 'Saving…' : 'Save'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}

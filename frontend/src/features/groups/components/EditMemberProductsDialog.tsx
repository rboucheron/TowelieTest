import { useState } from 'react'
import type { Member } from '@/api'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui'
import { ProductScopeField } from '@/features/groups/components/ProductScopeField'
import { useSetMemberProductsMutation } from '@/features/groups/hooks/use-groups'

export interface EditMemberProductsDialogProps {
  groupId: string
  member: Member
}

export function EditMemberProductsDialog({
  groupId,
  member,
}: EditMemberProductsDialogProps) {
  const [open, setOpen] = useState(false)
  const [productIds, setProductIds] = useState<string[]>(member.productIds)
  const setProductsMutation = useSetMemberProductsMutation(groupId)

  function handleOpenChange(next: boolean) {
    if (next) setProductIds(member.productIds)
    setOpen(next)
  }

  function handleSave() {
    setProductsMutation.mutate(
      { userId: member.userId, productIds },
      { onSuccess: () => setOpen(false) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {member.productIds.length === 0
            ? 'Assign products'
            : `${member.productIds.length} product${member.productIds.length > 1 ? 's' : ''}`}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Product scope for {member.firstName} {member.lastName}
          </DialogTitle>
          <DialogDescription>
            This developer only sees bugs affecting the selected products.
          </DialogDescription>
        </DialogHeader>
        <ProductScopeField
          groupId={groupId}
          value={productIds}
          onChange={setProductIds}
        />
        {setProductsMutation.isError ? (
          <p className="text-sm text-destructive">
            The product scope could not be saved. Please try again.
          </p>
        ) : null}
        <DialogFooter>
          <Button onClick={handleSave} disabled={setProductsMutation.isPending}>
            {setProductsMutation.isPending ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'
import { useCan } from '@/features/auth/hooks/use-can'
import { CreateProductDialog } from '@/features/products/components/CreateProductDialog'
import {
  useProductsQuery,
  useRemoveProductMutation,
} from '@/features/products/hooks/use-products'

export interface ProductsPanelProps {
  groupId: string
}

export function ProductsPanel({ groupId }: ProductsPanelProps) {
  const productsQuery = useProductsQuery(groupId)
  const removeProductMutation = useRemoveProductMutation(groupId)
  const canManage = useCan(groupId, 'ADMIN')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Products</h2>
        {canManage ? <CreateProductDialog groupId={groupId} /> : null}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            {canManage ? <TableHead /> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {productsQuery.data?.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{product.name}</TableCell>
              {canManage ? (
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeProductMutation.mutate(product.id)}
                  >
                    Remove
                  </Button>
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

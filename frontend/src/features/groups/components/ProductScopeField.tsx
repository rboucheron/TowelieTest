import { Checkbox } from '@/components/ui'
import { useProductsQuery } from '@/features/products/hooks/use-products'

export interface ProductScopeFieldProps {
  groupId: string
  value: string[]
  onChange: (productIds: string[]) => void
}

export function ProductScopeField({
  groupId,
  value,
  onChange,
}: ProductScopeFieldProps) {
  const productsQuery = useProductsQuery(groupId)
  const products = productsQuery.data ?? []

  if (productsQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">Loading products…</p>
  }

  if (products.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        This group has no products yet. Create one in the Products tab first.
      </p>
    )
  }

  return (
    <div className="flex flex-wrap gap-3">
      {products.map((product) => (
        <label
          key={product.id}
          className="flex items-center gap-2 rounded-md border bg-card px-2.5 py-1.5 text-sm"
        >
          <Checkbox
            checked={value.includes(product.id)}
            onCheckedChange={(checked) =>
              onChange(
                checked
                  ? [...value, product.id]
                  : value.filter((id) => id !== product.id),
              )
            }
          />
          {product.name}
        </label>
      ))}
    </div>
  )
}

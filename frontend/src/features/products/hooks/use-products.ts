import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createProduct,
  listProducts,
  removeProduct,
  updateProduct
  
  
} from '@/api'
import type {CreateProductInput, UpdateProductInput} from '@/api';
import { queryKeys } from '@/lib/query-keys'

export function useProductsQuery(groupId: string) {
  return useQuery({
    queryKey: queryKeys.products(groupId),
    queryFn: () => listProducts(groupId),
  })
}

export function useCreateProductMutation(groupId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateProductInput) => createProduct(groupId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.products(groupId),
      })
    },
  })
}

export function useUpdateProductMutation(groupId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      productId,
      input,
    }: {
      productId: string
      input: UpdateProductInput
    }) => updateProduct(productId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.products(groupId),
      })
    },
  })
}

export function useRemoveProductMutation(groupId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (productId: string) => removeProduct(productId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.products(groupId),
      })
    },
  })
}

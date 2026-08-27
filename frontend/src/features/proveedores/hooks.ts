import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from './api';
import type { SupplierInput, SupplierListParams } from './types';

const LIST_KEY = 'proveedores';

export function suppliersQueryKey(params: SupplierListParams) {
  return [LIST_KEY, params] as const;
}

export function useSuppliers(params: SupplierListParams) {
  return useQuery({
    queryKey: suppliersQueryKey(params),
    queryFn: () => api.fetchSuppliers(params),
    placeholderData: (previous) => previous,
  });
}

export function useSupplierMutations() {
  const queryClient = useQueryClient();
  const invalidateList = () => queryClient.invalidateQueries({ queryKey: [LIST_KEY] });

  const create = useMutation({
    mutationFn: (input: SupplierInput) => api.createSupplier(input),
    onSuccess: invalidateList,
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: SupplierInput }) => api.updateSupplier(id, input),
    onSuccess: invalidateList,
  });

  const deactivate = useMutation({
    mutationFn: (id: string) => api.deactivateSupplier(id),
    onSuccess: invalidateList,
  });

  return { create, update, deactivate };
}
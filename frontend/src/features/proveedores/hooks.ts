<<<<<<< Updated upstream
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from './api'
import type { SupplierInput, SupplierListParams } from './types'

const LIST_KEY = 'proveedores'

export function suppliersQueryKey(params: SupplierListParams) {
  return [LIST_KEY, params] as const
=======
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from './api';
import type { SupplierInput, SupplierListParams } from './types';

const LIST_KEY = 'proveedores';

export function suppliersQueryKey(params: SupplierListParams) {
  return [LIST_KEY, params] as const;
>>>>>>> Stashed changes
}

export function useSuppliers(params: SupplierListParams) {
  return useQuery({
    queryKey: suppliersQueryKey(params),
    queryFn: () => api.fetchSuppliers(params),
    placeholderData: (previous) => previous,
<<<<<<< Updated upstream
  })
}

export function useSupplierMutations() {
  const queryClient = useQueryClient()
  const invalidateList = () => queryClient.invalidateQueries({ queryKey: [LIST_KEY] })
=======
  });
}

export function useSupplierMutations() {
  const queryClient = useQueryClient();
  const invalidateList = () => queryClient.invalidateQueries({ queryKey: [LIST_KEY] });
>>>>>>> Stashed changes

  const create = useMutation({
    mutationFn: (input: SupplierInput) => api.createSupplier(input),
    onSuccess: invalidateList,
<<<<<<< Updated upstream
  })

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: SupplierInput }) =>
      api.updateSupplier(id, input),
    onSuccess: invalidateList,
  })
=======
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: SupplierInput }) => api.updateSupplier(id, input),
    onSuccess: invalidateList,
  });
>>>>>>> Stashed changes

  const deactivate = useMutation({
    mutationFn: (id: string) => api.deactivateSupplier(id),
    onSuccess: invalidateList,
<<<<<<< Updated upstream
  })

  return { create, update, deactivate }
}
=======
  });

  return { create, update, deactivate };
}
>>>>>>> Stashed changes

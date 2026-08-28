import { useMutation, useQuery } from '@tanstack/react-query'
import type { components, paths } from '@/types/api.generated'
import { endpoints } from '@/lib/api/endpoints'
import { httpClient } from '@/lib/api/http-client'

export type Expense = components['schemas']['ExpenseDto']
export type CashSource = components['schemas']['CashSource']
export type CreateExpense = components['schemas']['CreateExpenseRequest']
export type ExpenseCategory = components['schemas']['ExpenseCategoryDto']
type Categories =
  paths['/api/v1/expense-categories']['get']['responses'][200]['content']['application/json']

export const expenseKeys = {
  all: ['expenses'] as const,
  categories: () => ['expenses', 'categories'] as const,
}
export const expensesApi = {
  categories: () => httpClient.get<Categories>(endpoints.expenses.categories()),
  create: (request: CreateExpense) =>
    httpClient.post<Expense>(endpoints.expenses.create(), request),
}
export function useExpenseCategories() {
  return useQuery({
    queryKey: expenseKeys.categories(),
    queryFn: expensesApi.categories,
    staleTime: 5 * 60_000,
  })
}
export function useCreateExpense() {
  return useMutation({ mutationFn: expensesApi.create })
}

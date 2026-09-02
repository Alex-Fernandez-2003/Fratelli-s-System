import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type { components, paths } from '@/types/api.generated'
import { endpoints } from '@/lib/api/endpoints'
import { businessDate } from '@/lib/business-time'
import { httpClient } from '@/lib/api/http-client'

export type Expense = components['schemas']['ExpenseDto']
export type ExpenseHistory = components['schemas']['ExpenseHistoryDto']
export type ExpenseHistoryPage = components['schemas']['ExpenseHistoryPage']
export type CashSource = components['schemas']['CashSource']
export type ExpenseShiftType = Exclude<components['schemas']['ShiftType'], null>
export type CreateExpense = components['schemas']['CreateExpenseRequest']
export type ExpenseCategory = components['schemas']['ExpenseCategoryDto']
export type ExpenseHistoryFilters = Omit<
  paths['/api/v1/expenses']['get']['parameters']['query'],
  'shiftId'
>
type Categories =
  paths['/api/v1/expense-categories']['get']['responses'][200]['content']['application/json']

export const EXPENSE_HISTORY_READ_ROLES = ['ADMINISTRADOR', 'ENCARGADO', 'CONTADORA'] as const
export const EXPENSE_WRITE_ROLES = ['ADMINISTRADOR', 'ENCARGADO'] as const
export const EXPENSE_CATEGORY_READ_ROLES = EXPENSE_HISTORY_READ_ROLES

export const expenseCanRead = (roles: readonly string[]) =>
  EXPENSE_HISTORY_READ_ROLES.some((role) => roles.includes(role))

export const expenseCanWrite = (roles: readonly string[]) =>
  EXPENSE_WRITE_ROLES.some((role) => roles.includes(role))

const pageSize = 25

const normalizeExpenseHistoryFilters = (filters: ExpenseHistoryFilters) => ({
  page: filters.page ?? 1,
  pageSize: filters.pageSize ?? pageSize,
  from: filters.from || undefined,
  to: filters.to || undefined,
  categoryId: filters.categoryId || undefined,
  cashSource: filters.cashSource || undefined,
  responsible: filters.responsible?.trim() || undefined,
  shiftType: filters.shiftType || undefined,
})

export function createExpenseHistoryFilters(date = new Date()): ExpenseHistoryFilters {
  const today = businessDate(date)
  return { from: `${today.slice(0, 7)}-01`, to: today, page: 1, pageSize }
}

export function updateExpenseHistoryFilters(
  filters: ExpenseHistoryFilters,
  updates: Partial<Omit<ExpenseHistoryFilters, 'page' | 'pageSize'>>,
): ExpenseHistoryFilters {
  return { ...filters, ...updates, page: 1 }
}

export function setExpenseHistoryPage(
  filters: ExpenseHistoryFilters,
  page: number,
): ExpenseHistoryFilters {
  return { ...filters, page }
}

export function useExpenseHistoryFilterState(date = new Date()) {
  const [filters, setFilters] = useState(() => createExpenseHistoryFilters(date))
  return {
    filters,
    updateFilters: (updates: Partial<Omit<ExpenseHistoryFilters, 'page' | 'pageSize'>>) =>
      setFilters((current) => updateExpenseHistoryFilters(current, updates)),
    setPage: (page: number) => setFilters((current) => setExpenseHistoryPage(current, page)),
    clearFilters: () => setFilters(createExpenseHistoryFilters()),
  }
}

export const expenseKeys = {
  all: ['expenses'] as const,
  categories: () => ['expenses', 'categories'] as const,
}

export const expenseHistoryKeys = {
  all: expenseKeys.all,
  lists: () => [...expenseHistoryKeys.all, 'history'] as const,
  list: (filters: ExpenseHistoryFilters) =>
    [...expenseHistoryKeys.lists(), normalizeExpenseHistoryFilters(filters)] as const,
}

function expenseHistoryPath(filters: ExpenseHistoryFilters) {
  const values = normalizeExpenseHistoryFilters(filters)
  return endpoints.expenses.list({
    page: Number(values.page),
    pageSize: Number(values.pageSize),
    from: values.from,
    to: values.to,
    categoryId: values.categoryId,
    cashSource: values.cashSource,
    responsible: values.responsible,
    shiftType: values.shiftType,
  })
}

export const expensesApi = {
  categories: () => httpClient.get<Categories>(endpoints.expenses.categories()),
  history: (filters: ExpenseHistoryFilters) =>
    httpClient.get<ExpenseHistoryPage>(expenseHistoryPath(filters)),
  create: (request: CreateExpense) =>
    httpClient.post<Expense>(endpoints.expenses.create(), request),
}

export const fetchExpenseHistory = (filters: ExpenseHistoryFilters) =>
  httpClient.get<ExpenseHistoryPage>(expenseHistoryPath(filters))

export function useExpenseCategories() {
  return useQuery({
    queryKey: expenseKeys.categories(),
    queryFn: expensesApi.categories,
    staleTime: 5 * 60_000,
  })
}

export function useExpenseHistory(filters: ExpenseHistoryFilters) {
  return useQuery({
    queryKey: expenseHistoryKeys.list(filters),
    queryFn: () => fetchExpenseHistory(filters),
    staleTime: 30_000,
    placeholderData: (previous) => previous,
  })
}

export function useCreateExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: expensesApi.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: expenseHistoryKeys.lists() })
    },
  })
}

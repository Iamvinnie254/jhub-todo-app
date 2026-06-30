import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export interface Todo {
  id: string
  title: string
  description?: string
  dueDate?: string
  priority: 'low' | 'medium' | 'high'
  completed: boolean
  createdAt: string
}

export type CreateTodoInput = {
  title: string
  description?: string
  dueDate?: string
  priority: 'low' | 'medium' | 'high'
}

export function useTodos() {
  return useQuery<Todo[]>({
    queryKey: ['todos'],
    queryFn: async () => (await api.get('/todos')).data,
  })
}

export function useCreateTodo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTodoInput) =>
      api.post('/todos', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['todos'] }),
  })
}

export function useUpdateTodo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Todo> & { id: string }) =>
      api.patch(`/todos/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['todos'] }),
  })
}

export function useDeleteTodo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/todos/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['todos'] }),
  })
}
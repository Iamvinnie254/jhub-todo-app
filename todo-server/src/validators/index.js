/* zod schemas */

import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const loginSchema = registerSchema

export const createTodoSchema = z.object({
  title:       z.string().min(1).max(255),
  description: z.string().optional(),
  dueDate:     z.string().optional(),
  priority:    z.enum(['low', 'medium', 'high']).default('medium'),
})

export const updateTodoSchema = createTodoSchema.partial().extend({
  completed: z.boolean().optional(),
})
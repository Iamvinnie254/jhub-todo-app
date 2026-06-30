import { Router } from 'express'
import { db } from '../db/index.js'
import { todos } from '../db/schema.js'
import { authenticate } from '../middleware/auth.js'
import { createTodoSchema, updateTodoSchema } from '../validators/index.js'
import { eq, and } from 'drizzle-orm'

const router = Router()
router.use(authenticate)

router.get('/', async (req, res) => {
  const items = await db.query.todos.findMany({
    where: eq(todos.userId, req.user.sub),
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  })
  res.json(items)
})

router.post('/', async (req, res) => {
  const parsed = createTodoSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() })

  const { dueDate, ...rest } = parsed.data

  const [todo] = await db.insert(todos)
    .values({
      ...rest,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      userId: req.user.sub,
    })
    .returning()

  res.status(201).json(todo)
})

router.patch('/:id', async (req, res) => {
  const parsed = updateTodoSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() })

  const { dueDate, ...rest } = parsed.data

  const [todo] = await db.update(todos)
    .set({
      ...rest,
      ...(dueDate !== undefined && { dueDate: new Date(dueDate).toISOString() }),
      updatedAt: new Date().toISOString(),
    })
    .where(and(eq(todos.id, req.params.id), eq(todos.userId, req.user.sub)))
    .returning()

  if (!todo) return res.status(404).json({ message: 'Todo not found' })
  res.json(todo)
})

router.delete('/:id', async (req, res) => {
  const [deleted] = await db.delete(todos)
    .where(and(eq(todos.id, req.params.id), eq(todos.userId, req.user.sub)))
    .returning()

  if (!deleted) return res.status(404).json({ message: 'Todo not found' })
  res.status(204).end()
})

export default router
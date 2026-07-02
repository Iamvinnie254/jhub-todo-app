import { db } from "../db/index.js";
import { todos } from "../db/schema.js";
import { authenticate, AuthRequest } from "../middleware/auth.js";
import { createTodoSchema, updateTodoSchema } from "../validators/index.js";
import { eq, and } from "drizzle-orm";
import { Router } from "express";
import type { Response } from "express";

const router = Router();
router.use(authenticate);

const toISOString = (val?: string): string | null => {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d.toISOString();
};

router.get("/", async (req: AuthRequest, res: Response) => {
  const items = await db.query.todos.findMany({
    where: eq(todos.userId, req.user!.sub),
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  });
  res.json(items);
});

router.post("/", async (req: AuthRequest, res: Response) => {
  const parsed = createTodoSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ errors: parsed.error.flatten() });
    return;
  }

  const { dueDate, ...rest } = parsed.data;

  const [todo] = await db
    .insert(todos)
    .values({
      ...rest,
      dueDate: toISOString(dueDate),
      userId: req.user!.sub,
    })
    .returning();

  res.status(201).json(todo);
});

router.patch("/:id", async (req: AuthRequest, res: Response) => {
  const parsed = updateTodoSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ errors: parsed.error.flatten() });
    return;
  }

  const { dueDate, ...rest } = parsed.data;

  const [todo] = await db
    .update(todos)
    .set({
      ...rest,
      ...(dueDate !== undefined && { dueDate: toISOString(dueDate) }),
      updatedAt: new Date().toISOString(),
    })
    .where(and(eq(todos.id, String(req.params.id)), eq(todos.userId, req.user!.sub)))
    .returning();

  if (!todo) {
    res.status(404).json({ message: "Todo not found" });
    return;
  }

  res.json(todo);
});

router.delete("/:id", async (req: AuthRequest, res: Response) => {
  const [deleted] = await db
    .delete(todos)
    .where(and(eq(todos.id, String(req.params.id)), eq(todos.userId, req.user!.sub)))
    .returning();

  if (!deleted) {
    res.status(404).json({ message: "Todo not found" });
    return;
  }

  res.status(204).end();
});

export default router;

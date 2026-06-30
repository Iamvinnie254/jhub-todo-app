"use client";
import { useTodos, useUpdateTodo, useDeleteTodo } from "@/hooks/useTodos";
import { useAuth } from "@/context/AuthContext";
import TodoForm from "@/components/features/TodoForm";
import TodoItem from "@/components/features/TodoItem";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { data: todos, isLoading, isError } = useTodos();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-medium">My todos</h1>
          {user && (
            <p className="text-sm text-muted-foreground">{user.email}</p>
          )}
        </div>
        <Button variant="outline" onClick={logout}>
          Sign out
        </Button>
      </div>

      <TodoForm />

      {isLoading && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Loading todos...
        </p>
      )}

      {isError && (
        <p className="text-sm text-destructive text-center py-4">
          Failed to load todos. Please refresh.
        </p>
      )}

      {todos && todos.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          No todos yet. Add one above.
        </p>
      )}

      <div className="space-y-2">
        {todos?.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={() =>
              updateTodo.mutate({ id: todo.id, completed: !todo.completed })
            }
            onDelete={() => deleteTodo.mutate(todo.id)}
          />
        ))}
      </div>
    </div>
  );
}

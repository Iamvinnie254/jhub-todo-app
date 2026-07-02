"use client";
import { Todo } from "@/hooks/useTodos";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";

const priorityColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
};

interface Props {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
}

export default function TodoItem({ todo, onToggle, onDelete }: Props) {
  const due = todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : null;

  return (
    <Card className={todo.completed ? "opacity-60" : ""}>
      <CardContent className="flex items-start gap-3 py-3">
        <Checkbox
          checked={todo.completed}
          onCheckedChange={onToggle}
          className="mt-1"
        />
        <div className="flex-1 min-w-0">
          <p
            className={`font-medium text-sm ${todo.completed ? "line-through text-muted-foreground" : ""}`}
          >
            {todo.title}
          </p>
          {todo.description && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {todo.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1.5">
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[todo.priority]}`}
            >
              {todo.priority}
            </span>
            {due && (
              <span className="text-xs text-muted-foreground">Due {due}</span>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-destructive hover:text-destructive shrink-0"
        >
          Delete
        </Button>
      </CardContent>
    </Card>
  );
}

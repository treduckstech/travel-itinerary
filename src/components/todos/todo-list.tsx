"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import type { Todo } from "@/lib/types";

interface TodoListProps {
  tripId: string;
  todos: Todo[];
}

export function TodoList({ tripId, todos }: TodoListProps) {
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setLoading(true);

    await supabase.from("todos").insert({
      trip_id: tripId,
      title: newTitle.trim(),
    });

    setNewTitle("");
    setLoading(false);
    router.refresh();
  }

  async function handleToggle(todo: Todo) {
    await supabase
      .from("todos")
      .update({ completed: !todo.completed })
      .eq("id", todo.id);
    router.refresh();
  }

  async function handleDelete(id: string) {
    await supabase.from("todos").delete().eq("id", id);
    router.refresh();
  }

  const sorted = [...todos].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {completedCount} of {todos.length} completed
        </p>
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          placeholder="Add a todo item..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <Button type="submit" size="sm" disabled={loading || !newTitle.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </form>

      {sorted.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No prep items yet. Add your first todo!
        </p>
      ) : (
        <div className="space-y-2">
          {sorted.map((todo) => (
            <div
              key={todo.id}
              className="flex items-center gap-3 rounded-md border p-3"
            >
              <Checkbox
                checked={todo.completed}
                onCheckedChange={() => handleToggle(todo)}
              />
              <span
                className={`flex-1 text-sm ${
                  todo.completed
                    ? "text-muted-foreground line-through"
                    : ""
                }`}
              >
                {todo.title}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(todo.id)}
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

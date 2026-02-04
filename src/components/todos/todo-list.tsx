"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import type { Todo } from "@/lib/types";

interface TodoListProps {
  tripId: string;
  todos: Todo[];
  readOnly?: boolean;
}

export function TodoList({ tripId, todos, readOnly }: TodoListProps) {
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const router = useRouter();
  const supabase = createClient();

  function markBusy(id: string) {
    setBusyIds((prev) => new Set(prev).add(id));
  }

  function clearBusy(id: string) {
    setBusyIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setLoading(true);

    const { error } = await supabase.from("todos").insert({
      trip_id: tripId,
      title: newTitle.trim(),
    });

    if (error) {
      toast.error("Failed to add item");
      setLoading(false);
      return;
    }

    setNewTitle("");
    setLoading(false);
    router.refresh();
  }

  async function handleToggle(todo: Todo) {
    if (busyIds.has(todo.id)) return;
    markBusy(todo.id);

    const { error } = await supabase
      .from("todos")
      .update({ completed: !todo.completed })
      .eq("id", todo.id);

    clearBusy(todo.id);
    if (error) {
      toast.error("Failed to update item");
      return;
    }
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (busyIds.has(id)) return;
    markBusy(id);

    const { error } = await supabase.from("todos").delete().eq("id", id);

    clearBusy(id);
    if (error) {
      toast.error("Failed to delete item");
      return;
    }
    router.refresh();
  }

  const sorted = [...todos].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <div className="space-y-4">
      {todos.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {completedCount} of {todos.length} completed
        </p>
      )}

      {!readOnly && (
        <form onSubmit={handleAdd} className="flex gap-2">
          <Input
            placeholder="Add a prep item..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            maxLength={200}
          />
          <Button type="submit" size="sm" disabled={loading || !newTitle.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </form>
      )}

      {sorted.length === 0 ? (
        <div className="py-6 text-center">
          <p className="mb-3 text-sm text-muted-foreground">
            Track what you need before you go
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {["Check passport", "Book airport transfer", "Travel insurance", "Pack bags", "Download offline maps"].map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setNewTitle(suggestion)}
                className="rounded-full border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((todo) => (
            <div
              key={todo.id}
              className="group flex items-center gap-3 rounded-lg border p-3"
            >
              <Checkbox
                checked={todo.completed}
                onCheckedChange={() => !readOnly && handleToggle(todo)}
                disabled={readOnly || busyIds.has(todo.id)}
              />
              <span
                className={`min-w-0 flex-1 break-words text-sm ${
                  todo.completed
                    ? "text-muted-foreground line-through"
                    : ""
                }`}
              >
                {todo.title}
              </span>
              {!readOnly && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(todo.id)}
                  disabled={busyIds.has(todo.id)}
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

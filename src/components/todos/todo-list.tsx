"use client";

import React, { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { format, isAfter, startOfDay, parseISO } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Todo } from "@/lib/types";

const URL_REGEX = /https?:\/\/[^\s<>)"']+/g;

function renderTextWithLinks(text: string, className?: string) {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  URL_REGEX.lastIndex = 0;
  while ((match = URL_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <a
        key={match.index}
        href={match[0]}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline hover:text-primary/80"
        onClick={(e) => e.stopPropagation()}
      >
        {match[0]}
      </a>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <span className={className}>{parts}</span>;
}

interface TodoListProps {
  tripId: string;
  todos: Todo[];
  readOnly?: boolean;
}

interface SortableItemProps {
  todo: Todo;
  readOnly?: boolean;
  busyIds: Set<string>;
  editingId: string | null;
  onToggle: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onStartEdit: (id: string) => void;
  onSaveEdit: (id: string, title: string, description: string) => void;
  onCancelEdit: () => void;
  isOverdue: (todo: Todo) => boolean;
}

function SortableItem({
  todo,
  readOnly,
  busyIds,
  editingId,
  onToggle,
  onDelete,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  isOverdue,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id, disabled: readOnly });

  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(
    todo.description ?? ""
  );
  const titleRef = useRef<HTMLInputElement>(null);

  const isEditing = editingId === todo.id;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  function handleStartEdit() {
    if (readOnly) return;
    setEditTitle(todo.title);
    setEditDescription(todo.description ?? "");
    onStartEdit(todo.id);
    setTimeout(() => titleRef.current?.focus(), 0);
  }

  function handleSave() {
    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle) {
      onCancelEdit();
      return;
    }
    onSaveEdit(todo.id, trimmedTitle, editDescription.trim());
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      onCancelEdit();
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-3 rounded-lg border p-3"
    >
      {!readOnly && (
        <button
          type="button"
          className="cursor-grab touch-none text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      )}
      <Checkbox
        checked={todo.completed}
        onCheckedChange={() => !readOnly && onToggle(todo)}
        disabled={readOnly || busyIds.has(todo.id)}
        className="mt-0.5"
      />
      <div
        className="min-w-0 flex-1"
        onClick={() => !isEditing && handleStartEdit()}
      >
        {isEditing ? (
          <div className="space-y-1">
            <Input
              ref={titleRef}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              maxLength={200}
              className="h-7 text-sm"
            />
            <Textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              maxLength={500}
              rows={2}
              placeholder="Add a note (optional)"
              className="resize-none text-xs"
            />
          </div>
        ) : (
          <>
            {renderTextWithLinks(
              todo.title,
              `break-words text-sm ${
                todo.completed
                  ? "text-muted-foreground line-through"
                  : ""
              }${!readOnly ? " cursor-text" : ""}`
            )}
            {todo.description &&
              (
                <p
                  className={`mt-0.5 break-words text-xs ${
                    todo.completed
                      ? "text-muted-foreground/60 line-through"
                      : "text-muted-foreground"
                  }`}
                >
                  {renderTextWithLinks(todo.description)}
                </p>
              )}
          </>
        )}
      </div>
      {todo.due_date && !isEditing && (
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
            isOverdue(todo)
              ? "bg-destructive/10 text-destructive"
              : todo.completed
                ? "text-muted-foreground"
                : "bg-muted text-muted-foreground"
          }`}
        >
          Due {format(parseISO(todo.due_date + "T00:00:00"), "MMM d")}
        </span>
      )}
      {!readOnly && !isEditing && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(todo.id)}
          disabled={busyIds.has(todo.id)}
          className="opacity-0 transition-opacity group-hover:opacity-100"
        >
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
      )}
    </div>
  );
}

export function TodoList({ tripId, todos, readOnly }: TodoListProps) {
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [localTodos, setLocalTodos] = useState<Todo[]>(todos);
  const router = useRouter();
  const supabase = createClient();

  // Sync props when server refreshes
  const prevTodosRef = useRef(todos);
  if (prevTodosRef.current !== todos) {
    prevTodosRef.current = todos;
    setLocalTodos(todos);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  function isOverdue(todo: Todo): boolean {
    if (!todo.due_date || todo.completed) return false;
    const today = startOfDay(new Date());
    const due = parseISO(todo.due_date + "T00:00:00");
    return isAfter(today, due);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setLoading(true);

    const maxSortOrder = localTodos.reduce(
      (max, t) => Math.max(max, t.sort_order),
      0
    );

    const { error } = await supabase.from("todos").insert({
      trip_id: tripId,
      title: newTitle.trim(),
      description: newDescription.trim() || null,
      due_date: dueDate || null,
      sort_order: maxSortOrder + 1,
    });

    if (error) {
      toast.error("Failed to add item");
      setLoading(false);
      return;
    }

    setNewTitle("");
    setNewDescription("");
    setDueDate("");
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

  const handleSaveEdit = useCallback(
    async (id: string, title: string, description: string) => {
      setEditingId(null);
      const todo = localTodos.find((t) => t.id === id);
      if (!todo) return;

      // Skip if nothing changed
      if (todo.title === title && (todo.description ?? "") === description) return;

      // Optimistic update
      setLocalTodos((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, title, description: description || null }
            : t
        )
      );

      const { error } = await supabase
        .from("todos")
        .update({ title, description: description || null })
        .eq("id", id);

      if (error) {
        toast.error("Failed to update item");
        router.refresh();
      }
    },
    [localTodos, supabase, router]
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Work with uncompleted items only for reordering
    const uncompleted = sorted.filter((t) => !t.completed);
    const completed = sorted.filter((t) => t.completed);

    const oldIndex = uncompleted.findIndex((t) => t.id === active.id);
    const newIndex = uncompleted.findIndex((t) => t.id === over.id);

    // If dragging completed items or item not found, bail
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...uncompleted];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    // Assign new sort_order values
    const updates = reordered.map((t, i) => ({
      ...t,
      sort_order: i + 1,
    }));

    // Optimistically update local state
    setLocalTodos([...updates, ...completed]);

    // Batch update in Supabase
    const promises = updates
      .filter((t, i) => {
        const original = uncompleted.find((o) => o.id === t.id);
        return original && original.sort_order !== i + 1;
      })
      .map((t) =>
        supabase
          .from("todos")
          .update({ sort_order: t.sort_order })
          .eq("id", t.id)
      );

    const results = await Promise.all(promises);
    if (results.some((r) => r.error)) {
      toast.error("Failed to save order");
      router.refresh();
    }
  }

  const sorted = [...localTodos].sort((a, b) => {
    // Completed items always last
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    // Within each group, sort by sort_order
    return a.sort_order - b.sort_order;
  });

  const completedCount = localTodos.filter((t) => t.completed).length;
  const uncompletedIds = sorted
    .filter((t) => !t.completed)
    .map((t) => t.id);

  return (
    <div className="space-y-4">
      {localTodos.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {completedCount} of {localTodos.length} completed
        </p>
      )}

      {!readOnly && (
        <form onSubmit={handleAdd} className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Add a to-do..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              maxLength={200}
            />
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-[160px] shrink-0"
            />
            <Button type="submit" size="sm" disabled={loading || !newTitle.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Textarea
            placeholder="Add a note (optional)"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            maxLength={500}
            rows={2}
            className="resize-none text-sm"
          />
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={uncompletedIds}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {sorted.map((todo) => (
                <SortableItem
                  key={todo.id}
                  todo={todo}
                  readOnly={readOnly}
                  busyIds={busyIds}
                  editingId={editingId}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onStartEdit={(id) => setEditingId(id)}
                  onSaveEdit={handleSaveEdit}
                  onCancelEdit={() => setEditingId(null)}
                  isOverdue={isOverdue}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

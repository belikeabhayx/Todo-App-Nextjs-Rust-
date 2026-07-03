import { Todo } from "@/lib/types";
import React from "react";
import TodoItem from "./TodoItem";

interface TodoListProps {
  todos: Todo[];
  filter: "all" | "active" | "completed";
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
}

const TodoList = ({
  todos,
  filter,
  onToggle,
  onDelete,
  onRename,
}: TodoListProps) => {
  const visible = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  if (visible.length === 0) {
    return (
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-center text-muted py-12 px-4 border border-dashed border-border/80 rounded-2xl bg-bg/25">
        <span className="text-2xl mb-2 select-none">✨</span>
        <p className="text-sm font-semibold">
          {filter === "all"
            ? "All caught up! No tasks left."
            : `No ${filter} tasks found.`}
        </p>
        <p className="text-xs text-muted/80 mt-1">
          {filter === "all" ? "Add a new task above to get started." : ""}
        </p>
      </div>
    );
  }

  return (
    <ul className="flex-1 min-h-0 flex flex-col gap-2.5 overflow-y-auto pr-1">
      {visible.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          onRename={onRename}
        />
      ))}
    </ul>
  );
};

export default TodoList;

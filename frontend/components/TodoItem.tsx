"use client";

import { Todo } from "@/lib/types";
import { useState } from "react";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
}

export default function TodoItem({
  todo,
  onToggle,
  onDelete,
  onRename,
}: TodoItemProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(todo.title);

  function commitEdit() {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== todo.title) {
      onRename(todo.id, trimmed);
    }
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") {
      setEditValue(todo.title);
      setEditing(false);
    }
  }

  return (
    <li className="flex items-center gap-3 bg-card border border-border/80 rounded-xl py-3.5 px-4 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)] dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:border-accent/40 group">
      {/* Custom toggle button */}
      <button
        type="button"
        onClick={() => onToggle(todo.id, !todo.completed)}
        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer ${
          todo.completed
            ? "bg-accent border-accent text-white shadow-sm shadow-accent/25"
            : "border-border hover:border-accent/60 bg-bg/50"
        }`}
        aria-label={`Mark "${todo.title}" as ${todo.completed ? "incomplete" : "complete"}`}
      >
        {todo.completed && (
          <svg className="w-3 h-3 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Title / Edit input */}
      {editing ? (
        <input
          className="flex-1 bg-bg border border-accent rounded-lg text-fg text-sm outline-none py-1 px-2.5 focus:ring-2 focus:ring-accent/15"
          value={editValue}
          autoFocus
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <span
          className={`flex-1 text-sm font-medium cursor-default break-all select-none transition-all duration-200 ${
            todo.completed ? "text-muted line-through decoration-muted/50 opacity-60" : "text-fg"
          }`}
          onDoubleClick={() => {
            setEditValue(todo.title);
            setEditing(true);
          }}
          title="Double-click to edit"
        >
          {todo.title}
        </span>
      )}

      {/* Action delete button */}
      <button
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-all duration-200 cursor-pointer shrink-0"
        onClick={() => onDelete(todo.id)}
        aria-label={`Delete "${todo.title}"`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </li>
  );
}

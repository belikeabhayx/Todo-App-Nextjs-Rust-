"use client";
import TodoList from "@/components/TodoList";
import { CreateTodoRequest, Todo, UpdateTodoRequest } from "@/lib/types";
import { useState, FormEvent, useEffect } from "react";

const API = "http://localhost:8080";

const apiFetch = async <T,>(path: string, options?: RequestInit): Promise<T> => {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;

  return res.json();
};

const Page = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchTodos = async () => {
      try {
        const data = await apiFetch<Todo[]>("/todos");
        if (active) {
          setTodos(data);
        }
      } catch (e: unknown) {
        if (active) {
          setError(e instanceof Error ? e.message : "Failed to load todos");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    fetchTodos();
    return () => {
      active = false;
    };
  }, []);

  const addTodo = async (e: FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;

    try {
      const body: CreateTodoRequest = { title };
      const created = await apiFetch<Todo>("/todos", {
        method: "POST",
        body: JSON.stringify(body),
      });
      setTodos((prev) => [...prev, created]);
      setNewTitle("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to add todo");
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      await apiFetch(`/todos/${id}`, { method: "DELETE" });
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to delete todo");
    }
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    try {
      const body: UpdateTodoRequest = { completed };
      const updated = await apiFetch<Todo>(`/todos/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to update todo");
    }
  };

  const renameTodo = async (id: string, title: string) => {
    try {
      const body: UpdateTodoRequest = { title };
      const updated = await apiFetch<Todo>(`/todos/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to rename todo");
    }
  };

  // How many todos are still incomplete?
  const activeCount = todos.filter((t) => !t.completed).length;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-bg text-fg px-4 py-12 relative overflow-hidden">
      {/* Decorative premium background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] md:w-[600px] h-[350px] md:h-[600px] rounded-full bg-accent/8 blur-[100px] md:blur-[150px] pointer-events-none select-none" />
      <div className="absolute bottom-1/4 left-1/3 -translate-x-1/2 w-[200px] md:w-[400px] h-[200px] md:h-[400px] rounded-full bg-success/4 blur-[80px] md:blur-[120px] pointer-events-none select-none" />
      
      <main className="w-full max-w-[540px] relative z-10">
        <div className="backdrop-blur-md bg-card/75 border border-border/80 rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgb(15,23,42,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex flex-col gap-6 h-[640px] transition-all duration-300 hover:shadow-glow/15">
          {/* ── Header ── */}
          <header className="flex flex-col items-center text-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent-light text-accent border border-accent/15 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Actix Web + Next.js
            </span>
            <h1 className="text-3xl md:text-[2.25rem] font-black tracking-tight text-fg mt-1.5 flex items-center gap-2">
              <span className="text-2xl md:text-3xl animate-bounce duration-1000">🦀</span>
              Rust <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-indigo-500">Todo</span>
            </h1>
            <p className="text-xs md:text-sm text-muted font-medium">
              High-performance reactive task manager
            </p>
          </header>

          {/* ── Add todo form ── */}
          <form className="flex gap-2" onSubmit={addTodo}>
            <input
              className="flex-1 bg-bg/50 border border-border rounded-xl text-fg text-sm py-3 px-4 outline-none transition-all duration-200 focus:border-accent focus:ring-2 focus:ring-accent/10 placeholder:text-muted"
              type="text"
              placeholder="What needs doing today?"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <button
              className="bg-accent hover:bg-accent-hover text-white text-sm font-semibold py-3 px-5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-accent/20 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center justify-center"
              type="submit"
              disabled={!newTitle.trim()}
            >
              Add Task
            </button>
          </form>

          {/* ── Error banner ── */}
          {error && (
            <div
              className="bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm py-3 px-4 flex items-center justify-between gap-3 shadow-sm"
              role="alert"
            >
              <div className="flex items-center gap-2 font-medium">
                <span className="text-base leading-none">⚠️</span>
                <span>{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-danger/60 hover:text-danger hover:bg-danger/10 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* ── Filter tabs ── */}
          <div className="flex bg-bg/50 p-1 rounded-xl border border-border/80" role="tablist">
            {(["all", "active", "completed"] as const).map((f) => (
              <button
                key={f}
                role="tab"
                aria-selected={filter === f}
                className={`flex-1 text-center py-2 px-3 rounded-lg text-xs md:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  filter === f
                    ? "bg-card text-accent shadow-sm border border-border/30"
                    : "text-muted hover:text-fg hover:bg-card/25"
                }`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* ── Todo list ── */}
          {loading ? (
            <div className="flex-1 min-h-0 flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-8 h-8 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
              <p className="text-sm text-muted font-medium">Fetching tasks...</p>
            </div>
          ) : (
            <TodoList
              todos={todos}
              filter={filter}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
              onRename={renameTodo}
            />
          )}

          {/* ── Footer ── */}
          {!loading && (
            <footer className="flex justify-between items-center border-t border-border pt-4 text-xs text-muted font-medium">
              <span className="bg-bg/85 border border-border/60 px-3 py-1 rounded-full shadow-sm">
                {activeCount} task{activeCount !== 1 ? "s" : ""} left
              </span>
              {todos.some((t) => t.completed) && (
                <button
                  className="text-muted hover:text-danger hover:bg-danger/10 hover:border-danger/10 border border-transparent py-1.5 px-3 rounded-lg transition-all duration-200 cursor-pointer font-semibold"
                  onClick={() =>
                    todos
                      .filter((t) => t.completed)
                      .forEach((t) => deleteTodo(t.id))
                  }
                >
                  Clear completed
                </button>
              )}
            </footer>
          )}
        </div>
      </main>
    </div>
  );
};

export default Page;

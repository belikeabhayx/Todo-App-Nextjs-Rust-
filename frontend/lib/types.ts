export interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

export interface CreateTodoRequest {
  title: string;
}

export interface UpdateTodoRequest {
  title?: string;
  completed?: boolean;
}

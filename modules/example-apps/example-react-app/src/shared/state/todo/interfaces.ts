export interface TodoState {
  isLoading: boolean;
  todos: Todo[];
}

export interface Todo {
  id: string;
  isComplete: boolean;
  name: string;
}

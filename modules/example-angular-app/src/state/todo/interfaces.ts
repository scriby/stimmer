export interface TodoState {
  todos: Todo[];
}

export interface Todo {
  isComplete: boolean;
  name: string;
}

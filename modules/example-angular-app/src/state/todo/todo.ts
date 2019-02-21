import {Injectable} from '@angular/core';
import {Draft} from 'immer';
import {createSelector} from 'reselect';
import {Feature, Store} from 'stimmer';

import {Todo, TodoState} from './interfaces';
import {State} from '../index';
import {RxjsAdapter} from 'stimmer-rxjs';
import {BackendService} from '../../services/backend/backend_service';

@Injectable({ providedIn: 'root' })
export class TodoFeature extends Feature<State, TodoState> {
  readonly isLoading$ = this.rxjsAdapter.select(createSelector(this.getFeatureState, s => s.isLoading));
  readonly todos$ = this.rxjsAdapter.select(createSelector(this.getFeatureState, s => s.todos));

  constructor(
    private readonly backendService: BackendService,
    private readonly rxjsAdapter: RxjsAdapter<State>,
    store: Store<State>
  ) {
    super(store);
  }

  protected getFeatureState(state: State) {
    return state.todo;
  }

  protected initFeatureState(state: Draft<State>): void {
    state.todo = {
      isLoading: false,
      todos: []
    };
  }

  addTodo = this.action((state, todo: Todo) => {
    state.todos.push(todo);
  });

  loadTodos = this.action(async(state) => {
    state.isLoading = true;

    try {
      const todos = await this.backendService.fetchTodos();

      state.todos = state.todos.concat(todos);
    } finally {
      state.isLoading = false;
    }
  });

  markCompletion = this.action((state, id: string, isComplete: boolean) => {
    const todo = state.todos.find(t => t.id === id);

    if (todo) {
      todo.isComplete = isComplete;
    }
  });

  removeTodo = this.action((state, id: string) => {
    const index = state.todos.findIndex(t => t.id === id);

    if (index >= 0) {
      state.todos.splice(index, 1);
    }
  });
}

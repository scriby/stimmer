import {Injectable} from '@angular/core';
import {Draft} from 'immer';
import {createSelector} from 'reselect';
import {Feature, Store} from 'stimmer';

import {TodoState} from './interfaces';
import {State} from '../index';
import {RxjsAdapter} from 'stimmer-rxjs';

@Injectable({ providedIn: 'root' })
export class TodoFeature extends Feature<State, TodoState> {
  private readonly todos = createSelector(this.getFeatureState, s => s.todos);
  readonly todos$ = this.rxjsAdapter.select(this.todos);

  constructor(
    private readonly rxjsAdapter: RxjsAdapter<State>,
    store: Store<State>
  ) {
    super(store);
  }

  getFeatureState(state: State) {
    return state.todo;
  }

  protected initFeatureState(state: Draft<State>): void {
    state.todo = {
      todos: []
    };
  }

  addTodo = this.action((state: Draft<TodoState>, name: string) => {
    state.todos.push({
      name,
      isComplete: false
    });
  });
}

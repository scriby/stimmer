import {Draft, produce} from 'immer';

export class Store<T> {
  private state: T = Object.create(null);

  getState(): T {
    return this.state;
  }

  update(fn: (draft: Draft<T>) => void) {
    this.state = produce(this.state, (draft: Draft<T>) => {
      fn(draft);
    });
  }
}
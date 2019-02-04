import {Subject} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';
import {Immutable, Store} from 'stimmer';

export class RxjsAdapter<T> {
  private readonly stateSubject$ = new Subject<Immutable<T>>();
  private readonly state$ = this.stateSubject$.pipe(shareReplay(1));

  constructor(private readonly store: Store<T>) {
    this.store.addStateChangeHandler(this.onStoreChange);
  }

  select<U>(selector: (state: Immutable<T>) => U) {
    return this.state$.pipe(map(state => selector(state)));
  }

  private onStoreChange = (state: Immutable<T>) => {
    this.stateSubject$.next(state);
  };
}

import {Observable, Subject} from 'rxjs';
import {distinctUntilChanged, map, shareReplay} from 'rxjs/operators';
import {Immutable, Store} from 'stimmer';

export class RxjsAdapter<T> {
  private readonly stateSubject$ = new Subject<Immutable<T>>();
  private readonly state$ = this.stateSubject$.pipe(shareReplay(1));

  private readonly actionsSubject$ = new Subject<{ name: string, args: any[] }>();
  readonly actions$ = this.actionsSubject$.asObservable();

  constructor(private readonly store: Store<T>) {
    // Make observable hot such that it tracks state updates before any external subscribers connect.
    this.state$.subscribe(() => {});

    this.store.addStateChangeHandler(this.onStoreChange);
  }

  select<U>(selector: (state: Immutable<T>) => U): Observable<U> {
    return this.state$.pipe(map(state => selector(state)), distinctUntilChanged());
  }

  private onStoreChange = (state: Immutable<T>, actionInfo: { name: string, args: any[] }): void => {
    this.actionsSubject$.next(actionInfo);
    this.stateSubject$.next(state);
  };
}

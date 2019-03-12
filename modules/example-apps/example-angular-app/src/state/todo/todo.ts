import {Injectable} from '@angular/core';
import {createSelector} from 'reselect';
import {RxjsAdapter} from 'stimmer-rxjs';
import {Store} from 'stimmer';

import {TodoFeature} from '../../../../example-react-app/src/shared/state/todo/todo';

import {NgBackendService} from "../../services/backend/backend_service";
import {State} from '../../../../example-react-app/src/shared/state';

@Injectable({ providedIn: 'root' })
export class NgTodoFeature extends TodoFeature {
  readonly isLoading$ = this.rxjsAdapter.select(createSelector(this.getFeatureState, s => s.isLoading));
  readonly todos$ = this.rxjsAdapter.select(createSelector(this.getFeatureState, s => s.todos));

  constructor(
    backendService: NgBackendService,
    private readonly rxjsAdapter: RxjsAdapter<State>,
    store: Store<State>
  ) {
    super(backendService, store);
  }
}

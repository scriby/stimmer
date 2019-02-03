import {Draft, finishDraft} from 'immer';
import {Store} from './store';

type ActionFunction<T, Rest extends any[], U> = (draft: Draft<T>, ...rest: Rest) => U;

export abstract class Feature<STATE, FEATURE_STATE> {
  constructor(private readonly store: Store<STATE>) {
    this.init();
  }

  protected abstract getFeatureState(state: Draft<STATE>): FEATURE_STATE;
  protected abstract initFeatureState(state: Draft<STATE>): void;

  protected action<Rest extends any[], U>(fn: ActionFunction<FEATURE_STATE, Rest, U>) {
    return (...rest: Rest) => {
      return this.store._update((draft: Draft<STATE>) => {
        const featureState = this.getFeatureState(draft);

        return (fn as Function).apply(this, [ featureState ].concat(rest)) as U;
      });
    }
  }

  private init() {
    this.store._update((draft: Draft<STATE>) => {
      this.initFeatureState(draft);
    });
  }
}

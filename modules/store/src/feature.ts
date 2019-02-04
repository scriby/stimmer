import {Draft} from 'immer';
import {Store} from './store';

type ActionFunction<Rest extends any[], U> = (...rest: Rest) => U;

export abstract class Feature<STATE, FEATURE_STATE> {
  constructor(private readonly store: Store<STATE>) {
    this.init();
  }

  protected abstract getFeatureState(state: Draft<STATE>): FEATURE_STATE;
  protected abstract initFeatureState(state: Draft<STATE>): void;

  get draft() {
    let draft = this.store._getCurrentDraft();
    if (!draft) {
      draft = this.store._startAsyncDraft();
    }

    return this.getFeatureState(draft);
  }

  protected action<Rest extends any[], U>(fn: ActionFunction<Rest, U>) {
    return (...rest: Rest) => {
      return this.store._update(() => {
        return (fn as Function).apply(this, rest);
      }) as U;
    }
  }

  private init() {
    this.store._update((draft: Draft<STATE>) => {
      this.initFeatureState(draft);
    });
  }
}

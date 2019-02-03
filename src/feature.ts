import {Draft, finishDraft} from 'immer';
import {Store} from './store';

type ActionFunction<T, Rest extends any[]> = (draft: Draft<T>, ...rest: Rest) => void;

export abstract class Feature<STATE, FEATURE_STATE> {
  constructor(private readonly store: Store<STATE>) {
    this.init();
  }

  protected abstract getFeatureState(state: Draft<STATE>): FEATURE_STATE;
  protected abstract initFeatureState(state: Draft<STATE>): void;

  protected action<Rest extends any[]>(fn: ActionFunction<FEATURE_STATE, Rest>) {
    return (...rest: Rest) => {
      this.store._update((draft: Draft<STATE>) => {
        const featureState = this.getFeatureState(draft);

        (fn as Function).apply(this, [ featureState ].concat(rest));
      });
    }
  }

  private init() {
    this.store._update((draft: Draft<STATE>) => {
      this.initFeatureState(draft);
    });
  }
}

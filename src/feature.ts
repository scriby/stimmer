import {Draft, produce} from 'immer';
import {Store} from './store';

type ActionFunction<T, Rest extends any[]> = (draft: Draft<T>, ...rest: Rest) => void;

export abstract class Feature<STATE, FEATURE_STATE> {
  constructor(private readonly store: Store<STATE>) {
    this.init();
  }

  protected abstract getFeatureState(state: STATE): FEATURE_STATE;
  protected abstract initFeatureState(state: STATE): void;

  protected action<Rest extends any[]>(fn: ActionFunction<FEATURE_STATE, Rest>) {
    return (...rest: Rest) => {
      const newState = produce(this.store.getRoot(), (draft: Draft<STATE>) => {
        const featureState = this.getFeatureState(draft as STATE);

        (fn as Function).apply(this, [ featureState ].concat(rest));
      });

      this.store.setRoot(newState);
    }
  }

  private init() {
    const newState = produce(this.store.getRoot(), (draft: Draft<STATE>) => {
      this.initFeatureState(draft as STATE);
    });

    this.store.setRoot(newState);
  }
}

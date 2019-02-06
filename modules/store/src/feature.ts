import {Draft} from 'immer';
import {Store} from './store';

type ActionFunction<Rest extends any[], U> = (...rest: Rest) => U;

export abstract class Feature<STATE, FEATURE_STATE> {
  constructor(private readonly store: Store<STATE>) {
    this.init();
  }

  private actionNamesSet = false;
  protected abstract getFeatureState(state: Draft<STATE>): Draft<FEATURE_STATE>;
  protected abstract initFeatureState(state: Draft<STATE>): void;

  get state(): Draft<FEATURE_STATE> {
    let draft = this.store._getCurrentDraft();
    if (!draft) {
      draft = this.store._startAsyncDraft();
    }

    return this.getFeatureState(draft);
  }

  protected action<Rest extends any[], U>(fn: ActionFunction<Rest, U>): (...rest: Rest) => U {
    const actionFn = (...rest: Rest) => {
      this.ensureActionNames();
      this.store._actionCalled((actionFn as any)._stimmerActionName, rest);

      return this.store._update(() => {
        return (fn as Function).apply(this, rest);
      }, {
        name: actionFn.name,
        args: rest
      }) as U;
    };

    actionFn._isStimmerActionFn = true;

    return actionFn;
  }

  private init(): void {
    this.store._update((draft: Draft<STATE>) => {
      this.initFeatureState(draft);
    }, {
      name: 'init',
      args: []
    });
  }

  private ensureActionNames(): void {
    if (this.actionNamesSet) return;

    for (const key of Object.keys(this)) {
      const value = (this as any)[key];
      if (value && value._isStimmerActionFn) {
        value._stimmerActionName = key;
      }
    }

    this.actionNamesSet = true;
  }
}

import {Draft} from 'immer';
import {Store} from './store';

type ActionFunction<T, Rest extends any[], U> = (state: T, ...rest: Rest) => U;

export abstract class Feature<STATE, FEATURE_STATE> {
  constructor(private readonly store: Store<STATE>) {
    this.init();
  }

  private actionNamesSet = false;
  protected abstract getFeatureState(state: Draft<STATE>): Draft<FEATURE_STATE>;
  protected abstract initFeatureState(state: Draft<STATE>): void;

  private getFeatureStateDraft(): Draft<FEATURE_STATE> {
    let draft = this.store._getCurrentDraft();
    if (!draft) {
      draft = this.store._startAsyncDraft();
    }

    return this.getFeatureState(draft);
  }

  private getFeatureStateProxy(): Draft<FEATURE_STATE> {
    const proxy = new Proxy({}, {
      defineProperty: () => {
        throw new Error('Object.defineProperty() cannot be used on an Immer draft');
      },
      deleteProperty: (obj, prop) => delete (this.getFeatureStateDraft() as any)[prop],
      get: (obj, prop) => (this.getFeatureStateDraft() as any)[prop],
      getPrototypeOf: (obj) => Object.getPrototypeOf(this.getFeatureStateDraft()),
      getOwnPropertyDescriptor: (obj, prop) => Reflect.getOwnPropertyDescriptor(this.getFeatureStateDraft() as any, prop),
      has: (obj, prop) => prop in (this.getFeatureStateDraft() as any),
      ownKeys: (obj) => Reflect.ownKeys(this.getFeatureStateDraft() as any),
      set: (obj, prop, value) => (this.getFeatureStateDraft() as any)[prop] = value,
      setPrototypeOf: () => {
        throw new Error("Object.setPrototypeOf() cannot be used on an Immer draft");
      }
    });

    return proxy as any;
  }

  protected action<Rest extends any[], U>(fn: ActionFunction<FEATURE_STATE, Rest, U>): (...rest: Rest) => U {
    const actionFn = (...rest: Rest) => {
      this.ensureActionNames();

      return this.store._update((draft) => {
        return (fn as Function).apply(this, [this.getFeatureStateProxy()].concat(rest));
      }, {
        name: (actionFn as any)._stimmerActionName,
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

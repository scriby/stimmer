import {Draft} from 'immer';
import {ActionInfo, Store} from './store';

type ActionFunction<T, Rest extends any[], U> = (state: T, ...rest: Rest) => U;

export abstract class Feature<STATE, FEATURE_STATE> {
  constructor(private readonly store: Store<STATE>) {
    this.init();
  }

  private actionNamesSet = false;
  protected abstract getFeatureState(state: Draft<STATE>): Draft<FEATURE_STATE>;
  protected abstract initFeatureState(state: Draft<STATE>): void;

  private getFeatureStateDraft(actionInfo: ActionInfo): Draft<FEATURE_STATE> {
    let draft = this.store._getCurrentDraft();
    if (!draft) {
      draft = this.store._startAsyncDraft({
        ...actionInfo,
        isAsync: true
      });
    }

    return this.getFeatureState(draft);
  }

  private getFeatureStateProxy(actionInfo: ActionInfo): Draft<FEATURE_STATE> {
    const proxy = new Proxy({}, {
      defineProperty: () => {
        throw new Error('Object.defineProperty() cannot be used on an Immer draft');
      },
      deleteProperty: (obj, prop) => delete (this.getFeatureStateDraft(actionInfo) as any)[prop],
      get: (obj, prop) => (this.getFeatureStateDraft(actionInfo) as any)[prop],
      getPrototypeOf: (obj) => Object.getPrototypeOf(this.getFeatureStateDraft(actionInfo)),
      getOwnPropertyDescriptor: (obj, prop) => Reflect.getOwnPropertyDescriptor(this.getFeatureStateDraft(actionInfo) as any, prop),
      has: (obj, prop) => prop in (this.getFeatureStateDraft(actionInfo) as any),
      ownKeys: (obj) => Reflect.ownKeys(this.getFeatureStateDraft(actionInfo) as any),
      set: (obj, prop, value) => (this.getFeatureStateDraft(actionInfo) as any)[prop] = value,
      setPrototypeOf: () => {
        throw new Error("Object.setPrototypeOf() cannot be used on an Immer draft");
      }
    });

    return proxy as any;
  }

  protected action<Rest extends any[], U>(fn: ActionFunction<FEATURE_STATE, Rest, U>): (...rest: Rest) => U {
    const actionFn = (...rest: Rest) => {
      this.ensureActionNames();
      const actionInfo = {
        name: (actionFn as any)._stimmerActionName,
        args: rest
      };

      return this.store._update((draft) => {
        return (fn as Function).apply(this, [this.getFeatureStateProxy(actionInfo)].concat(rest));
      }, actionInfo) as U;
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

import {tap} from 'rxjs/operators';
import {createSelector} from 'reselect';
import {Feature, Store} from 'stimmer';
import {RxjsAdapter} from './adapter';

const getValueAsync = (text: string) => new Promise<string>((resolve) => {
  setTimeout(() => {
    resolve(text);
  }, 0);
});

interface State {
  adapter: AdapterFeatureState;
}

interface AdapterFeatureState {
  name: string;
}

const infoSelector = (state: State) => state.adapter;
const nameSelector = createSelector(infoSelector, (info) => info.name);

class AdapterTestFeature extends Feature<State, AdapterFeatureState> {
  protected getFeatureState = infoSelector;

  protected initFeatureState(state: State): void {
    state.adapter = {
      name: 'test'
    };
  }

  updateName = this.action((state, name: string) => {
    state.name = name;
  });

  updateNameAsync = this.action(async(state, name: string) => {
    state.name = name;

    name = await getValueAsync(name);

    state.name = `${name}_2`;

    name = await getValueAsync(name);

    state.name = `${name}_3`;
  });
}

describe('Rxjs adapter', () => {
  let feature: AdapterTestFeature;
  let rxjs: RxjsAdapter<State>;
  let store: Store<State>;

  beforeEach(() => {
    store = new Store<State>();
    feature = new AdapterTestFeature(store);
    rxjs = new RxjsAdapter(store);
  });

  describe('select', () => {
    it('emits on state change', () => {
      const spy = jasmine.createSpy('state');
      rxjs.select(state => state).pipe(tap(spy)).subscribe();

      feature.updateName('updated');

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenLastCalledWith({ adapter: { name: 'updated' } });
    });

    it('works with selectors', () => {
      const spy = jasmine.createSpy('state');
      rxjs.select(nameSelector).pipe(tap(spy)).subscribe();

      feature.updateName('updated');

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenLastCalledWith('updated');
    });

    it('emits only when the value changes', () => {
      const spy = jasmine.createSpy('state');
      rxjs.select(nameSelector).pipe(tap(spy)).subscribe();

      feature.updateName('updated');
      feature.updateName('updated');
      feature.updateName('updated_2');

      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenNthCalledWith(1, 'updated');
      expect(spy).toHaveBeenLastCalledWith('updated_2');
    });

    it('emits async', async() => {
      const spy = jasmine.createSpy('state');
      rxjs.select(nameSelector).pipe(tap(spy)).subscribe();

      await feature.updateNameAsync('updated');

      expect(spy).toHaveBeenCalledTimes(3);
      expect(spy).toHaveBeenNthCalledWith(1, 'updated');
      expect(spy).toHaveBeenNthCalledWith(2, 'updated_2');
      expect(spy).toHaveBeenNthCalledWith(3, 'updated_3');
    });
  });

  describe('actions$', () => {
    it('emits actions', () => {
      const spy = jasmine.createSpy('actions');
      rxjs.actions$.pipe(tap(spy)).subscribe();

      feature.updateName('updated');

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith({ name: 'updateName', args: ['updated'] });
    });

    it('emits async actions', async() => {
      const spy = jasmine.createSpy('actions');
      rxjs.actions$.pipe(tap(spy)).subscribe();

      await feature.updateNameAsync('updated');

      expect(spy).toHaveBeenCalledTimes(3);
      expect(spy).toHaveBeenNthCalledWith(1, { name: 'updateNameAsync', args: ['updated'] });
      expect(spy).toHaveBeenNthCalledWith(2, { name: 'updateNameAsync', args: ['updated'], isAsync: true });
      expect(spy).toHaveBeenNthCalledWith(3, { name: 'updateNameAsync', args: ['updated'], isAsync: true });
    });
  });
});
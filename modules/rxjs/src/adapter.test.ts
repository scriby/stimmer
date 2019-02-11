import {tap} from 'rxjs/operators';
import {createSelector} from 'reselect';
import {Feature, Store} from 'stimmer';
import {RxjsAdapter} from './adapter';

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

  it('emits actions', () => {
    const spy = jasmine.createSpy('actions');
    rxjs.actions$.pipe(tap(spy)).subscribe();

    feature.updateName('updated');

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith({ name: 'updateName', args: ['updated'] });
  });
});
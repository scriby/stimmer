import {Store} from './store';

interface State {
  name: string;
}

describe('Store', () => {
  let store: Store<State>;

  beforeEach(() => {
    store = new Store<State>();
  });

  it ('calls change handlers', () => {
    const spy = jasmine.createSpy('state change');

    store.subscribe(spy);

    store._update((draft) => {
      draft.name = 'updated';
    }, { featureName: 'test', name: 'test', args: [] });

    expect(spy).toHaveBeenCalledWith({ name: 'updated' }, { featureName: 'test', name: 'test', args: [] });
    expect(store.getState()).toEqual({ name: 'updated' });
  });
});
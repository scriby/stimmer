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

    store.addStateChangeHandler(spy);

    store._update((draft) => {
      draft.name = 'updated';
    });

    expect(spy).toHaveBeenCalledWith({ name: 'updated' });
    expect(store.getState()).toEqual({ name: 'updated' });
  });
});
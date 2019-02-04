import {tap} from 'rxjs/operators';
import {createSelector} from 'reselect';
import {Store} from 'stimmer';
import {RxjsAdapter} from './adapter';

interface State {
  info: {
    name: string;
  }
}

const nameSelector = createSelector((state: State) => state.info, (info) => info.name);

describe('Rxjs adapter', () => {
  let rxjs: RxjsAdapter<State>;
  let store: Store<State>;

  beforeEach(() => {
    store = new Store<State>();
    rxjs = new RxjsAdapter(store);
  });

  it('emits on state change', () => {
    const spy = jasmine.createSpy('state');
    rxjs.select(state => state).pipe(tap(spy)).subscribe();

    store._update((draft) => {
      draft.info = { name: 'test' };
    });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenLastCalledWith({ info: { name: 'test' } });
  });

  it('works with selectors', () => {
    const spy = jasmine.createSpy('state');
    rxjs.select(nameSelector).pipe(tap(spy)).subscribe();

    store._update((draft) => {
      draft.info = { name: 'test' };
    });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenLastCalledWith('test');
  });
});
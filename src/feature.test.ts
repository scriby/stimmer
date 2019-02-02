import {Feature} from './feature';
import {Store} from './store';

interface State {
  test: TestFeatureState
}

interface TestFeatureState {
  name: string,
}

class TestFeature extends Feature<State, TestFeatureState> {
  protected getFeatureState(state: State) {
    return state.test;
  }

  protected initFeatureState(state: State) {
    state.test = {
      name: 'test'
    };
  }

  updateName = this.action((draft, newName: string) => {
    draft.name = newName;
  });
}

describe('Feature', () => {
  const store = new Store<State>();
  const testFeature = new TestFeature(store);

  it('updates the state with an action', () => {
    testFeature.updateName('updated');

    expect(store.getRoot().test.name).toBe('updated');
  });
});
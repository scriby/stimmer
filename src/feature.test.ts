import {Feature} from './feature';
import {Store} from './store';

const getValueAsync = (text: string) => Promise.resolve(text);

interface State {
  test: TestFeatureState
}

interface TestFeatureState {
  age: number;
  isUpdating: boolean;
  name: string,
}

class TestFeature extends Feature<State, TestFeatureState> {
  protected getFeatureState(state: State) {
    return state.test;
  }

  protected initFeatureState(state: State) {
    state.test = {
      age: 30,
      isUpdating: false,
      name: 'test'
    };
  }

  updateName = this.action((draft, newName: string) => {
    draft.name = newName;
  });

  updateAgeAndName = this.action((draft, newName: string, newAge: number) => {
    draft.age = newAge;

    this.updateName(newName);
  });

  asyncUpdateName = this.action(async(draft, newName: string) => {
    this.updateName('before update');
    const name = await getValueAsync(newName);
    this.updateName(name);
  });
}

describe('Feature', () => {
  let store: Store<State>;
  let testFeature: TestFeature;

  beforeEach(() => {
    store = new Store<State>();
    testFeature = new TestFeature(store);
  });

  it('updates the state with an action', () => {
    testFeature.updateName('updated');

    expect(store.getState().test.name).toBe('updated');
  });

  it('updates the state with an action that calls another action', () => {
    testFeature.updateAgeAndName('updated', 40);

    const featureState = store.getState().test;
    expect(featureState.name).toBe('updated');
    expect(featureState.age).toBe(40);
  });

  it('updates the name asynchronously', async() => {
    await testFeature.asyncUpdateName('updated');

    const featureState = store.getState().test;
    expect(featureState.name).toBe('updated');
  });
});
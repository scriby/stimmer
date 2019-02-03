import {Feature} from './feature';
import {Store} from './store';

const getValueAsync = (text: string) => Promise.resolve(text);

interface State {
  test: TestFeatureState
}

interface TestFeatureState {
  age: number;
  name: string,
}

class TestFeature extends Feature<State, TestFeatureState> {
  protected getFeatureState(state: State) {
    return state.test;
  }

  protected initFeatureState(state: State) {
    state.test = {
      age: 30,
      name: 'test'
    };
  }

  updateName = this.action((newName: string) => {
    this.draft.name = newName;
  });

  updateAgeAndName = this.action((newName: string, newAge: number) => {
    this.draft.age = newAge;

    this.updateName(newName);
  });

  asyncNameUpdateUsingNestedAction = this.action(async(newName: string) => {
    this.updateName('before update');
    const name = await getValueAsync(newName);
    this.updateName(name);
  });

  asyncNameUpdateUsingAwait = this.action(async(newName: string) => {
    const name = await getValueAsync(newName);

    this.draft.name = name;
  });

  asyncNameUpdateUsingMultipleAwaits = this.action(async(newName: string) => {
    let name = await getValueAsync(newName);
    this.draft.name = `${name}_1`;
    name = await getValueAsync(newName);
    this.draft.name = `${name}_2`;
    name = await getValueAsync(newName);
    this.draft.name = `${name}_3`;
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

  it('updates the name asynchronously using nested actions', async() => {
    await testFeature.asyncNameUpdateUsingNestedAction('updated');

    const featureState = store.getState().test;
    expect(featureState.name).toBe('updated');
  });

  it('updates the name asynchronously directly', async() => {
    await testFeature.asyncNameUpdateUsingAwait('updated');

    const featureState = store.getState().test;
    expect(featureState.name).toBe('updated');
  });

  it('updates the name asynchronously through multiple awaits', async() => {
    await testFeature.asyncNameUpdateUsingMultipleAwaits('updated');

    const featureState = store.getState().test;
    expect(featureState.name).toBe('updated_3');
  });

  it('interleaves async actions', async() => {
    await Promise.all([
      testFeature.asyncNameUpdateUsingMultipleAwaits('a'),
      testFeature.asyncNameUpdateUsingMultipleAwaits('b'),
      testFeature.asyncNameUpdateUsingMultipleAwaits('c'),
    ]);

    const featureState = store.getState().test;
    expect(featureState.name).toBe('c_3');
  });

  it('interleaves async & sync actions', async() => {
    const promise = testFeature.asyncNameUpdateUsingMultipleAwaits('a');
    testFeature.updateName('updated');
    expect(store.getState().test.name).toBe('updated');

    await promise;
    expect(store.getState().test.name).toBe('a_3');
  });
});
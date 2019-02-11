import {Draft} from 'immer';
import {Feature} from './feature';
import {Store} from './store';

const getValueAsync = (text: string) => new Promise<string>((resolve) => {
  setTimeout(() => {
    resolve(text);
  }, 0);
});

interface State {
  test: TestFeatureState
}

interface TestFeatureState {
  age: number;
  name: string,
}

class TestFeature extends Feature<State, TestFeatureState> {
  protected getFeatureState = (state: State) => state.test;

  protected initFeatureState(state: Draft<State>) {
    state.test = {
      age: 30,
      name: 'test'
    };
  }

  updateName = this.action((state, newName: string) => {
    state.name = newName;
  });

  updateAgeAndName = this.action((state, newName: string, newAge: number) => {
    state.age = newAge;

    this.updateName(newName);
  });

  asyncNameUpdateUsingNestedAction = this.action(async(state, newName: string) => {
    this.updateName('before update');
    const name = await getValueAsync(newName);
    this.updateName(name);
  });

  asyncNameUpdateUsingAwait = this.action(async(state, newName: string) => {
    state.name = await getValueAsync(newName);
  });

  asyncNameUpdateUsingMultipleAwaits = this.action(async(state, newName: string) => {
    let name = await getValueAsync(newName);
    state.name = `${name}_1`;
    name = await getValueAsync(newName);
    state.name = `${name}_2`;
    name = await getValueAsync(newName);
    state.name = `${name}_3`;
  });

  asyncTestWithErrors = this.action(async(state, newName: string) => {
    let name = await getValueAsync(newName);
    state.name = `${name}_1`;
    name = await getValueAsync(newName);
    state.name = `${name}_2`;

    throw new Error('test');
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

  it('does not apply changes to drafts in the same leg that threw an error', async() => {
    try {
      await testFeature.asyncTestWithErrors('a');
    } catch(e) {}

    const featureState = store.getState().test;
    expect(featureState.name).toBe('a_1')
  });

  it('errors thrown in an async test do not affect other async actions', async() => {
    await Promise.all([
      testFeature.asyncTestWithErrors('a').catch(() => {}),
      testFeature.asyncNameUpdateUsingMultipleAwaits('b'),
    ]);

    const featureState = store.getState().test;
    expect(featureState.name).toBe('b_3');
  });
});
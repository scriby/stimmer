import {ReduxDevtoolsExtension} from './interfaces';
import {Store} from 'stimmer';

const extension: ReduxDevtoolsExtension = (window as any)['__REDUX_DEVTOOLS_EXTENSION__'];

export class ReduxDevToolsAdapter {
  private readonly connection = extension.connect(
    { name: 'Stimmer dev tools', maxAge: 50 }
  );

  constructor(private readonly store: Store<unknown>) {
    this.store.addStateChangeHandler((state, action) => {
      this.connection.send({ type: action.name, args: action.args}, state);
    });
  }

  init() {
    this.connection.init();
  }
}
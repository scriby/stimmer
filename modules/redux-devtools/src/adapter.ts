import {ReduxDevtoolsExtension} from './interfaces';
import {Store} from 'stimmer';

const extension: ReduxDevtoolsExtension = (window as any)['__REDUX_DEVTOOLS_EXTENSION__'];

export class ReduxDevToolsAdapter {
  private readonly connection = extension && extension.connect(
    { name: 'Stimmer dev tools', maxAge: 50 }
  );

  constructor(private readonly store: Store<unknown>) {
    if (!this.connection) return;

    this.store.subscribe((state, action) => {
      const name = !action.isAsync ? action.name : action.name + ' (async)';
      const type = `[${action.featureName}] ${name}`;

      this.connection.send({ type, args: action.args}, state);
    });
  }

  init() {
    if (this.connection) {
      this.connection.init();
    }
  }
}
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import {App} from './App';

import './index.css';
import {Context} from "./context";

ReactDOM.render(
    <Context.Consumer>
      {(context) => (
        // TODO: See if typings can match
        <Provider store={context.store as any}>
          <App />
        </Provider>
      )}
    </Context.Consumer>,
  document.getElementById('root') as HTMLElement
);

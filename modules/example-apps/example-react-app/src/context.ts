import * as React from 'react';
import {TodoFeature} from "./shared/state/todo/todo";
import {BackendService} from "./shared/services/backend/backend_service";
import {Store} from "stimmer";
import {State} from "./shared/state";

const store = new Store<State>();
const todo = new TodoFeature(new BackendService(), store);

// TODO: Move this into the store
(store as any).dispatch = () => {};

export const features = {
  todo
};

export const Context = React.createContext({
  store,
  features
});
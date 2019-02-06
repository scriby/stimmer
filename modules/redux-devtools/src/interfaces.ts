export interface ReduxDevtoolsExtensionConnection {
  init(state?: any): void;
  error(anyErr: any): void;
  send(action: any, state: any): void;
  subscribe(listener: (change: any) => void): void;
  unsubscribe(): void;
}

export type SerializationOptions = {
  immutable?: any;
  options?: boolean | any;
  refs?: Array<any>;
  replacer?: (key: any, value: any) => {};
  reviver?: (key: any, value: any) => {};
};

export interface ReduxDevtoolsExtension {
  connect(options: {
    features?: object | boolean;
    maxAge?: number;
    name: string | undefined;
    serialize?: boolean | SerializationOptions;
  }): ReduxDevtoolsExtensionConnection;
}
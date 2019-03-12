import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {Store} from 'stimmer';
import {RxjsAdapter} from 'stimmer-rxjs';
import {ReduxDevToolsAdapter} from 'stimmer-redux-devtools';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [
    {
      provide: RxjsAdapter,
      useFactory: (store: Store<unknown>) => new RxjsAdapter(store),
      deps: [Store]
    },
    {
      provide: ReduxDevToolsAdapter,
      useFactory: (store: Store<unknown>) => new ReduxDevToolsAdapter(store),
      deps: [Store]
    },
    Store
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(devTools: ReduxDevToolsAdapter) {
    devTools.init();
  }
}

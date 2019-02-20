import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';
import { TodoFeature } from '../state/todo/todo';
import {State} from '../state';
import {RxjsAdapter} from 'stimmer-rxjs';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  readonly todos$ = this.todo.todos$;

  constructor(private readonly todo: TodoFeature) {}

  onAddTodo() {
    this.todo.addTodo(Math.random().toString());
  }
}

import {ChangeDetectionStrategy} from '@angular/core';
import {Component} from '@angular/core';
import {TodoFeature} from '../state/todo/todo';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  readonly isLoading$ = this.todo.isLoading$;
  readonly todos$ = this.todo.todos$;

  constructor(private readonly todo: TodoFeature) {
    this.todo.loadTodos();
  }

  onAddTodo() {
    this.todo.addTodo({
      id: Math.random().toString(),
      isComplete: false,
      name: Math.random().toString()
    });
  }

  onIsCompleteChange(event: Event, todoId: string) {
    if (!(event.currentTarget instanceof HTMLInputElement)) return;

    this.todo.markCompletion(todoId, event.currentTarget.checked);
  }

  onRemoveTodo(todoId: string) {
    this.todo.removeTodo(todoId);
  }
}

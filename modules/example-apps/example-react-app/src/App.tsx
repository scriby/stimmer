import * as React from 'react';
import {connect} from 'react-redux';

import {State} from './shared/state';

import './App.css';
import {TodoState} from './shared/state/todo/interfaces';
import {Context, features} from './context';
import {TodoFeature} from './shared/state/todo/todo';

type AppProps = TodoState & { features: typeof features };

class AppInternal extends React.Component<AppProps> {
  private todo: TodoFeature;

  constructor(props: AppProps) {
    super(props);

    this.todo = props.features.todo;
    this.todo.loadTodos();
  }

  public render() {
    const {isLoading, todos} = this.props;

    return (
      <div>
        <button onClick={this.onAddTodo}>Add todo</button>

        {isLoading && <span>Loading...</span>}

        {todos.map((todo) => <div key={todo.id}>
          <label>
            <input type="checkbox" checked={todo.isComplete} onChange={this.onChange.bind(this, todo.id)} />
            {todo.name}
          </label>

          <button onClick={this.onRemoveTodo.bind(this, todo.id)}>remove</button></div>)}
      </div>
    );
  }

  private onAddTodo = () => {
    this.todo.addTodo({
      id: Math.random().toString(),
      isComplete: false,
      name: Math.random().toString()
    });
  };

  private onChange(todoId: string, event: MouseEvent) {
    if (!(event.target instanceof HTMLInputElement)) return;

    this.todo.markCompletion(todoId, event.target.checked);
  }

  private onRemoveTodo(todoId: string) {
    this.todo.removeTodo(todoId);
  }
}

export const App = connect((state: State) => {
  return state.todo;
})((props) => (
  <Context.Consumer>
    {(context) => <AppInternal features={context.features} {...props} />}
  </Context.Consumer>
));

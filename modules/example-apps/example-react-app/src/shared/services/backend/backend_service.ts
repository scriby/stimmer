import {Todo} from '../../state/todo/interfaces';

export class BackendService {
  fetchTodos(): Promise<Todo[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {id: '1', name: 'Get the milk', isComplete: true},
          {id: '2', name: `Don't forget the bacon`, isComplete: false},
        ]);
      }, 1000);
    });
  }
}

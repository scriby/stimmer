export class Store<T> {
  private root: T = Object.create(null);

  getRoot(): T {
    return this.root;
  }

  setRoot(state: T) {
    this.root = state;
  }
}
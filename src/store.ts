import {Draft, produce, createDraft, finishDraft, Immutable} from 'immer';

export class Store<T> {
  private state: T = Object.create(null);

  private currentDraft?: Draft<T>;

  getState(): Immutable<T> {
    return this.state as Immutable<T>;
  }

  private finishDraft(draft: Draft<T>) {
    (this.state as any) = finishDraft(draft);
  }

  _getCurrentDraft() {
    return this.currentDraft;
  }

  /**
   * This is intended to be used by async actions using async/await. The draft created by this function
   * will be completed using a microtask (at the end of the current event loop in modern browsers).
   */
  _startAsyncDraft() {
    if (this.currentDraft) {
      throw new Error('Cannot start a new draft while one is active');
    }

    const draft = this.currentDraft = createDraft(this.state);

    // Complete the draft as soon as possible. This will run before any additional promises awaited by the app
    // code can complete before it was scheduled first.
    Promise.resolve().then(() => {
      this.finishDraft(draft);
      this.currentDraft = undefined;
    });

    return this.currentDraft;
  }

  _update(fn: (draft: Draft<T>) => unknown) {
    let draftCreated;

    if (!this.currentDraft) {
      this.currentDraft = createDraft(this.state);
      draftCreated = true;
    }

    let ret;
    try {
      ret = fn(this.currentDraft);

      if (draftCreated) {
        this.finishDraft(this.currentDraft);
      }
    } finally {
      if (draftCreated) {
        this.currentDraft = undefined;
      }
    }

    return ret;
  }
}
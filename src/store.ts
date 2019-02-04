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

    // Complete the draft asynchronously after it can be determined whether the current async "leg"
    // will throw or not (if it throws, draft changes are not persisted).
    Promise.resolve().then(() => Promise.resolve()).then(() => {
      if (draft === this.currentDraft) {
        try {
          this.finishDraft(this.currentDraft);
          this.currentDraft = undefined;
        } catch (e) {
        }
      }
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

    if (ret instanceof Promise) {
      ret.then(() => {
        if (this.currentDraft) {
          this.finishDraft(this.currentDraft);
          this.currentDraft = undefined;
        }
      }).catch(() => {
        this.currentDraft = undefined;
      });
    }

    return ret;
  }
}
import {Draft, produce, createDraft, finishDraft, Immutable} from 'immer';

export class Store<T> {
  private state: T = Object.create(null);

  private currentDraft?: Draft<T>;

  getState(): Immutable<T> {
    return this.state as Immutable<T>;
  }

  _update(fn: (draft: Draft<T>) => void) {
    let draft;
    let draftCreated;

    if (this.currentDraft) {
      draft = this.currentDraft;
    } else {
      this.currentDraft = draft = createDraft(this.state);
      draftCreated = true;
    }

    try {
      fn(draft);
    } finally {
      this.currentDraft = undefined;
    }

    if (draftCreated) {
      (this.state as any) = finishDraft(draft);
    }
  }
}
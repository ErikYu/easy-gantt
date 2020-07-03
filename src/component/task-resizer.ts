import { DataStore } from '../core/data-store';
import { g } from '../core/dom';

export class TaskResizer {
  el: HTMLElement;
  constructor(isLeft: boolean, private _store: DataStore) {
    this.el = g({
      tag: 'div',
      className: `task-resizer ${
        isLeft ? 'task-resizer-left' : 'task-resizer-right'
      }`,
    });
  }
}

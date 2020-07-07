import { addSeconds, differenceInSeconds } from 'date-fns';
import { g } from '../core/dom';
import { ClsPrefix } from '../core/constant';
import { GanttFlatItem, GanttItem } from '../model/data';
import { DataStore, EVT } from '../core/data-store';
import {
  addPx,
  getEndAtByEl,
  GetProgressByEl,
  getStartAtByEl,
  GetStartAtEndAtByEl,
} from '../util/util';
import { TaskResizer } from './task-resizer';

export class Draggable {
  el: HTMLElement;
  contentEl: HTMLElement;
  leftResizerEl: HTMLElement;
  rightResizerEl: HTMLElement;
  progressEl: HTMLElement;
  progressResizer: HTMLElement;
  startScreenX: number;
  startLeft: string;
  initWidth: number;
  initProgress: number; // 0 - 1

  constructor(public item: GanttItem, index: number, private store: DataStore) {
    const { unitWidth } = store;
    const contentWidth =
      (differenceInSeconds(item.endAt, item.startAt) * unitWidth) / 86400;
    this.el = g({
      tag: 'div',
      className: `${ClsPrefix}-item`,
      styles: {
        width: `${contentWidth}px`,
        top: `${
          index * store.unitHeight +
          (store.unitHeight - 1 - store.barHeight) / 2
        }px`,
        left: `${
          (differenceInSeconds(item.startAt, store.totalStart) * unitWidth) /
          86400
        }px`,
      },
      children: [
        (this.leftResizerEl = new TaskResizer(true, this.store).el),
        (this.rightResizerEl = new TaskResizer(false, this.store).el),
        (this.progressEl = g({
          tag: 'div',
          className: `${ClsPrefix}-item-progress`,
          styles: {
            width: `${item.progress * 100}%`,
          },
        })),
        (this.contentEl = g({
          tag: 'div',
          className: `${ClsPrefix}-item-content`,
          text: item.text,
        })),
        (this.progressResizer = g({
          tag: 'div',
          className: 'progress-resizer',
          styles: {
            left: `${item.progress * (contentWidth - 2)}px`,
          },
        })),
      ],
    });

    this.bindLeftResizer();
    this.bindRightResizer();
    this.bindProgressResizer();
  }

  bindProgressResizer() {
    const onMoveFn = (evt) => {
      const moveDistance = evt.screenX - this.startScreenX;
      console.log(this.initProgress, moveDistance);
      this.progressEl.style.width = addPx(
        this.contentEl.getBoundingClientRect().width * this.initProgress,
        moveDistance,
      );
      this.progressResizer.style.left = addPx(
        this.contentEl.getBoundingClientRect().width * this.initProgress,
        moveDistance,
      );
    };
    const onMouseUp = (evt) => {
      this.startScreenX = evt.screenX;
      this.initProgress = GetProgressByEl(this.contentEl, this.progressEl);
      document.removeEventListener('mousemove', onMoveFn);
      document.removeEventListener('mouseup', onMouseUp);
    };
    this.progressResizer.onmousedown = (evt) => {
      if (evt.detail !== 1) {
        return;
      }
      this.startScreenX = evt.screenX;
      this.initProgress = GetProgressByEl(this.contentEl, this.progressEl);
      document.addEventListener('mousemove', onMoveFn);
      document.addEventListener('mouseup', onMouseUp);
    };
  }

  // move seconds
  move() {
    const { startAt, endAt } = GetStartAtEndAtByEl(
      this.store.totalStart,
      this.store.unitWidth,
      this.el,
    );
    this.item.startAt = startAt;
    this.item.endAt = endAt;
    this.store.emit('reload-tree');
    this.store.emit(EVT.reloadLink, this.item.id);
  }

  moveStart() {
    this.item.startAt = getStartAtByEl(
      this.store.totalStart,
      this.store.unitWidth,
      this.el,
    );

    this.store.emit('reload-tree');
    this.store.emit(EVT.reloadLink, this.item.id);
  }

  moveEnd() {
    this.item.endAt = getEndAtByEl(
      this.store.totalStart,
      this.store.unitWidth,
      this.el,
    );
    this.store.emit('reload-tree');
    this.store.emit(EVT.reloadLink, this.item.id);
  }

  bindLeftResizer() {
    const onMoveFn = (evt) => {
      const moveDistance = evt.screenX - this.startScreenX;
      this.el.style.left = addPx(this.startLeft, moveDistance);
      this.el.style.width = addPx(this.initWidth, -moveDistance);
      this.moveStart();
    };
    const onMouseUp = (evt) => {
      this.startScreenX = evt.screenX;
      this.initWidth = this.el.getBoundingClientRect().width;
      this.startLeft = this.el.style.left;
      document.removeEventListener('mousemove', onMoveFn);
    };
    this.leftResizerEl.onmousedown = (evt) => {
      if (evt.detail !== 1) {
        return;
      }
      this.startScreenX = evt.screenX;
      this.initWidth = this.el.getBoundingClientRect().width;
      document.addEventListener('mousemove', onMoveFn);
      document.addEventListener('mouseup', onMouseUp);
    };
  }

  bindRightResizer() {
    const onMoveFn = (evt) => {
      const moveDistance = evt.screenX - this.startScreenX;
      this.el.style.width = addPx(this.initWidth, moveDistance);
      this.moveEnd();
    };
    const onMouseUp = (evt) => {
      this.startScreenX = evt.screenX;
      this.initWidth = this.el.getBoundingClientRect().width;
      document.removeEventListener('mousemove', onMoveFn);
    };
    this.rightResizerEl.onmousedown = (evt) => {
      if (evt.detail !== 1) {
        return;
      }
      this.startScreenX = evt.screenX;
      this.initWidth = this.el.getBoundingClientRect().width;
      document.addEventListener('mousemove', onMoveFn);
      document.addEventListener('mouseup', onMouseUp);
    };
  }
}

import { differenceInSeconds } from 'date-fns';
import { g, setStyle } from '../core/dom';
import { ClsPrefix } from '../core/constant';
import { GanttItem } from '../model/data';
import { DataStore, EVT } from '../core/data-store';
import {
  addPx,
  getEndAtByEl,
  GetProgressByEl,
  getStartAtByEl,
  GetStartAtEndAtByEl,
} from '../util/util';
import { TaskResizer } from './task-resizer';
import { Sheet } from './sheet';
import { Link } from './link';

export class Draggable {
  el: HTMLElement;
  contentEl: HTMLElement;
  leftResizerEl: HTMLElement;
  rightResizerEl: HTMLElement;
  progressEl: HTMLElement;
  progressResizer: HTMLElement;
  leftPointerEl: HTMLElement;
  rightPointerEl: HTMLElement;
  startScreenX: number;
  startLeft: string;
  initWidth: number;
  initProgress: number; // 0 - 1

  constructor(
    public item: GanttItem,
    index: number,
    private store: DataStore,
    private sheet: Sheet,
  ) {
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
        (this.leftPointerEl = g({
          tag: 'div',
          className: 'pointer',
          styles: {
            left: '-15px',
          },
        })),
        (this.rightPointerEl = g({
          tag: 'div',
          className: 'pointer',
          styles: {
            right: '-15px',
          },
        })),
      ],
    });

    this.bindLeftResizer();
    this.bindRightResizer();
    this.bindProgressResizer();
    this.bindPointer();
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
      document.removeEventListener('mouseup', onMouseUp);
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

  bindPointer() {
    const fakeElem = g({
      tag: 'div',
      styles: {
        position: 'absolute',
        backgroundColor: 'transparent',
      },
    });
    let fakeLink: Link = null;
    const onMoveFn = (evt) => {
      fakeElem.style.left = addPx(fakeElem.style.left, evt.movementX);
      fakeElem.style.top = addPx(fakeElem.style.top, evt.movementY);
      fakeLink.render();
    };
    const onMouseUp = (evt: MouseEvent) => {
      this.sheet.sheetEl.removeChild(fakeElem);
      this.sheet.sheetEl.removeChild(fakeLink.el);
      fakeLink = null;
      document.removeEventListener('mousemove', onMoveFn);
      document.removeEventListener('mouseup', onMouseUp);
    };
    const onMouseDown = (pos: 'l' | 'r') => (evt: MouseEvent) => {
      const top = `${
        evt.clientY - this.sheet.sheetEl.getBoundingClientRect().top - 10
      }px`;
      const left = `${
        evt.clientX - this.sheet.sheetEl.getBoundingClientRect().left
      }px`;
      setStyle(fakeElem, {
        top,
        left,
      });
      this.sheet.sheetEl.appendChild(fakeElem);
      const typing = pos === 'l' ? 'l2l' : 'r2l';
      fakeLink = new Link(
        { fromEl: this.el, toEl: fakeElem, typing, className: 'fake-link' },
        this.store,
      );
      this.sheet.sheetEl.appendChild(fakeLink.el);
      document.addEventListener('mousemove', onMoveFn);
      document.addEventListener('mouseup', onMouseUp);
    };
    this.leftPointerEl.addEventListener('mousedown', onMouseDown('l'));
    this.rightPointerEl.addEventListener('mousedown', onMouseDown('r'));
  }
}

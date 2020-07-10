import { differenceInSeconds } from 'date-fns';
import { g, setStyle } from '../core/dom';
import { ClsPrefix } from '../core/constant';
import { GanttItem } from '../model/data';
import { DataStore, dpr, EVT } from '../core/data-store';
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
      attrs: {
        id: `egt_${item.id}`,
      },
      className: `${ClsPrefix}-item`,
      styles: {
        width: `${contentWidth}px`,
        top: `${
          index * store.config.lineHeight +
          (store.config.lineHeight - 1 - store.config.taskHeight) / 2
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
    this.bindHover();
  }

  bindProgressResizer() {
    const onMoveFn = (evt) => {
      let moveDistance = evt.movementX / dpr();
      const pgsWidth = this.progressEl.getBoundingClientRect().width;
      const contentWidth = this.contentEl.getBoundingClientRect().width;
      if (pgsWidth + moveDistance > contentWidth) {
        this.progressEl.style.width = `${contentWidth}px`;
        this.progressResizer.style.left = `${contentWidth}px`;
      } else if (pgsWidth + moveDistance < 0) {
        this.progressEl.style.width = '0px';
        this.progressResizer.style.left = '0px';
      } else {
        this.progressEl.style.width = addPx(
          this.progressEl.style.width,
          moveDistance,
        );
        this.progressResizer.style.left = addPx(
          this.progressResizer.style.left,
          moveDistance,
        );
      }
    };
    const onMouseUp = (evt) => {
      this.startScreenX = evt.screenX;
      document.removeEventListener('mousemove', onMoveFn);
      document.removeEventListener('mouseup', onMouseUp);
      this.item.progress = GetProgressByEl(this.contentEl, this.progressEl);
    };
    this.progressResizer.onmousedown = (evt) => {
      if (evt.detail !== 1) {
        return;
      }
      this.startScreenX = evt.screenX;
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
      const moveDistance = evt.movementX / dpr();
      this.el.style.left = addPx(this.el.style.left, moveDistance);
      this.el.style.width = addPx(this.el.style.width, -moveDistance);
      this.moveStart();
    };
    const onMouseUp = (evt) => {
      this.initWidth = this.el.getBoundingClientRect().width;
      this.startLeft = this.el.style.left;
      document.removeEventListener('mousemove', onMoveFn);
    };
    this.leftResizerEl.onmousedown = (evt) => {
      if (evt.detail !== 1) {
        return;
      }
      this.initWidth = this.el.getBoundingClientRect().width;
      document.addEventListener('mousemove', onMoveFn);
      document.addEventListener('mouseup', onMouseUp);
    };
  }

  bindRightResizer() {
    const onMoveFn = (evt) => {
      const moveDistance = evt.movementX / dpr();
      this.el.style.width = addPx(this.el.style.width, moveDistance);
      this.moveEnd();
    };
    const onMouseUp = (evt) => {
      this.initWidth = this.el.getBoundingClientRect().width;
      document.removeEventListener('mousemove', onMoveFn);
      document.removeEventListener('mouseup', onMouseUp);
    };
    this.rightResizerEl.onmousedown = (evt) => {
      if (evt.detail !== 1) {
        return;
      }
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
    let startFrom: 'l' | 'r';
    const onMoveFn = (evt) => {
      fakeElem.style.left = addPx(fakeElem.style.left, evt.movementX / dpr());
      fakeElem.style.top = addPx(fakeElem.style.top, evt.movementY / dpr());
      fakeLink.render();
    };
    const onMouseUp = (evt: MouseEvent) => {
      this.sheet.sheetEl.removeChild(fakeElem);
      this.sheet.sheetEl.removeChild(fakeLink.el);
      fakeLink = null;
      document.removeEventListener('mousemove', onMoveFn);
      document.removeEventListener('mouseup', onMouseUp);
      const allHitEls: HTMLElement[] =
        document.elementsFromPoint(evt.clientX, evt.clientY) || ([] as any);
      const hitTaskEl = allHitEls.find((i) =>
        i.classList.contains('easy-gantt-item'),
      );
      if (hitTaskEl) {
        const typing = startFrom === 'l' ? 'l2l' : 'r2l';
        const newLink = new Link(
          { fromEl: this.el, toEl: hitTaskEl, typing },
          this.store,
        );
        this.sheet.sheetEl.appendChild(newLink.el);
        const sourceId = this.el.id.replace('egt_', '');
        const targetId = hitTaskEl.id.replace('egt_', '');
        (
          this.sheet.taskConnMap[sourceId] ||
          (this.sheet.taskConnMap[sourceId] = [])
        ).push(newLink);
        (
          this.sheet.taskConnMap[targetId] ||
          (this.sheet.taskConnMap[targetId] = [])
        ).push(newLink);
      }
    };
    const onMouseDown = (pos: 'l' | 'r') => (evt: MouseEvent) => {
      const top = `${
        evt.clientY -
        this.sheet.sheetEl.getBoundingClientRect().top -
        this.store.config.taskHeight / 2
      }px`;
      const left = `${
        evt.clientX - this.sheet.sheetEl.getBoundingClientRect().left
      }px`;
      setStyle(fakeElem, {
        top,
        left,
      });
      this.sheet.sheetEl.appendChild(fakeElem);
      startFrom = pos;
      const typing = startFrom === 'l' ? 'l2l' : 'r2l';
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

  bindHover() {
    this.el.addEventListener('mouseenter', (evt) => {
      this.store.singletonContainer.taskTooltip
        .setTask(this.item)
        .show(evt.pageX, this.el.getBoundingClientRect().bottom + 5);
    });
    this.el.addEventListener('mouseleave', () => {
      this.store.singletonContainer.taskTooltip.hide();
    });
  }
}

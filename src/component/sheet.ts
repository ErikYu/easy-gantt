import { add, differenceInDays, format } from 'date-fns';
import { DataStore } from '../core/data-store';
import { appendChildren, g } from '../core/dom';
import { ClsPrefix } from '../core/constant';
import { Draggable } from './draggable';
import { addPx, flatten } from '../util/util';

export class Sheet {
  el: HTMLElement;
  headerEl: HTMLElement;
  sheetEl: HTMLElement;
  constructor(private store: DataStore) {
    this.el = g({
      tag: 'div',
      className: `${ClsPrefix}-sheet`,
      children: [
        (this.headerEl = g({
          tag: 'div',
          className: `${ClsPrefix}-sheet-header`,
        })),
        (this.sheetEl = g({
          tag: 'div',
          className: `${ClsPrefix}-sheet-content`,
        })),
      ],
    });
    this.load();
  }

  private load() {
    // eslint-disable-next-line no-plusplus
    for (
      let i = 0;
      i < differenceInDays(this.store.totalEnd, this.store.totalStart);
      i += 1
    ) {
      this.headerEl.appendChild(
        g({
          tag: 'div',
          className: `${ClsPrefix}-sheet-header-cell`,
          styles: {
            minWidth: `${this.store.unitWidth}px`,
            maxWidth: `${this.store.unitWidth}px`,
          },
          text: format(add(this.store.totalStart, { days: i }), 'MM-dd'),
        }),
      );
    }

    appendChildren(
      this.sheetEl,
      ...flatten(this.store.data).map((item, index) => {
        const d = new Draggable(item, index, this.store);
        d.startLeft = d.el.style.left;
        const onMoveFn = (evt) => {
          const moveDistance =
            evt.screenX + this.el.scrollLeft - d.startScreenX;
          d.el.style.left = addPx(d.startLeft, moveDistance);
          // sync startAt & endAt
          d.move();
        };
        const onMouseUp = (evt) => {
          d.startScreenX = evt.screenX + this.el.scrollLeft;
          d.startLeft = d.el.style.left;
          document.removeEventListener('mousemove', onMoveFn);
        };
        d.contentEl.onmousedown = (evt) => {
          if (evt.detail !== 1) {
            return;
          }
          d.startScreenX = evt.screenX + this.el.scrollLeft;
          document.addEventListener('mousemove', onMoveFn);
          document.addEventListener('mouseup', onMouseUp);
        };
        return d.el;
      }),
    );
  }
}

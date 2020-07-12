import { add, differenceInDays, format } from 'date-fns';
import { DataStore, EVT, reloadLinkFn } from '../core/data-store';
import { appendChildren, g, setStyle } from '../core/dom';
import { ClsPrefix } from '../core/constant';
import { Draggable } from './draggable';
import { addPx, flatten } from '../util/util';
import { Link } from './link';

export class Sheet {
  el: HTMLElement;
  headerEl: HTMLElement;
  sheetEl: HTMLElement;
  taskMap: Record<string, HTMLElement> = {};
  taskConnMap: Record<string, Link[]> = {};
  constructor(private store: DataStore) {
    this.el = g({
      tag: 'div',
      className: `${ClsPrefix}-sheet`,
      styles: {
        width: `${this.store.config.containerWidth - 500 - 17}px`,
      },
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
    this.store.singletonContainer.sheet = this;
  }

  private load() {
    this.sheetEl.appendChild(
      g({
        tag: 'div',
        className: `${ClsPrefix}-sheet-overlayer`,
        styles: {
          width: `${this.store.contentHWidth}px`,
          height: `${this.store.contentVHeight}px`,
        },
      }),
    );
    this.renderHeader();
    this.renderTasks();
    this.renderLink();
    this.store.on<reloadLinkFn>(EVT.reloadLink, (itemId) => {
      (this.taskConnMap[itemId] || []).forEach((i: Link) => i.render());
    });
  }

  private renderHeader() {
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
  }

  private renderTasks() {
    setStyle(this.sheetEl, {
      height: `${this.store.config.containerHeight - 40}px`,
    });
    appendChildren(
      this.sheetEl,
      ...flatten(this.store.data).map((item, index) => {
        const d = new Draggable(item, index, this.store, this);
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
        this.taskMap[item.id] = d.el;
        return d.el;
      }),
    );
  }

  private renderLink() {
    // add connector
    setTimeout(() => {
      appendChildren(
        this.sheetEl,
        ...this.store.links.map((l) => {
          const inst = new Link(
            {
              fromEl: this.taskMap[l.source],
              toEl: this.taskMap[l.target],
              typing: l.typing,
            },
            this.store,
          );
          (
            this.taskConnMap[l.source] || (this.taskConnMap[l.source] = [])
          ).push(inst);
          (
            this.taskConnMap[l.target] || (this.taskConnMap[l.target] = [])
          ).push(inst);
          return inst.el;
        }),
      );
    });
  }
}

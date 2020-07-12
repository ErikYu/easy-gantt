import { DataStore } from '../core/data-store';
import { g } from '../core/dom';
import { ClsPrefix } from '../core/constant';

export class Scrollbar {
  el: HTMLElement;
  private scrollEl: HTMLElement;
  constructor(private isVertival: boolean, private store: DataStore) {
    if (isVertival) {
      this.el = g({
        tag: 'div',
        className: `${ClsPrefix}-scrollbar vertical`,
        styles: {
          height: `${store.config.containerHeight}px`,
        },
        children: [
          (this.scrollEl = g({
            tag: 'div',
            className: 'scroll-el',
            styles: {
              top: '40px',
              width: '17px',
              height: 'calc(100% - 40px)',
            },
            children: [
              g({
                tag: 'div',
                styles: {
                  height: `${this.store.contentVHeight}px`,
                },
              }),
            ],
          })),
        ],
      });
      this.scrollEl.addEventListener('scroll', (evt: MouseEvent) => {
        const { scrollTop } = evt.target as HTMLElement;
        this.store.singletonContainer.sheet.sheetEl.scrollTo({
          top: scrollTop,
        });
        this.store.singletonContainer.tree.contentEl.scrollTo({
          top: scrollTop,
        });
      });
    } else {
      this.el = g({
        tag: 'div',
        className: `${ClsPrefix}-scrollbar horizontal`,
        children: [
          (this.scrollEl = g({
            tag: 'div',
            className: 'scroll-el',
            styles: {
              left: '500px',
              height: '17px',
              width: 'calc(100% - 500px)',
            },
            children: [
              g({
                tag: 'div',
                styles: {
                  width: `${this.store.contentHWidth}px`,
                  height: '1px',
                },
              }),
            ],
          })),
        ],
      });
      this.scrollEl.addEventListener('scroll', (evt: MouseEvent) => {
        const { scrollLeft } = evt.target as HTMLElement;
        this.store.singletonContainer.sheet.sheetEl.scrollTo({
          left: scrollLeft,
        });
        this.store.singletonContainer.sheet.headerEl.scrollTo({
          left: scrollLeft,
        });
      });
    }
  }
}

import { ClsPrefix } from '../core/constant';
import { g, setStyle } from '../core/dom';
import { DataStore } from '../core/data-store';
import { GanttItem } from '../model/data';
import { format } from 'date-fns';

export class Tree {
  el: HTMLElement;
  headerEl: HTMLElement;
  contentEl: HTMLElement;

  constructor(private store: DataStore) {
    this.el = g({
      tag: 'div',
      className: `${ClsPrefix}-tree`,
      children: [
        (this.headerEl = g({
          tag: 'div',
          className: `${ClsPrefix}-tree-header`,
        })),
        (this.contentEl = g({
          tag: 'div',
          className: `${ClsPrefix}-tree-content`,
        })),
      ],
    });
    store.on('reload-tree', () => {
      this.loadTree();
    });
    this.loadTree();
    this.store.singletonContainer.tree = this;
  }

  loadTree() {
    setStyle(this.contentEl, {
      height: `${this.store.config.containerHeight - 40}px`,
    });
    this.headerEl.innerHTML = '';
    this.contentEl.innerHTML = '';
    this.headerEl.appendChild(g({ tag: 'div', text: 'Text' }));
    this.headerEl.appendChild(g({ tag: 'div', text: 'Start' }));
    this.headerEl.appendChild(g({ tag: 'div', text: 'End' }));
    this.renderTreeLine(this.store.data);
    // this.contentEl.append(g({
    //   tag: 'div',
    //   styles: {
    //     width: '100%',
    //     height: '16px',
    //   }
    // }))
  }

  renderTreeLine(ds: GanttItem[]) {
    for (const d of ds) {
      this.contentEl.appendChild(
        g({
          tag: 'div',
          className: `${ClsPrefix}-tree-content-line`,
          children: [
            g({
              tag: 'span',
              text: d.text,
            }),
            g({
              tag: 'span',
              text: format(d.startAt, 'MM-dd HH:mm'),
            }),
            g({
              tag: 'span',
              text: format(d.endAt, 'MM-dd HH:mm'),
            }),
          ],
        }),
      );
      if (Array.isArray(d.children) && d.children.length > 0) {
        this.renderTreeLine(d.children);
      }
    }
  }
}

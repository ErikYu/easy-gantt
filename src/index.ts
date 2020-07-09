import { GanttItem } from './model/data';
import { Tree } from './component/tree';
import { DataStore } from './core/data-store';
import './index.less';
import { Sheet } from './component/sheet';
import { g } from './core/dom';
import { ClsPrefix } from './core/constant';
import { TaskTooltip } from './component/task-tooltip';

class EasyGantt {
  el: HTMLElement;
  treeEl: Tree;
  sheetEl: Sheet;
  globalStore: DataStore;

  constructor(selector: HTMLElement, data) {
    this.el = g({ tag: 'div', className: ClsPrefix });
    selector.appendChild(this.el);
    this.globalStore = new DataStore(data);
    this.treeEl = new Tree(this.globalStore);
    this.sheetEl = new Sheet(this.globalStore);
    this.el.appendChild((new TaskTooltip(this.globalStore)).el);
    this.el.appendChild(this.treeEl.el);
    this.el.appendChild(this.sheetEl.el);
  }

  loadData(data: GanttItem[]) {
    this.globalStore.data = data;
  }
}
(window as any).easy_gantt = (selector, data) => new EasyGantt(selector, data);

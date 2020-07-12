import { GanttItem } from './model/data';
import { Tree } from './component/tree';
import { DataStore } from './core/data-store';
import './index.less';
import { Sheet } from './component/sheet';
import { g, appendChildren } from './core/dom';
import { ClsPrefix } from './core/constant';
import { TaskTooltip } from './component/task-tooltip';
import { Scrollbar } from './component/scrollbar';

class EasyGantt {
  el: HTMLElement;
  treeEl: Tree;
  sheetEl: Sheet;
  globalStore: DataStore;

  constructor(selector: HTMLElement, data) {
    this.el = g({ tag: 'div', className: `${ClsPrefix}` });
    selector.appendChild(this.el);
    this.globalStore = new DataStore(data);
    this.globalStore.setContainer(selector);
    this.treeEl = new Tree(this.globalStore);
    this.sheetEl = new Sheet(this.globalStore);
    this.el.appendChild(new TaskTooltip(this.globalStore).el);
    this.el.appendChild(this.treeEl.el);
    this.el.appendChild(this.sheetEl.el);

    // check if need vertival scroll and horizontal scrollbar
    console.log(this.globalStore.config.containerHeight);
    console.log(this.sheetEl.sheetEl.getBoundingClientRect().height);

    appendChildren(this.el, new Scrollbar(true, this.globalStore).el);

    selector.appendChild(new Scrollbar(false, this.globalStore).el);
  }

  loadData(data: GanttItem[]) {
    this.globalStore.data = data;
  }
}
(window as any).easy_gantt = (selector, data) => new EasyGantt(selector, data);

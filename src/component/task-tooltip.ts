import { DataStore } from '../core/data-store';
import { appendChildren, g, setStyle } from '../core/dom';
import { ClsPrefix } from '../core/constant';
import { GanttItem } from '../model/data';
import { format } from 'date-fns';

const defaultToolTipTpl = (task: GanttItem): string => {
  return `
  <div class="${ClsPrefix}-tooltip-content">
    <div><strong>Task: </strong>${task.text}</div>
    <div><strong>Start: </strong>${format(
      task.startAt,
      'yyyy/MM/dd HH:mm:ss',
    )}</div>
    <div><strong>End: </strong>${format(
      task.endAt,
      'yyyy/MM/dd HH:mm:ss',
    )}</div>
    <div><strong>Progress: </strong>${((task.progress || 0) * 100).toFixed(
      0,
    )}%</div>
  </div> 
  `;
};

export class TaskTooltip {
  el: HTMLElement;
  constructor(private store: DataStore) {
    this.el = g({
      tag: 'div',
      className: `${ClsPrefix}-tooltip`,
      styles: {},
    });
    this.store.singletonContainer.taskTooltip = this;
  }

  setTask(task: GanttItem) {
    console.log(task);
    // gen child html
    if (typeof this.store.config.taskTooltipTemplate === 'function') {
      this.el.innerHTML = this.store.config.taskTooltipTemplate(task);
    } else {
      this.el.innerHTML = defaultToolTipTpl(task);
    }
    return this;
  }

  show(left: number, top: number) {
    setStyle(this.el, {
      display: 'block',
      left: `${left}px`,
      top: `${top}px`,
    });
  }

  hide() {
    setStyle(this.el, {
      display: 'none',
    });
  }
}

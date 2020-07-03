import { addSeconds } from 'date-fns';
import { GanttFlatItem, GanttItem } from '../model/data';

export function flatten(data: GanttItem[]): GanttItem[] {
  const res = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const item of data) {
    res.push(item);
    // eslint-disable-next-line no-param-reassign
    if (Array.isArray(item.children) && item.children.length > 0) {
      res.push(...flatten(item.children));
    }
  }
  return res;
}

export function addPx(val: any, added: number): string {
  if (typeof val === 'string' && val.endsWith('px')) {
    return `${+val.replace('px', '') + added}px`;
  }
  return `${+val + added}px`;
}

export function px2Int(data: string): number {
  return +data.replace('px', '');
}

export function getStartAtByEl(
  rootStart: Date,
  unitWidth: number,
  el: HTMLElement,
): Date {
  const { left } = el.style;
  return addSeconds(rootStart, (px2Int(left) / unitWidth) * 86400);
}

export function getEndAtByEl(
  rootStart: Date,
  unitWidth: number,
  el: HTMLElement,
): Date {
  const { left } = el.style;
  return addSeconds(
    rootStart,
    ((px2Int(left) + el.getBoundingClientRect().width) / unitWidth) * 86400,
  );
}

export function GetStartAtEndAtByEl(
  rootStart: Date,
  unitWidth: number,
  el: HTMLElement,
): { startAt: Date; endAt: Date } {
  return {
    startAt: getStartAtByEl(rootStart, unitWidth, el),
    endAt: getEndAtByEl(rootStart, unitWidth, el),
  };
}

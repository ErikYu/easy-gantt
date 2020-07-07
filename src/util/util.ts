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

function convArgs2Num(a: string | number, b: string | number) {
  let leftVal: number;
  let rightVal: number;
  if (typeof a === 'string' && a.endsWith('px')) {
    leftVal = +a.replace('px', '');
  } else {
    leftVal = +a;
  }
  if (typeof b === 'string' && b.endsWith('px')) {
    rightVal = +b.replace('px', '');
  } else {
    rightVal = +b;
  }
  return {
    leftVal,
    rightVal,
  };
}

export function addPx(val: string | number, added: string | number): string {
  const { leftVal, rightVal } = convArgs2Num(val, added);
  return `${leftVal + rightVal}px`;
}

export function differencePx(a: number | string, b: number | string): number {
  const { leftVal, rightVal } = convArgs2Num(a, b);
  return leftVal - rightVal;
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

export function GetProgressByEl(
  contentEl: HTMLElement,
  progressEl: HTMLElement,
): number {
  return (
    progressEl.getBoundingClientRect().width /
    contentEl.getBoundingClientRect().width
  );
}

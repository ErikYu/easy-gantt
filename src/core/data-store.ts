import { TaskTooltip } from '../component/task-tooltip';

export const EVT = {
  reloadLink: 'reloadLink',
};

export type reloadLinkFn = (itemId: string) => void;

function getOperationSys() {
  let OS = '';
  let OSArray: any = {};
  let UserAgent = navigator.userAgent.toLowerCase();
  OSArray.Windows =
    navigator.platform == 'Win32' || navigator.platform == 'Windows';
  OSArray.Mac =
    navigator.platform == 'Mac68K' ||
    navigator.platform == 'MacPPC' ||
    navigator.platform == 'Macintosh' ||
    navigator.platform == 'MacIntel';
  OSArray.iphone = UserAgent.indexOf('iPhone') > -1;
  OSArray.ipod = UserAgent.indexOf('iPod') > -1;
  OSArray.ipad = UserAgent.indexOf('iPad') > -1;
  OSArray.Android = UserAgent.indexOf('Android') > -1;
  for (let i in OSArray) {
    if (OSArray[i]) {
      OS = i;
    }
  }
  return OS;
}

export function dpr() {
  if (getOperationSys() === 'Mac') {
    return 1;
  }
  return window.devicePixelRatio || 1;
}

export class DataStore {
  config = {
    linkStartMin: 30,
    linkHoverThick: 10,
    linkThick: 2,
    arrowSize: 6,
    lineHeight: 48,
    taskHeight: 40,
    taskTooltipTemplate: null,
  };

  singletonContainer: {
    taskTooltip?: TaskTooltip;
  } = {};

  totalStart: Date = new Date('2020/04/30 00:00:00');
  totalEnd: Date = new Date('2020/05/10 00:00:00');
  unitWidth = 120;
  data;
  links = [];
  private eventList = {};
  constructor(val) {
    this.data = val.tasks;
    this.links = val.links;
  }

  on<T>(what, func: T) {
    (this.eventList[what] || (this.eventList[what] = [])).push(func);
    return this;
  }

  emit(what, ...args: any) {
    (this.eventList[what] || []).forEach((fn) => {
      fn(...args);
    });
  }
}

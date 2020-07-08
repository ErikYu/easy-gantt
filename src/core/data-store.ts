export const EVT = {
  reloadLink: 'reloadLink',
};

export type reloadLinkFn = (itemId: string) => void;

export class DataStore {
  config = {
    linkStartMin: 30,
    linkThick: 2,
    arrowSize: 6,
  };

  totalStart: Date = new Date('2020/04/30 00:00:00');
  totalEnd: Date = new Date('2020/05/10 00:00:00');
  unitWidth = 120;
  unitHeight = 48;
  barHeight = 40;
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

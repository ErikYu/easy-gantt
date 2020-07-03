export class DataStore {
  totalStart: Date = new Date('2020-04-30 00:00:00');
  totalEnd: Date = new Date('2020-05-10 00:00:00');
  unitWidth = 120;
  unitHeight = 25;
  barHeight = 20;
  data;
  private eventList = {};
  constructor(val) {
    this.data = val;
  }

  on(what, func) {
    (this.eventList[what] || (this.eventList[what] = [])).push(func);
    return this;
  }

  emit(what) {
    (this.eventList[what] || []).forEach((fn) => {
      fn(this.data);
    });
  }
}

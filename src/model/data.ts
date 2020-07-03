export interface GanttItem {
  id: string;
  text: string;
  progress?: number;
  startAt: Date;
  endAt: Date;
  children: GanttItem[];
}

export interface GanttFlatItem {
  id: string;
  text: string;
  progress?: number;
  startAt: Date;
  endAt: Date;
  index: number;
}

export interface GanttItemLink {
  source: string;
  target: string;
}

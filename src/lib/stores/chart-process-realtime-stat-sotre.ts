import { readable } from "svelte/store";
import { processRealtimeStatObservable } from "../http-interface/server-send-event";
import type {
  FormattedProcessRealtimeStat,
  FormattedProcessStat,
} from "../http-interface/server-send-event";
import { filter } from "rxjs";
import { visibleStatusStore } from "./document-status-store";
import { focusStatusStore } from "./chart-realtime-stat-sotre";
import { typeIsArray, typeIsNumber, typeIsString } from "@siaikin/utils";

export class ChartProcessRealtimeStat implements FormattedProcessRealtimeStat {
  processes: Array<FormattedProcessStat> = [];

  sortField = "";
  sortOrder = false;
  max = 0;
  cpuUsage = 0;
  memoryUsage = 0;
  total = 0;

  update({
    processes,
    sortField,
    max,
    memoryUsage,
    cpuUsage,
    total,
    sortOrder,
  }: FormattedProcessRealtimeStat) {
    if (typeIsArray(processes)) this.processes = processes;
    if (typeIsString(sortField)) this.sortField = sortField;
    if (typeIsNumber(max)) this.max = max;
    if (typeIsNumber(memoryUsage)) this.memoryUsage = memoryUsage;
    if (typeIsNumber(cpuUsage)) this.cpuUsage = cpuUsage;
    if (typeIsNumber(total)) this.total = total;
    if (typeIsNumber(sortOrder)) this.sortOrder = sortOrder;
  }
}

const chartProcessRealtimeStat = new ChartProcessRealtimeStat();

export const store = readable<ChartProcessRealtimeStat>(chartProcessRealtimeStat, (set) => {
  let focusStatus = false;
  focusStatusStore.subscribe((status) => (focusStatus = status));
  let visibleStatus = false;
  visibleStatusStore.subscribe((status) => (visibleStatus = status));

  const subscription = processRealtimeStatObservable
    .pipe(filter(() => !focusStatus && visibleStatus))
    .subscribe((stat) => {
      chartProcessRealtimeStat.update(stat);
      set(chartProcessRealtimeStat);
    });

  return () => subscription.unsubscribe();
});

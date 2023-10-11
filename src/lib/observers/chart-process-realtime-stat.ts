import { processRealtimeStatObservable } from "../http-interface/server-send-event";
import type {
  FormattedProcessRealtimeStat,
  FormattedProcessStat
} from "../http-interface/server-send-event";
import { BehaviorSubject, combineLatest, Observable, Subscription } from "rxjs";
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
    sortOrder
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

export function observe(
  ...observables: Array<Observable<boolean>>
): [BehaviorSubject<ChartProcessRealtimeStat>, () => void] {
  const subscriptions: Array<Subscription> = [];

  const chartProcessRealtimeStat = new ChartProcessRealtimeStat();

  const subject = new BehaviorSubject(chartProcessRealtimeStat);

  let isBuffer = false;
  subscriptions.push(
    combineLatest(observables).subscribe(
      (statusList) => (isBuffer = !statusList.every((status) => status))
    )
  );

  let statList: Array<FormattedProcessRealtimeStat> = [];
  const subscription = processRealtimeStatObservable.subscribe((stat) => {
    statList.push(stat);
    if (statList.length > 30) statList.shift();

    if (isBuffer) return;

    for (let i = 0; i < statList.length; i++) {
      chartProcessRealtimeStat.update(statList[i]);
    }
    statList = [];
    subject.next(chartProcessRealtimeStat);
  });
  subscriptions.push(subscription);

  return [subject, () => subscriptions.forEach((subscription) => subscription.unsubscribe())];
}

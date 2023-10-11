import type { StatsData } from "../http-interface";
import { getStats, getSummaries, SummariesViewModel } from "../http-interface";
import { BehaviorSubject, Subject, tap, throttleTime } from "rxjs";
import { typeIsString } from "@siaikin/utils";

export function observe() {
  const emptyStats: StatsData = {
    branches: [],
    daily_average: 0,
    days_including_holidays: 0,
    editors: [],
    end: "",
    languages: [],
    machines: [],
    operating_systems: [],
    projects: [],
    start: "",
    total_seconds: 0
  };

  const subject = new BehaviorSubject(emptyStats);

  const refreshSubject = new Subject<Parameters<typeof getStats>>();
  const subscription = refreshSubject
    .pipe(
      tap(() => subject.next(emptyStats)),
      throttleTime(250)
    )
    .subscribe(async (params) => await refreshAndWait(...params));
  const refresh = (...args: Parameters<typeof getStats>) => refreshSubject.next(args);

  const refreshAndWait = async (...args: Parameters<typeof getStats>) => {
    const [range, params] = args;

    const stats = await getStats(range, params);
    subject.next(stats);
  };

  return [subject, { refresh, refreshAndWait }, () => subscription.unsubscribe()] as const;
}

const [subject, { refresh, refreshAndWait }] = observe();

export const statsObservable = subject.asObservable();

export function stats() {
  return subject.value;
}

export { refresh, refreshAndWait };

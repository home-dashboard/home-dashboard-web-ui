import { getSummaries } from "../http-interface";
import type { SummariesViewModel } from "../http-interface";
import { BehaviorSubject, Subject, tap, throttleTime } from "rxjs";
import { typeIsString } from "@siaikin/utils";

export function observe() {
  const emptySummaries: SummariesViewModel = {
    data: [
      {
        branches: [],
        categories: [],
        dependencies: [],
        editors: [],
        grand_total: {
          digital: "",
          hours: 0,
          minutes: 0,
          text: "",
          total_seconds: 0
        },
        languages: [],
        machines: [],
        operating_systems: [],
        projects: [],
        range: {
          date: "",
          end: "",
          start: "",
          text: "",
          timezone: ""
        }
      }
    ],
    end: "",
    start: ""
  };

  const subject = new BehaviorSubject(emptySummaries);

  const refreshSubject = new Subject<Parameters<typeof getSummaries>>();
  const subscription = refreshSubject
    .pipe(
      tap(() => subject.next(emptySummaries)),
      throttleTime(250)
    )
    .subscribe(async (params) => await refreshAndWait(...params));

  const refreshAndWait = async (...args: Parameters<typeof getSummaries>) => {
    const [range, params] = args;

    let stats: SummariesViewModel;
    if (typeIsString(range)) {
      stats = await getSummaries(range, params);
    } else {
      stats = await getSummaries({ start: range.start, end: range.end }, params);
    }

    subject.next(stats);
  };

  const refresh = (...args: Parameters<typeof getSummaries>) => refreshSubject.next(args);

  return [subject, { refresh, refreshAndWait }, () => subscription.unsubscribe()] as const;
}

const [subject, { refresh, refreshAndWait }] = observe();

export const summariesObservable = subject.asObservable();

export function summaries() {
  return subject.value;
}

export { refresh, refreshAndWait };

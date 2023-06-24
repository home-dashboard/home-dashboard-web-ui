import { readable } from "svelte/store";
import type { Readable } from "svelte/store";
import { getSummaries } from "../http-interface";
import type { SummariesViewModel } from "../http-interface";
import { Subject, tap, throttleTime } from "rxjs";
import { typeIsString } from "@siaikin/utils";

const refreshSubject = new Subject<Parameters<typeof getSummaries>>();

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
        total_seconds: 0,
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
        timezone: "",
      },
    },
  ],
  end: "",
  start: "",
};
export const summariesStore: Readable<SummariesViewModel> = readable<SummariesViewModel>(
  emptySummaries,
  (set) => {
    const subscription = refreshSubject
      .pipe(
        tap(() => set(emptySummaries)),
        throttleTime(250)
      )
      .subscribe(async ([range, params]) => {
        let stats: SummariesViewModel;
        if (typeIsString(range)) {
          stats = await getSummaries(range, params);
        } else {
          stats = await getSummaries({ start: range.start, end: range.end }, params);
        }

        set(stats);
      });

    return () => subscription.unsubscribe();
  }
);

export function summariesStoreRefresh(...params: Parameters<typeof getSummaries>) {
  refreshSubject.next(params);
}

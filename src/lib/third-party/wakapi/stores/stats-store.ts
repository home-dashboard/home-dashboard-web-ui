import { readable } from "svelte/store";
import type { Readable } from "svelte/store";
import type { StatsData, StatsRange, StatsQueryParams } from "../http-interface";
import { getStats } from "../http-interface";
import { Subject, tap, throttleTime } from "rxjs";

const refreshSubject = new Subject<{ range: StatsRange; params: Partial<StatsQueryParams> }>();

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
  total_seconds: 0,
};
export const statsStore: Readable<StatsData> = readable<StatsData>(emptyStats, (set) => {
  const subscription = refreshSubject
    .pipe(
      tap(() => set(emptyStats)),
      throttleTime(250)
    )
    .subscribe(async ({ range, params }) => {
      const stats = await getStats(range, params);
      set(stats);
    });

  return () => subscription.unsubscribe();
});

export function statsStoreRefresh(range: StatsRange, params: Partial<StatsQueryParams> = {}) {
  refreshSubject.next({ range, params });
}

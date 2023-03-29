import { httpClient } from "../../../http-interface";

export async function getStats(
  range: StatsRange,
  params: Partial<StatsQueryParams>
): Promise<StatsData> {
  const result = await httpClient.get<Stats>({
    url: `wakapi/stats/${range}`,
    queryParams: params,
  });

  return result.data;
}

export async function getProjects(): Promise<Array<Project>> {
  const result = await httpClient.get<Projects>({ url: "wakapi/projects" });
  return result.data;
}

export interface StatsQueryParams {
  project: string;
  language: string;
  editor: string;
  branch: string;
  machine: string;
  operating_system: string;
}

export enum StatsRange {
  TODAY = "today",
  YESTERDAY = "yesterday",
  WEEK = "week",
  MONTH = "month",
  YEAR = "year",
  "7_DAYS" = "7_days",
  LAST_7_DAYS = "last_7_days",
  "30_DAYS" = "30_days",
  LAST_30_DAYS = "last_30_days",
  "6_MONTHS" = "6_months",
  LAST_6_MONTHS = "last_6_months",
  "12_MONTHS" = "12_months",
  LAST_12_MONTHS = "last_12_months",
  LAST_YEAR = "last_year",
  ALL_TIME = "all_time",
}
/**
 * Wakapi 统计数据
 */
export interface Stats {
  data: StatsData;
}

export interface StatsData {
  branches: Array<SummariesEntry>;
  daily_average: number;
  days_including_holidays: number;
  editors: Array<SummariesEntry>;
  end: string;
  languages: Array<SummariesEntry>;
  machines: Array<SummariesEntry>;
  operating_systems: Array<SummariesEntry>;
  projects: Array<SummariesEntry>;
  start: string;
  total_seconds: number;
  // user_id: string;
  // username: string;
}

export interface SummariesEntry {
  digital: string;
  hours: number;
  minutes: number;
  name: string;
  percent: number;
  text: string;
  total_seconds: number;
  seconds: number;
}

/**
 * Wakapi 项目数据
 */
export interface Projects {
  data: Array<Project>;
}

export interface Project {
  id: string;
  name: string;
  repository: string;
}

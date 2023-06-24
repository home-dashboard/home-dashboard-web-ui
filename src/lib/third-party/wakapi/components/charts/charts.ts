import { Pie, Legend } from "@carbon/charts/interfaces/events";

/**
 * Wakapi 统计数据图表类型.
 */
export enum ChartType {
  PROJECTS = "projects",
  LANGUAGES = "languages",
  EDITORS = "editors",
  OPERATING_SYSTEMS = "operating_systems",
  MACHINES = "machines",
  BRANCHES = "branches",
}

export enum ChartTagPosition {
  TOP_LEFT = "top_left",
  TOP_RIGHT = "top_right",
  BOTTOM_LEFT = "bottom_left",
  BOTTOM_RIGHT = "bottom_right",
}

export const Events = {
  Pie: Pie,
  Legend: Legend,
};

export type EventData = { event: Event; element: HTMLElement; datum: unknown };

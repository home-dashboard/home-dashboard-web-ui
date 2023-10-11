import { PieChartOptions, LegendOptions, Alignments, PieChart, ChartConfig } from "@carbon/charts";
import BaseStatChart from "./base-stat-chart";
import type { StatsData, SummariesEntry } from "../../http-interface";
import { ChartType, Events } from "./charts";
import { mergeProps, onCleanup, splitProps, VoidProps } from "solid-js";
import { formatDuration } from "../../../../utils/format-duration";
import { clone, deepMerge } from "@siaikin/utils";

export interface StatChartProps {
  class: string;
  /**
   * 表格标题, 默认为空.
   */
  title: string;
  /**
   * 图表类型, 默认为 {@link ChartType.PROJECTS}.
   */
  type: ChartType;
  /**
   * 最大显示条数, 默认为 5. (小于等于 0 表示不限制)
   */
  max: number;
  /**
   * 图例选项, 默认不显示.
   */
  legend: LegendOptions;
  /**
   * 饼图选项, 默认不显示标签.
   */
  pie: PieChartOptions["pie"];
  /**
   * 饼图点击事件.
   * @param event
   */
  onSliceClick: (event: CustomEvent) => void;
}

export default function StatChart(props: VoidProps<Partial<StatChartProps>>) {
  const defaultProps: StatChartProps = {
    class: "",
    title: "",
    type: ChartType.PROJECTS,
    max: 5,
    legend: { enabled: false },
    pie: {
      labels: { enabled: false, formatter: (item) => item.data.group },
      alignment: Alignments.CENTER
    },
    onSliceClick: () => {}
  };

  const [localProps, othersProps] = splitProps(props, [
    "title",
    "type",
    "max",
    "legend",
    "pie",
    "onSliceClick"
  ]);
  const mergedProps = mergeProps(defaultProps, localProps);

  function getChartProps(stat: StatsData) {
    const statEntries: Array<SummariesEntry> = stat[mergedProps.type] ?? [];
    const data = [];

    // 限制最大显示条数, max 小于等于 0 表示不限制.
    const maxCount =
      mergedProps.max <= 0 ? statEntries.length : Math.min(statEntries.length, mergedProps.max);
    for (let i = 0; i < maxCount; i++) {
      const entry = statEntries[i];
      data.push({
        group: entry.name,
        value: entry.total_seconds
      });
    }

    // 被 max 限制条数时, 将多余的条目合并为 "Other".
    if (statEntries.length > maxCount) {
      let other = 0;
      for (let i = maxCount; i < statEntries.length; i++) {
        const entry = statEntries[i];
        other += entry.total_seconds;
      }
      data.push({ group: "Other", value: other });
    }

    const options: PieChartOptions = {
      title: mergedProps.title,
      legend: mergedProps.legend,
      pie: deepMerge(clone(defaultProps.pie), mergedProps.pie),
      resizable: true,
      toolbar: { enabled: false },
      tooltip: {
        valueFormatter: (value) => formatDuration(value),
        truncation: {
          numCharacter: 64
        }
      },
      data: {
        loading: data.length <= 0
      }
    };

    return {
      data,
      options
    };
  }

  const instanceFunc = (element: HTMLDivElement, config: ChartConfig<PieChartOptions>) => {
    const chart = new PieChart(element, config);

    chart.services.events.addEventListener(Events.Pie.SLICE_CLICK, mergedProps.onSliceClick);
    onCleanup(() =>
      chart.services.events.removeEventListener(Events.Pie.SLICE_CLICK, mergedProps.onSliceClick)
    );

    return chart;
  };

  return <BaseStatChart {...othersProps} config={getChartProps} instance={instanceFunc} />;
}

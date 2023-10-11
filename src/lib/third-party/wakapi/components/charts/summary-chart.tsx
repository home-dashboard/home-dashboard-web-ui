import {
  Alignments,
  ChartConfig,
  LegendOptions,
  PieChartOptions,
  ScaleTypes,
  StackedBarChart,
  StackedBarChartOptions
} from "@carbon/charts";
import zhCNLocaleObject from "date-fns/locale/zh-CN";
import BaseSummaryChart from "./base-summary-chart";
import type { SummariesData, SummariesEntry, SummariesViewModel } from "../../http-interface";
import { ChartType, Events } from "./charts";
import {
  formatDuration,
  getDurationMaxUnit,
  getDurationUnitValue
} from "../../../../utils/format-duration";
import { DefaultFormatter } from "../../../../utils/intl-utils";
import { createSignal, JSX, mergeProps, splitProps, VoidProps } from "solid-js";

export interface SummaryChartProps {
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

export default function SummaryChart(
  props: VoidProps<Partial<SummaryChartProps> & JSX.HTMLAttributes<HTMLDivElement>>
) {
  const formatter: Intl.DateTimeFormat = DefaultFormatter;

  const defaultProps: SummaryChartProps = {
    title: "",
    type: ChartType.PROJECTS,
    max: 5,
    legend: { enabled: true },
    pie: {
      labels: { enabled: false, formatter: (item) => item.data.group },
      alignment: Alignments.CENTER
    },
    onSliceClick: () => {}
  };

  const [localProps, othersProps] = splitProps(props, ["title", "type", "max", "legend", "pie"]);
  const mergedProps = mergeProps(defaultProps, localProps);

  function getChartProps({ data }: SummariesViewModel) {
    // 根据 activeDataGroups 过滤数据.
    const _data = [];
    const _activeDataGroups = activeDataGroups();
    const _isAllActive = _activeDataGroups.size <= 0;
    // 一段时间内每一天的最大秒数, 用于计算 Y 轴的最大值.
    let maxSecondsOfDay = 0;

    for (let i = data.length; i--; ) {
      const entry: SummariesData = data[i];
      const range = entry["range"];

      /**
       * branches 仅在查询条件为 {@link ChartType.PROJECTS} 时非空, 需要空值处理.
       */
      const entries: Array<SummariesEntry> = entry[mergedProps.type] ?? [];
      for (let j = 0; j < entries.length; j++) {
        const { name, total_seconds } = entries[j];

        _data.push({ group: name, value: total_seconds, date: new Date(range.start) });

        // 计算 value 的最大值.
        if (_isAllActive || _activeDataGroups.has(name)) {
          if (total_seconds > maxSecondsOfDay) maxSecondsOfDay = total_seconds;
        }
      }
    }

    const maxUnit = getDurationMaxUnit(maxSecondsOfDay);

    const options: StackedBarChartOptions = {
      title: mergedProps.title,
      legend: mergedProps.legend,
      resizable: true,
      toolbar: { enabled: false },
      tooltip: {
        valueFormatter: (value, type) => {
          switch (type) {
            case "x-value":
              return formatter.format(new Date(value));
            case "y-value":
              return formatDuration(value);
            case "Group":
              return value;
            default:
              return formatDuration(value);
          }
        },
        truncation: {
          numCharacter: 64
        }
      },
      axes: {
        left: {
          stacked: true,
          mapsTo: "value",
          scaleType: ScaleTypes.LINEAR,
          ticks: {
            formatter: (tick) => getDurationUnitValue(tick as number, maxUnit).toString()
          },
          title: `${maxUnit}`
        },
        bottom: {
          stacked: true,
          scaleType: ScaleTypes.TIME
        }
      },
      timeScale: {
        localeObject: zhCNLocaleObject
      },
      data: {
        loading: _data.length <= 0,
        selectedGroups: Array.from(activeDataGroups())
      }
    };

    return {
      data: _data,
      options
    };
  }

  const [activeDataGroups, setActiveDataGroups] = createSignal(new Set<string>());

  const instanceFunc = (element: HTMLDivElement, config: ChartConfig<PieChartOptions>) => {
    const chart = new StackedBarChart(element, config);

    chart.services.events.addEventListener(Events.Legend.ITEMS_UPDATE, (event: CustomEvent) => {
      const dataGroups = event.detail.dataGroups as Array<{ name: string; status: 0 | 1 }>;
      const activeDataGroupSet = new Set<string>();
      for (let i = dataGroups.length; i--; ) {
        const { name, status } = dataGroups[i];
        if (status === 1) activeDataGroupSet.add(name);
      }
      setActiveDataGroups(activeDataGroupSet);
    });

    return chart;
  };

  return <BaseSummaryChart {...othersProps} config={getChartProps} instance={instanceFunc} />;
}

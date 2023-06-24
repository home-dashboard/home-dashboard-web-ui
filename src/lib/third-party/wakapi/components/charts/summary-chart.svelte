<script lang="ts">
  import { BarChartStacked } from "@carbon/charts-svelte";
  import { interfaces } from "@carbon/charts";
  import zhCNLocaleObject from "date-fns/locale/zh-CN";
  import BaseSummaryChart from "./base-summary-chart.svelte";
  import type { SummariesData, SummariesEntry, SummariesViewModel } from "../../http-interface";
  import { mounted } from "../../../../stores";
  import { ChartType, Events } from "./charts";
  import type { EventData } from "./charts";
  import {
    formatDuration,
    getDurationMaxUnit,
    getDurationUnitValue,
  } from "../../../../utils/format-duration";
  import { createEventDispatcher } from "svelte";
  import type { StackedBarChartOptions } from "@carbon/charts/interfaces";
  import { DefaultFormatter } from "../../../../utils/intl-utils";
  import { writable } from "svelte/store";

  const formatter: Intl.DateTimeFormat = DefaultFormatter;

  /**
   * 表格标题, 默认为空.
   */
  export let title = "";

  /**
   * 图表类型, 默认为 {@link ChartType.PROJECTS}.
   */
  export let type: ChartType = ChartType.PROJECTS;

  /**
   * 最大显示条数, 默认为 5. (小于等于 0 表示不限制)
   */
  export let max = 5;

  /**
   * 图例选项, 默认不显示.
   */
  export let legend: interfaces.LegendOptions = { enabled: true };

  const dispatch = createEventDispatcher<{
    [key in typeof Events.Pie]: EventData;
  }>();
  const isMounted = mounted();
  const activeDataGroups = writable(new Set<string>());

  function getChartProps({ data, start, end }: SummariesViewModel) {
    // 根据 activeDataGroups 过滤数据.
    const _data = [];
    const _activeDataGroups = $activeDataGroups;
    const _isAllActive = _activeDataGroups.size <= 0;
    // 一段时间内每一天的最大秒数, 用于计算 Y 轴的最大值.
    let maxSecondsOfDay = 0;

    for (let i = data.length; i--; ) {
      const entry: SummariesData = data[i];
      const range = entry["range"];

      /**
       * branches 仅在查询条件为 {@link ChartType.PROJECTS} 时非空, 需要空值处理.
       */
      const entries: Array<SummariesEntry> = entry[type] ?? [];
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
      title,
      legend,
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
          numCharacter: 64,
        },
      },
      axes: {
        left: {
          stacked: true,
          mapsTo: "value",
          scaleType: interfaces.ScaleTypes.LINEAR,
          ticks: {
            formatter: (value) => getDurationUnitValue(value, maxUnit),
          },
          title: `${maxUnit}`,
        },
        bottom: {
          stacked: true,
          scaleType: interfaces.ScaleTypes.TIME,
        },
      },
      timeScale: {
        localeObject: zhCNLocaleObject,
      },
      data: {
        loading: _data.length <= 0,
        selectedGroups: Array.from($activeDataGroups),
      },
    };

    return {
      data: _data,
      options,
    };
  }

  let chart: BarChartStacked;

  $: {
    if ($isMounted && chart) {
      chart.services.events.addEventListener(Events.Legend.ITEMS_UPDATE, (event: CustomEvent) => {
        const dataGroups = event.detail.dataGroups as Array<{ name: string; status: 0 | 1 }>;
        const activeDataGroupSet = new Set<string>();
        for (let i = dataGroups.length; i--; ) {
          const { name, status } = dataGroups[i];
          if (status === 1) activeDataGroupSet.add(name);
        }
        activeDataGroups.set(activeDataGroupSet);
      });
    }
  }
</script>

<BaseSummaryChart {...$$restProps} let:stat let:refresh>
  {#key type}
    {#key $activeDataGroups}
      <BarChartStacked bind:chart="{chart}" {...getChartProps(stat)} />
    {/key}
  {/key}
</BaseSummaryChart>

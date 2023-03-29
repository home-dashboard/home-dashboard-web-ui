<script lang="ts">
  import { PieChart } from "@carbon/charts-svelte";
  import { interfaces } from "@carbon/charts";
  import { deepMerge, clone } from "@siaikin/utils";
  import BaseStatChart from "./base-stat-chart.svelte";
  import type { StatsData, SummariesEntry } from "../../http-interface";
  import { mounted } from "../../../../stores";
  import { ChartType, Events } from "./charts";
  import type { EventData } from "./charts";
  import { formatDuration } from "../../../../utils/format-duration";
  import { createEventDispatcher } from "svelte";

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
  export let legend: interfaces.LegendOptions = { enabled: false };

  const defaultPie: interfaces.PieChartOptions["pie"] = {
    // valueMapsTo: "percent",
    labels: { enabled: false, formatter: (item) => item.data.group },
    alignment: interfaces.Alignments.CENTER,
  };
  /**
   * 饼图选项, 默认不显示标签.
   */
  export let pie: interfaces.PieChartOptions["pie"] = defaultPie;

  const dispatch = createEventDispatcher<{
    [key in typeof Events.Pie]: EventData;
  }>();
  const isMounted = mounted();

  function getChartProps(stat: StatsData) {
    const statEntries: Array<SummariesEntry> = stat[type];
    const data = [];

    // 限制最大显示条数, max 小于等于 0 表示不限制.
    const maxCount = max <= 0 ? statEntries.length : Math.min(statEntries.length, max);
    for (let i = 0; i < maxCount; i++) {
      const entry = statEntries[i];
      data.push({
        group: entry.name,
        value: entry.total_seconds,
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

    const options = {
      title,
      legend,
      pie: deepMerge(clone(defaultPie), pie),
      resizable: true,
      toolbar: { enabled: false },
      tooltip: {
        valueFormatter: (value) => formatDuration(value),
        truncation: {
          numCharacter: 64,
        },
      },
      data: {
        loading: data.length <= 0,
      },
    };

    return {
      data,
      options,
    };
  }

  let chart: PieChart;

  const deliverChartEvent = (event: CustomEvent) =>
    dispatch(event.type as typeof Events.Pie, event.detail);

  $: {
    if ($isMounted && chart) {
      chart.services.events.addEventListener(Events.Pie.SLICE_CLICK, deliverChartEvent);
    }
  }
</script>

<BaseStatChart {...$$restProps} let:stat let:refresh>
  <PieChart bind:chart="{chart}" {...getChartProps(stat)} />
</BaseStatChart>

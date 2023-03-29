<script lang="ts">
  import { BarChartSimple } from "@carbon/charts-svelte";
  import BaseProcessRealtimeChart from "./base-process-realtime-chart.svelte";
  import type { FormattedProcessRealtimeStat } from "../../../http-interface/server-send-event";
  import { interfaces } from "@carbon/charts";
  import { deepMerge } from "@siaikin/utils";

  export let options: interfaces.BarChartOptions = {};

  function getChartProps({ processes, memoryUsage }: FormattedProcessRealtimeStat) {
    const data = [];

    /**
     * carbon chart 默认由下至上渲染, 需要反转以实现由上至下排序.
     */
    for (let i = processes.length; i--; ) {
      const proc = processes[i];
      data.push({
        group: proc.name,
        value: proc.memoryPercent,
      });
    }

    const _options: interfaces.BarChartOptions = {
      resizable: true,
      toolbar: { enabled: false },
      tooltip: {
        showTotal: true,
        totalLabel: "ASD",
      },
      axes: {
        left: {
          mapsTo: "group",
          scaleType: interfaces.ScaleTypes.LABELS,
        },
        bottom: {
          title: "memory usage(%)",
          mapsTo: "value",
          percentage: true,
          thresholds:
            data.length <= 0
              ? []
              : [
                  {
                    value: memoryUsage,
                    label: "total memory usage",
                    fillColor: "#da1e28",
                  },
                ],
        },
      },
      legend: { enabled: false },
      data: {
        loading: data.length <= 0,
      },
    };

    return {
      data,
      options: deepMerge(_options, options),
    };
  }
</script>

<BaseProcessRealtimeChart {...$$restProps} let:stat>
  <BarChartSimple {...getChartProps(stat)} />
</BaseProcessRealtimeChart>

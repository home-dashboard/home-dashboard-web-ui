<script lang="ts">
  import { BarChartSimple } from "@carbon/charts-svelte";
  import BaseProcessRealtimeChart from "./base-process-realtime-chart.svelte";
  import type { FormattedProcessRealtimeStat } from "../../http-interface/server-send-event";

  function getChartProps({ processes, cpuUsage }: FormattedProcessRealtimeStat) {
    const data = [];

    /**
     * carbon chart 默认由下至上渲染, 需要反转以实现由上至下排序.
     */
    for (let i = processes.length; i--; ) {
      const proc = processes[i];
      data.push({
        group: proc.name,
        value: proc.cpuPercent,
      });
    }

    const options = {
      resizable: true,
      toolbar: { enabled: false },
      axes: {
        left: {
          mapsTo: "group",
          scaleType: "labels",
        },
        bottom: {
          title: "cpu usage(%)",
          mapsTo: "value",
          percentage: true,
          thresholds:
            data.length <= 0
              ? []
              : [
                  {
                    value: cpuUsage,
                    label: "total cpu usage",
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
      options,
    };
  }
</script>

<BaseProcessRealtimeChart {...$$restProps} let:stat>
  <BarChartSimple {...getChartProps(stat)} />
</BaseProcessRealtimeChart>

import { ChartConfig, SimpleBarChart, ScaleTypes, BarChartOptions } from "@carbon/charts";
import { JSX, VoidProps } from "solid-js";
import { FormattedProcessRealtimeStat } from "../../../http-interface/server-send-event";
import BaseProcessRealtimeStatChart from "./base-process-realtime-stat-chart";

export default function ProcessRealtimeMemoryUsageChart(
  props: VoidProps<JSX.HTMLAttributes<HTMLDivElement>>
) {
  function getChartProps({
    processes,
    memoryUsage
  }: FormattedProcessRealtimeStat): ChartConfig<BarChartOptions> {
    const data = [];

    /**
     * carbon chart 默认由下至上渲染, 需要反转以实现由上至下排序.
     */
    for (let i = processes.length; i--; ) {
      const proc = processes[i];
      data.push({
        group: proc.name,
        value: proc.memoryPercent
      });
    }

    const _options: BarChartOptions = {
      resizable: true,
      toolbar: { enabled: false },
      tooltip: {
        showTotal: true,
        totalLabel: "ASD"
      },
      axes: {
        left: {
          mapsTo: "group",
          scaleType: ScaleTypes.LABELS
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
                    fillColor: "#da1e28"
                  }
                ]
        }
      },
      legend: { enabled: false },
      data: {
        loading: data.length <= 0
      }
    };

    return {
      data,
      options: _options
    };
  }

  return (
    <BaseProcessRealtimeStatChart
      {...props}
      config={getChartProps}
      instance={(element, config) => new SimpleBarChart(element, config)}
    />
  );
}

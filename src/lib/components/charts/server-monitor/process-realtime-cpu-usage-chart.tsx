import { ChartConfig, SimpleBarChart, ScaleTypes } from "@carbon/charts";
import { FormattedProcessRealtimeStat } from "../../../http-interface/server-send-event";
import BaseProcessRealtimeStatChart from "../../../components/charts/server-monitor/base-process-realtime-stat-chart";
import { BarChartOptions } from "@carbon/charts/dist/interfaces/charts";
import { JSX, VoidProps } from "solid-js";

export default function ProcessRealtimeCpuUsageChart(
  props: VoidProps<JSX.HTMLAttributes<HTMLDivElement>>
) {
  function getChartProps({
    processes,
    cpuUsage
  }: FormattedProcessRealtimeStat): ChartConfig<BarChartOptions> {
    const data = [];

    /**
     * carbon chart 默认由下至上渲染, 需要反转以实现由上至下排序.
     */
    for (let i = processes.length; i--; ) {
      const proc = processes[i];
      data.push({
        group: proc.name,
        value: proc.cpuPercent
      });
    }

    const options: BarChartOptions = {
      resizable: true,
      toolbar: { enabled: false },
      axes: {
        left: {
          mapsTo: "group",
          scaleType: ScaleTypes.LABELS
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
      options
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

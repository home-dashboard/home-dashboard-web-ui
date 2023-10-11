import { Alignments, DonutChart, DonutChartOptions } from "@carbon/charts";
import { ChartRealtimeStat } from "../../../observers";
import BaseRealtimeStatChart from "./base-realtime-stat-chart";
import { filesize } from "filesize";
import { JSX, VoidProps } from "solid-js";

export default function RealtimeMemoryChart(props: VoidProps<JSX.HTMLAttributes<HTMLDivElement>>) {
  function getChartProps({ memory: stat }: ChartRealtimeStat.ChartRealtimeStat) {
    const { virtualMemory } = stat;

    const data = [
      {
        group: "Used",
        size: virtualMemory.used
      },
      {
        group: "Available",
        size: virtualMemory.available
      }
    ];

    const options: DonutChartOptions = {
      title: "Memory",
      resizable: true,
      toolbar: { enabled: false },
      donut: {
        alignment: Alignments.CENTER,
        center: {
          label: "%",
          numberFormatter: () => virtualMemory.usedPercent.toString()
        }
      },
      legend: {},
      pie: {
        valueMapsTo: "size",
        labels: {
          formatter: (item) => filesize(item.data.size, { base: 2 })
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

  return (
    <BaseRealtimeStatChart
      {...props}
      config={getChartProps}
      instance={(element, config) => new DonutChart(element, config)}
    />
  );
}

import { Alignments, DonutChart, DonutChartOptions } from "@carbon/charts";
import { ChartRealtimeStat } from "../../../observers";
import BaseRealtimeStatChart from "./base-realtime-stat-chart";
import { JSX, VoidProps } from "solid-js";

export default function RealtimeCpuChart(props: VoidProps<JSX.HTMLAttributes<HTMLDivElement>>) {
  function getChartProps({ cpu: stat }: ChartRealtimeStat.ChartRealtimeStat) {
    const { percent, name } = stat;

    const data = [
      {
        group: "Used",
        percent
      },
      {
        group: "Free",
        percent: 100 - percent
      }
    ];

    const options: DonutChartOptions = {
      title: `CPU(${name})`,
      resizable: true,
      toolbar: { enabled: false },
      donut: {
        alignment: Alignments.CENTER,
        center: {
          label: "%",
          numberFormatter: () => percent.toFixed(1)
        }
      },
      legend: {},
      pie: {
        valueMapsTo: "percent",
        labels: {
          formatter: (item) => item.data.group
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

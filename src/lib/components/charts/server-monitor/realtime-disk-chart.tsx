import { BarChartOptions, ScaleTypes, StackedBarChart } from "@carbon/charts";
import { ChartRealtimeStat } from "../../../observers";
import BaseRealtimeStatChart from "./base-realtime-stat-chart";
import { filesize } from "filesize";
import { JSX, VoidProps } from "solid-js";

export default function RealtimeDiskChart(props: VoidProps<JSX.HTMLAttributes<HTMLDivElement>>) {
  function getChartProps({ disk: stat }: ChartRealtimeStat.ChartRealtimeStat) {
    const { perDisk } = stat;

    const data: Array<{ group: string; key: string; value: number }> = [];
    let max = 0;

    const diskList = Array.from(perDisk.values());

    diskList.forEach(({ partition, usage }) => {
      const name = partition.device;
      const { used, free } = usage;

      data.push(
        {
          group: "Used",
          key: name,
          value: used
        },
        {
          group: "Free",
          key: name,
          value: free
        }
      );

      max = Math.max(max, used, free);
    });

    if (Number.isNaN(max)) {
      // eslint-disable-next-line no-debugger
      debugger;
    }
    const { exponent, unit } = filesize(max, { output: "object" });

    for (let i = data.length; i--; ) {
      // eslint-disable-next-line prefer-destructuring
      data[i].value = filesize(data[i].value, { exponent, output: "array", round: 10 })[0];
    }

    const options: BarChartOptions = {
      title: "Disk",
      toolbar: { enabled: false },
      tooltip: {
        valueFormatter: (v: string) => v
      },
      axes: {
        left: {
          stacked: true,
          mapsTo: "value",
          title: `${unit}`
        },
        bottom: {
          scaleType: ScaleTypes.LABELS,
          mapsTo: "key"
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
      instance={(element, config) => new StackedBarChart(element, config)}
    />
  );
}

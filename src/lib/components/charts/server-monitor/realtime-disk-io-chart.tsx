import { LineChart, LineChartOptions, ScaleTypes } from "@carbon/charts";
import { ChartRealtimeStat } from "../../../observers";
import BaseRealtimeStatChart from "./base-realtime-stat-chart";
import { filesize } from "filesize";
import { ChartTabularData } from "@carbon/charts/dist/interfaces/model";
import { JSX, VoidProps } from "solid-js";

export default function RealtimeDiskIoChart(props: VoidProps<JSX.HTMLAttributes<HTMLDivElement>>) {
  function getChartProps({ disk: stat }: ChartRealtimeStat.ChartRealtimeStat) {
    const { perDisk, countLimit } = stat;

    const data: ChartTabularData = [];
    let maxRate = 0;

    const diskList = Array.from(perDisk.values());

    diskList.forEach(({ partition, ioStatList }) => {
      const { length } = ioStatList;
      const fillLength = countLimit - length;
      const name = partition.device;

      for (let i = 0; i < fillLength; i++) {
        data.push({ group: name, key: countLimit - i, value: 0 });
      }

      for (let i = 0; i < length; i++) {
        const { readRate, writeRate } = ioStatList[i];
        const totalRate = readRate + writeRate;

        data.push({
          group: name,
          key: length - i,
          value: totalRate
        });

        maxRate = Math.max(totalRate, maxRate);
      }
    });

    if (Number.isNaN(maxRate)) {
      // eslint-disable-next-line no-debugger
      debugger;
    }
    const { exponent, unit } = filesize(maxRate, { output: "object" });

    for (let i = data.length; i--; ) {
      // eslint-disable-next-line prefer-destructuring
      data[i].value = filesize(data[i].value, { exponent, output: "array" })[0];
    }

    const options: LineChartOptions = {
      title: "Disk IO",
      toolbar: { enabled: false },
      axes: {
        left: {
          mapsTo: "value",
          title: `${unit}/s`
        },
        bottom: {
          scaleType: ScaleTypes.LABELS,
          mapsTo: "key"
        }
      },
      points: { radius: 4, enabled: false },
      animations: false,
      curve: "curveMonotoneX",
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
      instance={(element, config) => new LineChart(element, config)}
    />
  );
}

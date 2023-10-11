import { LineChart, LineChartOptions, ScaleTypes } from "@carbon/charts";
import { ChartRealtimeStat } from "../../../observers";
import BaseRealtimeStatChart from "./base-realtime-stat-chart";
import { filesize } from "filesize";
import { JSX, VoidProps } from "solid-js";

export default function RealtimeNetworkIoChart(
  props: VoidProps<JSX.HTMLAttributes<HTMLDivElement>>
) {
  function getChartProps({ network: stat }: ChartRealtimeStat.ChartRealtimeStat) {
    const { all, countLimit } = stat;

    const maxRate = all.reduce((prev, cur) => Math.max(prev, cur.sentRate, cur.receiveRate), 0);
    if (Number.isNaN(maxRate)) {
      // eslint-disable-next-line no-debugger
      debugger;
    }
    const { exponent, unit } = filesize(maxRate, { bits: true, output: "object" });

    const data = [];

    const fillLength = countLimit - all.length;
    for (let i = 0; i < fillLength; i++) {
      data.push(
        { group: "upload", key: countLimit - i, value: 0 },
        { group: "download", key: countLimit - i, value: 0 }
      );
    }
    for (let i = 0; i < all.length; i++) {
      const { sentRate, receiveRate } = all[i];

      data.push(
        {
          group: "upload",
          key: all.length - i,
          value: filesize(sentRate, { bits: true, exponent, output: "array" })[0]
        },
        {
          group: "download",
          key: all.length - i,
          value: filesize(receiveRate, { bits: true, exponent, output: "array" })[0]
        }
      );
    }

    const options: LineChartOptions = {
      title: "Network",
      toolbar: { enabled: false },
      axes: {
        left: {
          mapsTo: "value",
          title: `${unit}ps`
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

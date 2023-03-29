<script lang="ts">
  import { LineChart } from "@carbon/charts-svelte";
  import BaseChartChart from "./base-realtime-chart.svelte";

  import { ChartRealtimeStat } from "../../../stores/chart-realtime-stat-sotre";
  import { filesize } from "filesize";

  function getChartProps(stat: Pick<ChartRealtimeStat, "network">) {
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
          value: filesize(sentRate, { bits: true, exponent, output: "array" })[0],
        },
        {
          group: "download",
          key: all.length - i,
          value: filesize(receiveRate, { bits: true, exponent, output: "array" })[0],
        }
      );
    }

    const options = {
      title: "Network",
      toolbar: { enabled: false },
      axes: {
        left: {
          stacked: true,
          mapsTo: "value",
          title: `${unit}ps`,
        },
        bottom: {
          scaleType: "labels",
          mapsTo: "key",
        },
      },
      points: { enabled: false },
      animations: false,
      curve: "curveMonotoneX",
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

<BaseChartChart {...$$restProps} let:stat>
  <LineChart {...getChartProps(stat.network)} />
</BaseChartChart>

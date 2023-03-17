<script lang="ts">
  import { BarChartStacked } from "@carbon/charts-svelte";
  import BaseChartChart from "./base-realtime-chart.svelte";

  import { ChartRealtimeStat } from "../../stores/chart-realtime-stat-sotre";
  import { filesize } from "filesize";

  function getChartProps(stat: Pick<ChartRealtimeStat, "disk">) {
    const { perDisk } = stat;

    const data = [];
    let max = 0;

    const diskList = Array.from(perDisk.values());

    diskList.forEach(({ partition, usage }) => {
      const name = partition.device;
      const { used, free } = usage;

      data.push(
        {
          group: "Used",
          key: name,
          value: used,
        },
        {
          group: "Free",
          key: name,
          value: free,
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

    const options = {
      title: "Disk",
      toolbar: { enabled: false },
      tooltip: {
        valueFormatter: (v) => v,
      },
      axes: {
        left: {
          stacked: true,
          mapsTo: "value",
          title: `${unit}`,
        },
        bottom: {
          scaleType: "labels",
          mapsTo: "key",
        },
      },
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
  <BarChartStacked {...getChartProps(stat.disk)} />
</BaseChartChart>

<script lang="ts">
  import { DonutChart } from "@carbon/charts-svelte";
  import BaseChartChart from "./base-realtime-chart.svelte";

  import { ChartRealtimeStat } from "../../stores/chart-realtime-stat-sotre";
  import { filesize } from "filesize";

  function getChartProps(stat: Pick<ChartRealtimeStat, "memory">) {
    const { virtualMemory } = stat;

    const data = [
      {
        group: "Used",
        size: virtualMemory.used,
      },
      {
        group: "Available",
        size: virtualMemory.available,
      },
    ];

    const options = {
      title: "Memory",
      resizable: true,
      toolbar: { enabled: false },
      donut: {
        alignment: "center",
        center: {
          label: "%",
          numberFormatter: () => virtualMemory.usedPercent,
        },
      },
      legend: {},
      pie: {
        valueMapsTo: "size",
        labels: {
          formatter: (item) => filesize(item.data.size, { base: 2 }),
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
  <DonutChart {...getChartProps(stat.memory)} />
</BaseChartChart>

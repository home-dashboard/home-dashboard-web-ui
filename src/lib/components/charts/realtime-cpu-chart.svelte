<script lang="ts">
  import { DonutChart } from "@carbon/charts-svelte";
  import BaseChartChart from "./base-realtime-chart.svelte";

  import { ChartRealtimeStat } from "../../stores/chart-realtime-stat-sotre";

  function getChartProps(stat: Pick<ChartRealtimeStat, "cpu">) {
    const { percent, name } = stat;

    const data = [
      {
        group: "Used",
        percent,
      },
      {
        group: "Free",
        percent: 100 - percent,
      },
    ];

    const options = {
      title: `CPU(${name})`,
      resizable: true,
      toolbar: { enabled: false },
      donut: {
        alignment: "center",
        center: {
          label: "%",
          numberFormatter: () => percent.toFixed(1),
        },
      },
      legend: {},
      pie: {
        valueMapsTo: "percent",
        labels: {
          formatter: (item) => item.data.group,
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
  <DonutChart {...getChartProps(stat.cpu)} />
</BaseChartChart>

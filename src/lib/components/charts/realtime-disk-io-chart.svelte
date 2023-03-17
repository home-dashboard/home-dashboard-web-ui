<script lang="ts">
  import { LineChart } from "@carbon/charts-svelte";
  import BaseChartChart from "./base-realtime-chart.svelte";

  import { ChartRealtimeStat } from "../../stores/chart-realtime-stat-sotre";
  import { filesize } from "filesize";

  function getChartProps(stat: Pick<ChartRealtimeStat, "disk">) {
    const { perDisk, countLimit } = stat;

    const data = [];
    let maxRate = 0;

    const diskList = Array.from(perDisk.values());
    if (diskList.length <= 0) diskList.push({ partition: { device: "" }, ioStatList: [] });

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
          value: totalRate,
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

    const options = {
      title: "Disk IO",
      toolbar: { enabled: false },
      axes: {
        left: {
          stacked: true,
          mapsTo: "value",
          title: `${unit}/s`,
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
  <LineChart {...getChartProps(stat.disk)} />
</BaseChartChart>

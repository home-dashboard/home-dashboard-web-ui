import { createMemo, splitProps, VoidProps } from "solid-js";
import { Chart, ChartConfig } from "@carbon/charts";
import { ChartRealtimeStatContext } from "../../../contextes";
import { AxisChartOptions } from "@carbon/charts/dist/interfaces/charts";
import { ChartRealtimeStat } from "../../../observers";
import BaseChart from "../base-chart";

export default function BaseRealtimeStatChart<T extends AxisChartOptions, C extends Chart>(
  props: VoidProps<{
    config: (stat: ChartRealtimeStat.ChartRealtimeStat) => ChartConfig<T>;
    instance: (element: HTMLDivElement, config: ChartConfig<T>) => C;
  }>
) {
  const [localProps, otherProps] = splitProps(props, ["instance", "config"]);

  const [stat, { pause, resume }] = ChartRealtimeStatContext.useContext();
  const chartConfig = createMemo(() => localProps.config(stat()));

  return (
    <BaseChart
      config={chartConfig()}
      instance={localProps.instance}
      onMouseEnter={pause}
      onMouseLeave={resume}
      {...otherProps}
    />
  );
}

import { createMemo, JSX, splitProps, VoidProps } from "solid-js";
import { Chart, ChartConfig } from "@carbon/charts";
import { ChartProcessRealtimeStatContext } from "../../../contextes";
import { FormattedProcessRealtimeStat } from "../../../http-interface/server-send-event";
import { AxisChartOptions } from "@carbon/charts/dist/interfaces/charts";
import BaseChart from "../base-chart";

export default function BaseProcessRealtimeStatChart<T extends AxisChartOptions, C extends Chart>(
  props: VoidProps<
    {
      config: (stat: FormattedProcessRealtimeStat) => ChartConfig<T>;
      instance: (element: HTMLDivElement, config: ChartConfig<T>) => C;
    } & JSX.HTMLAttributes<HTMLDivElement>
  >
) {
  const [localProps, otherProps] = splitProps(props, ["instance", "config"]);

  const [stat, { pause, resume }] = ChartProcessRealtimeStatContext.useContext();
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

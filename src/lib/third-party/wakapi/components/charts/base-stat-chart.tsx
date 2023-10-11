import { createMemo, splitProps, VoidProps } from "solid-js";
import { StatsContext } from "../../contextes";
import { Chart, ChartConfig } from "@carbon/charts";
import { AxisChartOptions } from "@carbon/charts/dist/interfaces/charts";
import { StatsData } from "../../http-interface";
import BaseChart from "../../../../components/charts/base-chart";

export default function BaseStatChart<T extends AxisChartOptions, C extends Chart>(
  props: VoidProps<{
    config: (stat: StatsData) => ChartConfig<T>;
    instance: (element: HTMLDivElement, config: ChartConfig<T>) => C;
  }>
) {
  const [localProps, otherProps] = splitProps(props, ["instance", "config"]);

  const [stat] = StatsContext.useContext();
  const chartConfig = createMemo(() => localProps.config(stat()));

  return <BaseChart config={chartConfig()} instance={localProps.instance} {...otherProps} />;
}

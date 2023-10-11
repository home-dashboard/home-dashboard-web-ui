import { createMemo, splitProps, VoidProps } from "solid-js";
import { SummariesContext } from "../../contextes";
import { Chart, ChartConfig } from "@carbon/charts";
import { AxisChartOptions } from "@carbon/charts/dist/interfaces/charts";
import { SummariesViewModel } from "../../http-interface";
import BaseChart from "../../../../components/charts/base-chart";

export default function BaseSummaryChart<T extends AxisChartOptions, C extends Chart>(
  props: VoidProps<{
    config: (stat: SummariesViewModel) => ChartConfig<T>;
    instance: (element: HTMLDivElement, config: ChartConfig<T>) => C;
  }>
) {
  const [localProps, otherProps] = splitProps(props, ["instance", "config"]);

  const [summaries] = SummariesContext.useContext();
  const chartConfig = createMemo(() => localProps.config(summaries()));

  return <BaseChart config={chartConfig()} instance={localProps.instance} {...otherProps} />;
}

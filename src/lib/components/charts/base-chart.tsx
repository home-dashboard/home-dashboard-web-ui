import { VoidProps, JSX, onMount, splitProps, createEffect, on } from "solid-js";
import { AxisChartOptions } from "@carbon/charts/dist/interfaces/charts";
import { Chart, ChartConfig } from "@carbon/charts";
import { typeIsArray } from "@siaikin/utils";

export default function BaseChart<T extends AxisChartOptions, C extends Chart>(
  props: VoidProps<
    {
      config: ChartConfig<T>;
      instance: (element: HTMLDivElement, config: ChartConfig<T>) => C;
    } & JSX.HTMLAttributes<HTMLDivElement>
  >
) {
  const [localProps, otherProps] = splitProps(props, ["instance", "config"]);

  let chartElement: HTMLDivElement;
  onMount(() => onElementMount(chartElement));

  function onElementMount(element: HTMLDivElement) {
    const chart = localProps.instance(element, localProps.config);

    createEffect(
      on(
        () => localProps.config,
        () => {
          const { data, options } = localProps.config;

          chart.model.setData(data);
          chart.model.setOptions(options);
        },
        { defer: true }
      )
    );
  }

  return <div ref={(el) => (chartElement = el)} {...otherProps} />;
}

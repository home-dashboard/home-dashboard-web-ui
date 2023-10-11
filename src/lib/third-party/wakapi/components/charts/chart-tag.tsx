import { ChartTagPosition } from "./charts";
import { children, createMemo, mergeProps, ParentProps } from "solid-js";

import "./chart-tag.scss";

export default function ChartTag(
  props: ParentProps<{ position?: ChartTagPosition; [key: string]: unknown }>
) {
  const mergedProps = mergeProps({ position: ChartTagPosition.TOP_LEFT }, props);

  const c = children(() => props.children);
  const classMap = createMemo(() => ({
    "hd--tag": true,
    "hd--tag--top-left": mergedProps.position === ChartTagPosition.TOP_LEFT,
    "hd--tag--top-right": mergedProps.position === ChartTagPosition.TOP_RIGHT,
    "hd--tag--bottom-left": mergedProps.position === ChartTagPosition.BOTTOM_LEFT,
    "hd--tag--bottom-right": mergedProps.position === ChartTagPosition.BOTTOM_RIGHT
  }));

  const classString = createMemo(() =>
    Object.entries(classMap())
      .filter(([, value]) => value)
      .map(([key]) => key)
      .join(" ")
  );

  return (
    <cds-tag class={classString()} {...mergedProps}>
      {c()}
    </cds-tag>
  );
}

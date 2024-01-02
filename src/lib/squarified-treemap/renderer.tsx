import { createMemo, JSX, splitProps, For, Accessor, mergeProps, Show } from "solid-js";
import { typeIsObject } from "@siaikin/utils";
import { elementRect } from "../utils/reactive-dom-rect";
import { BreakpointsContext } from "../../lib/contextes";
import { hierarchy, HierarchyRectangularNode, treemap, treemapSquarify } from "d3-hierarchy";
import { sum } from "d3-array";

export function Renderer<T>(
  props: {
    root: T;
    rootChildren: (item: T) => Array<T>;
    weight: (item: T) => number;
    rest: (weight: number, sum: number, restChildren: Array<T>) => T;
    children: (item: T, index: Accessor<number>) => JSX.Element;
    gap?: number;
  } & Omit<JSX.HTMLAttributes<HTMLDivElement>, "children">
) {
  const [localProps, otherProps] = splitProps(props, [
    "root",
    "rootChildren",
    "weight",
    "rest",
    "gap",
    "children"
  ]);
  const mergedProps = mergeProps({ gap: 0 }, localProps);

  const [breakpoint] = BreakpointsContext.useContext();
  const maxBookmarkCount = createMemo(() => {
    switch (breakpoint()) {
      case "sm":
        return 9;
      case "md":
        return 12;
      case "lg":
        return 16;
      case "xlg":
        return 20;
      case "max":
        return 25;
      default:
        return 9;
    }
  });

  const [rect, { setElement }] = elementRect.watchWithRef();
  const layout = createMemo(() => {
    const _rect = rect();
    if (!_rect) return { nodes: [] } as unknown as HierarchyRectangularNode<T>;

    const { weight, rest, rootChildren, root } = mergedProps;
    const rootData = (typeIsObject(root) ? root : {}) as T;

    const treemapLayout = treemap<T>()
      .tile(treemapSquarify)
      .size([_rect.width, _rect.height])
      .padding(mergedProps.gap);

    const _maxBookmarkCount = maxBookmarkCount();
    let restNode: T | null = null;
    return treemapLayout(
      hierarchy(rootData, (d) => {
        const children = rootChildren(d)
          .slice()
          .sort((a, b) => weight(b) - weight(a));
        const childrenSum = sum(children, (d) => weight(d));

        if (children.length > _maxBookmarkCount) {
          const clipped = children.slice(_maxBookmarkCount);
          restNode = rest(
            clipped.map(weight).reduce((acc, cur) => acc + cur, 0),
            childrenSum,
            clipped
          );
          children.splice(_maxBookmarkCount);
          children.push(restNode);
        }
        return children;
      })
        .sum((item) => weight(item))
        .sort((a, b) => {
          if (restNode && a.data === restNode) return 1;
          return b.value! - a.value!;
        })
    );
  });

  return (
    <div ref={setElement} {...otherProps}>
      <Show when={rect()}>
        <svg
          viewBox={`0 0 ${rect()!.width} ${rect()!.height}`}
          width={rect()?.width}
          height={rect()?.height}
          xmlns="http://www.w3.org/2000/svg"
        >
          <For each={layout().leaves()}>
            {(item, index) => {
              return (
                <g transform={`translate(${item.x0},${item.y0})`}>
                  <foreignObject x={0} y={0} width={item.x1 - item.x0} height={item.y1 - item.y0}>
                    {mergedProps.children(item.data, index)}
                  </foreignObject>
                </g>
              );
            }}
          </For>
        </svg>
      </Show>
    </div>
  );
}

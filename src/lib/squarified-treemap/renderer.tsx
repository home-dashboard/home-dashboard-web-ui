import { createMemo, JSX, splitProps, For, Accessor, mergeProps } from "solid-js";
import { LayoutDirection, Square, squarify, sum, TreeMap } from "./index";
import { notUAN, typeIsArray, typeIsString } from "@siaikin/utils";
import { elementRect } from "../utils/reactive-dom-rect";

export function Renderer<T extends Square>(
  props: {
    each: Array<T> | undefined | null | false;
    weight: (item: T) => number;
    rest: (weight: number, restChildren: Array<T>) => T;
    children: (item: T, index: Accessor<number>) => JSX.Element;
    gap?: string;
  } & Omit<JSX.HTMLAttributes<HTMLDivElement>, "children">
) {
  const [localProps, otherProps] = splitProps(props, ["each", "weight", "rest", "gap", "children"]);
  const mergedProps = mergeProps(
    {
      each: [],
      gap: "0",
      weight: (item: T) => item.weight,
      rest: (weight: number) => ({ weight })
    },
    localProps
  );

  const [rect, { setElement }] = elementRect.watchWithRef();
  const treeMap = createMemo(() => {
    const _rect = rect();

    return squarify(
      typeIsArray(mergedProps.each) ? mergedProps.each : [],
      mergedProps.weight,
      (current, root) => {
        if (!_rect) return true;

        const { edgeLength, crossEdgeLength, nodes } = current;
        const { width, height } = _rect;
        const area =
          width * height * ((edgeLength * crossEdgeLength) / (root.edgeLen * root.crossEdgeLen));

        const minNodeArea =
          (Math.min(...nodes.map(mergedProps.weight)) / sum(nodes, mergedProps.weight)) * area;
        return minNodeArea > 36 ** 2;
      },
      mergedProps.rest
    );
  });

  return (
    <div ref={setElement} {...otherProps}>
      <SquareRender<T> treeMap={treeMap()} weight={mergedProps.weight} gap={mergedProps.gap}>
        {(item, index) => mergedProps.children(item, index)}
      </SquareRender>
    </div>
  );
}

export function SquareRender<T extends Square>(
  props: {
    treeMap: TreeMap<T>;
    weight: (item: T) => number;
    children: (item: T, index: Accessor<number>) => JSX.Element;
    gap?: string;
  } & Omit<JSX.HTMLAttributes<HTMLDivElement>, "children">
) {
  const [localProps, otherProps] = splitProps(props, ["treeMap", "weight", "children", "gap"]);

  const treeMap = createMemo(() => localProps.treeMap);

  const crossEdgePercentage = createMemo(() =>
    Math.ceil((treeMap().crossEdgeLength / treeMap().container.crossEdgeLength) * 100)
  );

  const placeholderNodes = createMemo(() => {
    const result: Array<number> = [];

    const nodes = treeMap().nodes;
    if (nodes.length <= 0) return result;

    const totalArea = sum(nodes, localProps.weight);
    // 递减百分比, 最后一个百分比为剩余的百分比. 避免浮点数精度问题.
    let totalPercent = 100;
    for (let i = 0; i < nodes.length - 1; i++) {
      const node = nodes[i];
      const percent = Math.ceil((localProps.weight(node) / totalArea) * 100);
      totalPercent -= percent;
      result.push(percent);
    }
    result.push(totalPercent);

    return result;
  });

  return (
    <div
      classList={{
        flex: true,
        "w-full": true,
        "h-full": true,
        "flex-row": treeMap().direction === LayoutDirection.VERTICAL,
        "flex-col": treeMap().direction === LayoutDirection.HORIZONTAL
      }}
    >
      <div
        classList={{
          flex: true,
          "flex-row": treeMap().direction === LayoutDirection.HORIZONTAL,
          "flex-col": treeMap().direction === LayoutDirection.VERTICAL
        }}
        style={{
          width:
            treeMap().direction === LayoutDirection.VERTICAL ? `${crossEdgePercentage()}%` : "100%",
          height:
            treeMap().direction === LayoutDirection.VERTICAL ? "100%" : `${crossEdgePercentage()}%`
        }}
      >
        <For each={placeholderNodes()}>
          {(percent, index) => (
            <div
              classList={{
                "box-border": true
              }}
              style={{
                [treeMap().direction === LayoutDirection.VERTICAL
                  ? "height"
                  : "width"]: `${percent}%`,
                padding: typeIsString(localProps.gap) ? localProps.gap : "0"
              }}
            >
              {localProps.children(treeMap().nodes[index()], index)}
            </div>
          )}
        </For>
      </div>
      {notUAN(treeMap().child) ? (
        <SquareRender
          {...otherProps}
          treeMap={treeMap().child!}
          weight={localProps.weight}
          gap={localProps.gap}
          children={localProps.children}
        />
      ) : null}
    </div>
  );
}

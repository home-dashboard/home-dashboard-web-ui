import {
  Component,
  createMemo,
  FlowProps,
  JSX,
  mergeProps,
  Show,
  splitProps,
  VoidProps
} from "solid-js";
import { ShortcutItem } from "../../../lib/http-interface";

import "./section-item.scss";
import { DefaultFormatter } from "../../../lib/utils/intl-utils";
import { Dynamic } from "solid-js/web";
import { SectionIcon } from "./section-icon";

export enum SectionItemSizeType {
  SMALL,
  MEDIUM,
  LARGE
}

export function SectionItem(
  props: VoidProps<
    {
      item: ShortcutItem;
      size?: SectionItemSizeType;
      type?: "clickable" | "selectable" | "radio";
      selectable?: boolean;
      onSelected?: (selected: boolean) => void;
    } & JSX.OptionHTMLAttributes<HTMLDivElement>
  >
) {
  const [localProps, otherProps] = splitProps(props, ["item", "size", "type", "onSelected"]);
  const mergedProps = mergeProps(
    { size: SectionItemSizeType.MEDIUM, type: "clickable" },
    localProps
  );

  const item = createMemo(() => localProps.item);
  const type = createMemo(() => {
    switch (mergedProps.type) {
      case "selectable":
        return "cds-selectable-tile";
      case "radio":
        return "cds-radio-tile";
      case "clickable":
      default:
        return "cds-clickable-tile";
    }
  });

  const handleSelected = (event: CustomEvent<{ selected: boolean }>) => {
    const { selected } = event.detail;
    mergedProps?.onSelected?.(selected);
  };

  return (
    <Dynamic
      component={type() as unknown as Component<FlowProps>}
      {...{
        ...otherProps,
        "attr:name": "section-item",
        class: ["section-item max-w-full", otherProps.class].join(" ")
      }}
      on:cds-selectable-tile-changed={handleSelected}
      on:cds-radio-tile-selected={handleSelected}
    >
      <div
        class="section-item__content"
        classList={{
          "section-item--small": mergedProps.size === SectionItemSizeType.SMALL,
          "section-item--middle": mergedProps.size === SectionItemSizeType.MEDIUM,
          "section-item--large": mergedProps.size === SectionItemSizeType.LARGE
        }}
      >
        <SectionIcon item={item()} class="section-item__icon flex-grow-0 flex-shrink-0" />
        <div class="section-item__details">
          <div class="truncate section-item__title">{item().title}</div>

          <Show when={mergedProps.size > SectionItemSizeType.SMALL}>
            <div class="section-item__description truncate">{item().description}</div>
            <span class="flex-auto" />
            <div class="truncate text-right section-item__time">
              {DefaultFormatter.format(item().updatedAt)}
            </div>
          </Show>
        </div>
      </div>
    </Dynamic>
  );
}

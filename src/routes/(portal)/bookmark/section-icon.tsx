import { createMemo, JSX, Match, mergeProps, splitProps, Switch, VoidProps } from "solid-js";
import { ShortcutItem, ShortcutItemIconType } from "../../../lib/http-interface";
import { Icon, IconifyIconProps } from "@iconify-icon/solid";

import "./section-icon.scss";
import { BASE_FILE_URL } from "../../../global-config";

export function SectionIcon(
  props: VoidProps<
    {
      item?: ShortcutItem;
      iconifyIcon?: IconifyIconProps;
    } & JSX.HTMLAttributes<HTMLImageElement>
  >
) {
  const [localProps, otherProps] = splitProps(props, ["item", "iconifyIcon"]);
  const mergedProps = mergeProps({ item: {} as ShortcutItem }, localProps);

  const item = createMemo(() => mergedProps.item);

  if (mergedProps.iconifyIcon)
    return (
      <Icon
        {...mergedProps.iconifyIcon}
        class={`section-icon icon-type__icon ${otherProps.class}`}
      />
    );

  return (
    <Switch>
      <Match when={item().iconType === ShortcutItemIconType.Icon}>
        <Icon
          {...(otherProps as IconifyIconProps)}
          class={`section-icon icon-type__icon ${otherProps.class}`}
          style={{ color: item().icon.color }}
          icon={`simple-icons:${item().icon.slug}`}
        />
      </Match>
      <Match when={item().iconType === ShortcutItemIconType.Url}>
        <img
          {...otherProps}
          class={`section-icon icon-type__url ${otherProps.class}`}
          src={
            item().iconCachedUrl ? `${BASE_FILE_URL}/${item().iconCachedUrl}` : `${item().iconUrl}`
          }
          alt={item().title}
        />
      </Match>
      <Match when={item().iconType === ShortcutItemIconType.Text}>
        <span
          {...(otherProps as JSX.HTMLAttributes<HTMLSpanElement>)}
          class={`section-icon icon-type__text ${otherProps.class}`}
        >
          {item().iconText[0]}
        </span>
      </Match>
    </Switch>
  );
}

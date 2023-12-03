import {
  createEffect,
  createMemo,
  createSignal,
  JSX,
  mergeProps,
  on,
  ParentProps,
  splitProps
} from "solid-js";
import { INLINE_LOADING_STATE } from "@carbon/web-components/es/components/inline-loading/defs";
import type CDSButton from "@carbon/web-components/es/components/button/button";
import { typeIsFunction, typeIsPromise } from "@siaikin/utils";

export function HDLoadingButton(
  props: ParentProps<
    {
      /**
       * 点击按钮时触发的回调函数, 返回 Promise 时, 会渲染 loading 状态.
       */
      onLoadingClick?: (event: MouseEvent) => Promise<void> | void;
      loading?: boolean;
      /**
       * loading 状态持续的最小时间, 单位: ms.
       * 当 onLoadingClick 返回的是 Promise 时, 会等待最少 delay 时间后再结束 loading 状态. 这样可以避免 loading 状态闪烁.
       * @default 250
       */
      delay?: number;
      loadingProps?: Partial<{ description: JSX.Element; status: INLINE_LOADING_STATE }>;
    } & Partial<Pick<CDSButton, "size"> & { kind: string }> &
      JSX.ButtonHTMLAttributes<HTMLDivElement>
  >
) {
  const [localProps, otherProps] = splitProps(props, ["onLoadingClick", "loadingProps", "loading"]);
  const mergedProps = mergeProps({ delay: 250, loading: false }, localProps);
  const loadingProps = createMemo(() => mergedProps.loadingProps);

  const [loading, setLoading] = createSignal(false);
  createEffect(() => setLoading(mergedProps.loading));

  const handleLoadingClick = async (event: MouseEvent) => {
    try {
      setLoading(true);
      await Promise.all(
        [
          mergedProps.onLoadingClick?.(event),
          new Promise((res) => setTimeout(res, mergedProps.delay))
        ].filter((item) => typeIsPromise(item))
      );
    } finally {
      setLoading(false);
    }
  };

  const onClickListener = (event: MouseEvent) =>
    typeIsFunction(mergedProps.onLoadingClick)
      ? handleLoadingClick(event)
      : (otherProps.onClick as (event: MouseEvent) => void)?.(event);

  return (
    <cds-button
      {...otherProps}
      onClick={(event: MouseEvent) => onClickListener(event)}
      disabled={loading() || otherProps.disabled}
    >
      {loading() ? (
        <cds-inline-loading
          class="min-h-0 h-4"
          status={loadingProps()?.status ?? INLINE_LOADING_STATE.ACTIVE}
        >
          {loadingProps()?.description}
        </cds-inline-loading>
      ) : (
        otherProps.children
      )}
    </cds-button>
  );
}

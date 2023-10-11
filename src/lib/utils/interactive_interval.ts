import { useNavigate } from "solid-start";
import { NavigateOptions } from "@solidjs/router/dist/types";

/**
 * UI 交互的延迟时间.
 * @see https://www.nngroup.com/articles/powers-of-10-time-scales-in-ux/
 */
const DEFAULT_INTERACTIVE_INTERVAL = {
  /**
   * 需要让用户感知到操作是立即完成的.
   * 例如点击按钮跳转页面, 点击按钮弹出对话框等.
   */
  INSTANT: 100,
  /**
   * 需要让用户感知到操作花费了一些时间.
   * 例如点击登录按钮, 收到登录成功的响应后**过了一会**跳转页面.
   */
  MOMENT: 1000
} as const;

export const INTERACTIVE_INTERVAL = DEFAULT_INTERACTIVE_INTERVAL;

export function useInteractiveInterval() {
  const navigate = useNavigate();

  /**
   * 功能与 {@link useNavigate} 一致, 但会在 {@link MOMENT} 毫秒后再进行路由跳转.
   * @param to
   * @param options
   */
  const gotoAfterMoment = (to: string, options?: Partial<NavigateOptions>) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        navigate(to, options);
        resolve();
      }, DEFAULT_INTERACTIVE_INTERVAL.MOMENT);
    });
  };

  return {
    ...DEFAULT_INTERACTIVE_INTERVAL,
    gotoAfterMoment
  };
}

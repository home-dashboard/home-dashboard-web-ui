import { goto } from "$app/navigation";

/**
 * UI 交互的延迟时间.
 * @see https://www.nngroup.com/articles/powers-of-10-time-scales-in-ux/
 */
export const INTERACTIVE_INTERVAL = {
  /**
   * 需要让用户感知到操作是立即完成的.
   * 例如点击按钮跳转页面, 点击按钮弹出对话框等.
   */
  INSTANT: 100,
  /**
   * 需要让用户感知到操作花费了一些时间.
   * 例如点击登录按钮, 收到登录成功的响应后**过了一会**跳转页面.
   */
  MOMENT: 1000,
  /**
   * 功能与 {@link goto} 一致, 但会在 {@link MOMENT} 毫秒后再进行路由跳转.
   * @param args
   */
  gotoAfterMoment: (...args: Parameters<typeof goto>) => {
    return new Promise((resolve) => {
      setTimeout(() => goto(...args).then(resolve), INTERACTIVE_INTERVAL.MOMENT);
    });
  },
};

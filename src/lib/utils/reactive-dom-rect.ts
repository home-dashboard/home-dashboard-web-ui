import { createEffect, createSignal, on, onCleanup, Setter } from "solid-js";

export const elementRect = {
  watch: watchElementReact,
  unwatch: unwatchElementReact,
  watchWithRef: watchElementReactWithRef
};

function watchElementReactWithRef() {
  const [element, setElement] = createSignal<HTMLElement>();
  onCleanup(() => element() && unwatchElementReact(element()!));

  const [rect, setRect] = createSignal<DOMRectReadOnly>();
  createEffect(on(element, (el) => el && watchElementReact(el, setRect)));

  return [rect, { setElement }] as const;
}

/**
 * 监听元素的尺寸变化
 * @param element 要监听的元素
 * @param setter
 */
function watchElementReact(element: Element, setter: Setter<DOMRectReadOnly | undefined>): void {
  initialObserver();

  setter(element.getBoundingClientRect());
  domList.set(element, setter);
  observer.observe(element);
}

/**
 * 取消监听元素的尺寸变化
 * @param element
 */
function unwatchElementReact(element: Element) {
  initialObserver();

  observer.unobserve(element);
  domList.delete(element);
}

const domList = new Map<Element, Setter<DOMRectReadOnly | undefined>>();

// 兼容 ssr 环境
let observer: ResizeObserver;
function initialObserver() {
  if (observer) return;

  observer = new ResizeObserver((entries) => {
    for (let i = entries.length; i--; ) {
      const entry = entries[i];
      const { target, contentRect } = entry;

      const setter = domList.get(target);
      if (!setter) continue;

      setter(contentRect);
    }
  });
}

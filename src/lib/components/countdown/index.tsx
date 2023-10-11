import { createEffect, createSignal, JSX, on } from "solid-js";

export function Countdown<U extends JSX.Element>(props: {
  time: number;
  interval: number;
  onFinish?: () => void;
  children?: (item: number) => U;
}) {
  const [_time, _setTime] = createSignal<number>(0);
  const [_interval, _setInterval] = createSignal<number>(0);

  let timer = -1;
  createEffect(
    on([() => props.time, () => props.interval], ([time, interval]) => {
      _setTime(time);
      _setInterval(interval);

      if (timer >= 0) clearInterval(timer);

      timer = setInterval(() => {
        _setTime(_time() - 1);
        if (_time() > 0) return;

        clearInterval(timer);
        if (props.onFinish) props.onFinish();
      }, _interval());
    })
  );

  return <>{props?.children?.(_time()) ?? _time()}</>;
}

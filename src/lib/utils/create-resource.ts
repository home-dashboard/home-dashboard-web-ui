import { createResource, createSignal } from "solid-js";
import type {
  ResourceOptions,
  ResourceReturn,
  NoInfer,
  ResourceFetcher
} from "solid-js/types/reactive/signal";

export function createResourceDefer<T, R = unknown>(
  fetcher: ResourceFetcher<true, T, R>,
  options: ResourceOptions<NoInfer<T>, true> = {}
): ResourceReturn<T, R> {
  const [trigger, setTrigger] = createSignal(false);

  return createResource<T, R>((k, info) => {
    if (!trigger()) {
      setTrigger(true);
      return true as T;
    }

    return fetcher(k, info);
  }, options);
}

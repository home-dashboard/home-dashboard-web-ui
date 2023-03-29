import type { Readable } from "svelte/store";
import { readable } from "svelte/store";
import { onMount } from "svelte";

/**
 * 存储调用方的 mount 状态, 用于在组件内部判断是否已经 mount.
 */
export function mounted(): Readable<boolean> {
  return readable(false, (set) => onMount(() => set(true)));
}

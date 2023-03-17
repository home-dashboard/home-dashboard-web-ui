import type { Readable } from "svelte/store";
import { readable } from "svelte/store";
import { onMount } from "svelte";

export function mounted(): Readable<boolean> {
  return readable(false, (set) => onMount(() => set(true)));
}

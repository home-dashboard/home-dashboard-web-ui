import { readable } from "svelte/store";
import { onMount } from "svelte";

function visibilityStateToBoolean(state: DocumentVisibilityState): boolean {
  switch (state) {
    case "hidden":
      return false;
    case "visible":
      return true;
    default:
      throw new Error(`unknown visible state: ${state}`);
  }
}

export const visibleStatusStore = readable(true, (set) => {
  const handle = () => set(visibilityStateToBoolean(document.visibilityState));

  onMount(() => {
    handle();
    document.addEventListener("visibilitychange", handle);
  });

  return () => document.removeEventListener("visibilitychange", handle);
});

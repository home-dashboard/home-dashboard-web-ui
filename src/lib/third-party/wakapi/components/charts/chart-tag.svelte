<script lang="ts">
  import { Tag } from "carbon-components-svelte";
  import { ChartTagPosition } from "./charts";

  export let position: ChartTagPosition = ChartTagPosition.TOP_LEFT;

  $: classMap = {
    "hd--tag": true,
    "hd--tag--top-left": position === ChartTagPosition.TOP_LEFT,
    "hd--tag--top-right": position === ChartTagPosition.TOP_RIGHT,
    "hd--tag--bottom-left": position === ChartTagPosition.BOTTOM_LEFT,
    "hd--tag--bottom-right": position === ChartTagPosition.BOTTOM_RIGHT,
  };
  $: classString = Object.keys(classMap)
    .filter((key) => classMap[key])
    .join(" ");
</script>

<Tag {...$$restProps} class="{classString}" on:close>
  <slot />
</Tag>

<style>
  :global(.hd--tag) {
    position: absolute;
    z-index: 1;

    margin: 0;

    border-radius: 0;
  }

  :global(.hd--tag .bx--tag__close-icon) {
    border-radius: 0;
  }

  :global(.hd--tag--top-right) {
    top: 0;
    right: 0;
  }

  :global(.hd--tag--bottom-left) {
    bottom: 0;
    left: 0;
  }

  :global(.hd--tag--bottom-right) {
    bottom: 0;
    right: 0;
  }

  :global(.hd--tag--top-left) {
    top: 0;
    left: 0;
  }
</style>

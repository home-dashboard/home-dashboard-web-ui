<script lang="ts">
  import { focusStatusStore } from "../../stores/chart-realtime-stat-sotre";

  import "@carbon/styles/css/styles.css";
  import "@carbon/charts/styles.css";

  const onMouseEnter = () => focusStatusStore.set(true);
  const onMouseLeave = () => focusStatusStore.set(false);
</script>

<div {...$$restProps} on:mouseenter="{onMouseEnter}" on:mouseleave="{onMouseLeave}">
  <slot />
</div>

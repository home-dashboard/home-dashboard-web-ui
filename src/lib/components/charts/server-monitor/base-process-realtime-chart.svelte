<script lang="ts">
  import { store } from "../../../stores/chart-process-realtime-stat-sotre";
  import BaseChart from "../base-chart.svelte";

  const stat = store;
</script>

<BaseChart {...$$restProps}>
  <slot stat="{$stat}" />
</BaseChart>

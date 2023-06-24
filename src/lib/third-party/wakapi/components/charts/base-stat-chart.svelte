<script lang="ts">
  import { statsStore, statsStoreRefresh } from "../../stores";
  import { BaseChart } from "../../../../components/charts";

  const stat = statsStore;
</script>

<BaseChart {...$$restProps}>
  <slot stat="{$stat}" refresh="{statsStoreRefresh}" />
</BaseChart>

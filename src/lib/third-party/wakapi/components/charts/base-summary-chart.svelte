<script lang="ts">
  import { summariesStore, summariesStoreRefresh } from "../../stores";
  import { BaseChart } from "../../../../components/charts";

  const stat = summariesStore;
</script>

<BaseChart {...$$restProps}>
  <slot stat="{$stat}" refresh="{summariesStoreRefresh}" />
</BaseChart>

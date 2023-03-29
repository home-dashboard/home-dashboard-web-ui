<script lang="ts">
  import { store, refresh } from "../../stores";
  import { BaseChart } from "../../../../components/charts";

  const stat = store;
</script>

<BaseChart {...$$restProps}>
  <slot stat="{$stat}" refresh="{refresh}" />
</BaseChart>

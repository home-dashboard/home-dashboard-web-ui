<script lang="ts">
  import {
    ProcessRealtimeMemoryUsageChart,
    ProcessRealtimeCpuUsageChart,
  } from "../../../lib/components/charts";
  import {
    Column,
    Grid,
    Row,
    Tile,
    Form,
    Slider,
    Select,
    SelectItem,
  } from "carbon-components-svelte";
  import { modifyCollectStat } from "../../../lib/http-interface/server-send-event";
  import { debounce } from "@siaikin/utils";
  import { mounted } from "../../../lib/stores/lifecycle";

  import "./+page.scss";

  const isMounted = mounted();
  const handleModifyProcessCollectStat = debounce(
    (sortField: string, max: number) =>
      modifyCollectStat({
        system: { enable: false },
        process: { enable: true, sortField, max },
      }),
    250
  );

  let controlFormData = {
    refreshInterval: 16,
    sortBy: "memoryUsage",
  };

  $: {
    if ($isMounted) {
      handleModifyProcessCollectStat(controlFormData.sortBy, controlFormData.refreshInterval);
    }
  }
</script>

<div class="system-process-container">
  <Form class="control-form">
    <span style="flex: 1 1 auto"></span>
    <!--    <FormGroup legendText="Refresh interval (S)">-->
    <!--      <Slider min="{1}" max="{60}" bind:value="{controlFormData.refreshInterval}" />-->
    <!--    </FormGroup>-->
    <Slider
      labelText="{`Top ${controlFormData.refreshInterval}`}"
      min="{1}"
      max="{60}"
      bind:value="{controlFormData.refreshInterval}"
    />
    <Select labelText="Sort by" bind:selected="{controlFormData.sortBy}">
      <SelectItem value="memoryUsage" text="Memory usage" />
      <SelectItem value="cpuUsage" text="Cpu usage" />
      <SelectItem value="networkUsage" text="Network usage" />
    </Select>
  </Form>

  <Grid fullWidth padding noGutter class="chart-container">
    <Row class="process-chart-row">
      <Column>
        <Tile class="process-chart-tile">
          {#if controlFormData.sortBy === "memoryUsage"}
            <ProcessRealtimeMemoryUsageChart options="{{ toolbar: false }}" class="process-chart" />
          {:else if controlFormData.sortBy === "cpuUsage"}
            <ProcessRealtimeCpuUsageChart class="process-chart" />
          {/if}
        </Tile>
      </Column>
    </Row>
  </Grid>
</div>

<style lang="scss">
  .system-process-container {
    height: 100%;
  }
</style>

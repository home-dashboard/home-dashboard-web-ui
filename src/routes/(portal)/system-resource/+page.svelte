<script lang="ts">
  import {
    RealtimeCpuChart,
    RealtimeDiskChart,
    RealtimeDiskIoChart,
    RealtimeNetworkIoChart,
    RealtimeMemoryChart,
    ProcessRealtimeMemoryUsageChart,
    ProcessRealtimeCpuUsageChart,
  } from "../../../lib/components/charts";
  import { Column, ExpandableTile, Grid, Row, Tile } from "carbon-components-svelte";
  import { modifyCollectStat } from "../../../lib/http-interface/server-send-event";
  import { mounted } from "../../../lib/stores/lifecycle";
  import { debounce } from "@siaikin/utils";

  import "./+page.scss";

  const isMounted = mounted();

  const handleModifyProcessCollectStat = debounce(
    async (enable: boolean, sortField: string) =>
      await modifyCollectStat({
        system: { enable: true },
        process: { enable, sortField, max: 10 },
      }),
    250
  );

  let expandStates = [false, false];

  async function handleChartClick(event: Event, index: number) {
    event.stopImmediatePropagation();

    expandStates = expandStates.map((expanded, _index) => (index === _index ? !expanded : false));

    if (expandStates[index]) {
      switch (index) {
        case 0:
          await handleModifyProcessCollectStat(true, "memoryUsage");
          break;
        case 1:
          await handleModifyProcessCollectStat(true, "cpuUsage");
          break;
      }
    } else {
      await handleModifyProcessCollectStat(false, "");
    }
  }

  isMounted.subscribe((mounted) => mounted && handleModifyProcessCollectStat(false, ""));
</script>

<svelte:window />
<Grid fullWidth padding noGutter class="system-resource-container">
  <Row>
    <Column sm="{4}" md="{8}" lg="{8}">
      <ExpandableTile>
        <svelte:fragment slot="above">
          <RealtimeNetworkIoChart class="dashboard-chart" />
        </svelte:fragment>
        <svelte:fragment slot="below">
          <RealtimeNetworkIoChart class="dashboard-chart" />
        </svelte:fragment>
      </ExpandableTile>
    </Column>

    <Column sm="{4}" md="{4}" lg="{4}">
      <ExpandableTile
        expanded="{expandStates[0]}"
        on:click="{(event) => handleChartClick(event, 0)}"
      >
        <svelte:fragment slot="above">
          <RealtimeMemoryChart class="dashboard-chart" />
        </svelte:fragment>
        <svelte:fragment slot="below">
          <ProcessRealtimeMemoryUsageChart class="dashboard-chart" />
        </svelte:fragment>
      </ExpandableTile>
    </Column>

    <Column sm="{4}" md="{4}" lg="{4}">
      <ExpandableTile
        expanded="{expandStates[1]}"
        on:click="{(event) => handleChartClick(event, 1)}"
      >
        <svelte:fragment slot="above">
          <RealtimeCpuChart class="dashboard-chart" />
        </svelte:fragment>
        <svelte:fragment slot="below">
          <ProcessRealtimeCpuUsageChart class="dashboard-chart" />
        </svelte:fragment>
      </ExpandableTile>
    </Column>

    <Column sm="{4}" md="{8}" lg="{8}">
      <Tile>
        <RealtimeDiskIoChart class="dashboard-chart" />
      </Tile>
    </Column>

    <Column sm="{4}" md="{4}" lg="{4}">
      <Tile>
        <RealtimeDiskChart class="dashboard-chart" />
      </Tile>
    </Column>
  </Row>
</Grid>

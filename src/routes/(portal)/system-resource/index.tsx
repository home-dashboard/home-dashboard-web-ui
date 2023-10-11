import {
  RealtimeCpuChart,
  RealtimeDiskChart,
  RealtimeDiskIoChart,
  RealtimeNetworkIoChart,
  RealtimeMemoryChart,
  ProcessRealtimeMemoryUsageChart,
  ProcessRealtimeCpuUsageChart
} from "../../../lib/components/charts";
import { modifyCollectStat } from "../../../lib/http-interface/server-send-event";
import { debounce } from "@siaikin/utils";
import { onMount } from "solid-js";

import "./styles.scss";

export default function Index() {
  const handleModifyProcessCollectStat = debounce(
    async (enable: boolean, sortField: string) =>
      await modifyCollectStat({
        system: { enable: true },
        process: { enable, sortField, max: 10 }
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

  onMount(() => handleModifyProcessCollectStat(false, ""));

  return (
    <div class="system-resource-container cds--css-grid cds--css-grid--full-width cds--css-grid--narrow">
      <div class="cds--css-grid-column cds--sm:col-span-4 cds--md:col-span-8 cds--lg:col-span-8">
        <cds-tile>
          <RealtimeNetworkIoChart />
        </cds-tile>
      </div>

      <div class="cds--css-grid-column cds--sm:col-span-4 cds--md:col-span-4 cds--lg:col-span-4">
        <cds-expandable-tile
          expanded={expandStates[0]}
          on:cds-expandable-tile-toggled={(event: CustomEvent) => handleChartClick(event, 0)}
        >
          <cds-tile-above-the-fold-content>
            <RealtimeMemoryChart />
          </cds-tile-above-the-fold-content>
          <cds-tile-below-the-fold-content>
            <ProcessRealtimeMemoryUsageChart />
          </cds-tile-below-the-fold-content>
        </cds-expandable-tile>
      </div>

      <div class="cds--css-grid-column cds--sm:col-span-4 cds--md:col-span-4 cds--lg:col-span-4">
        <cds-expandable-tile
          expanded={expandStates[1]}
          on:cds-expandable-tile-toggled={(event: CustomEvent) => handleChartClick(event, 1)}
        >
          <cds-tile-above-the-fold-content>
            <RealtimeCpuChart />
          </cds-tile-above-the-fold-content>
          <cds-tile-below-the-fold-content>
            <ProcessRealtimeCpuUsageChart />
          </cds-tile-below-the-fold-content>
        </cds-expandable-tile>
      </div>

      <div class="cds--css-grid-column cds--sm:col-span-4 cds--md:col-span-8 cds--lg:col-span-8">
        <cds-tile>
          <RealtimeDiskIoChart />
        </cds-tile>
      </div>

      <div class="cds--css-grid-column cds--sm:col-span-4 cds--md:col-span-4 cds--lg:col-span-4">
        <cds-tile>
          <RealtimeDiskChart />
        </cds-tile>
      </div>
    </div>
  );
}

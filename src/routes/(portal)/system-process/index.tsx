import {
  ProcessRealtimeMemoryUsageChart,
  ProcessRealtimeCpuUsageChart
} from "../../../lib/components/charts";
import { modifyCollectStat } from "../../../lib/http-interface/server-send-event";
import { debounce } from "@siaikin/utils";
import { handleInput } from "../../../lib/utils/felte-utils";
import { createEffect, Match, on, Switch } from "solid-js";
import { createForm } from "@felte/solid";

import "./styles.scss";

export default function Index() {
  const handleModifyProcessCollectStat = debounce(
    (sortField: string, max: number) =>
      modifyCollectStat({
        system: { enable: false },
        process: { enable: true, sortField, max }
      }),
    250
  );

  const {
    form: controlForm,
    data: controlFormData,
    handleSubmit: handleControlFormSubmit,
    setData: setControlFormData
  } = createForm({
    onSubmit: async () => {
      handleModifyProcessCollectStat(controlFormData().sortBy, controlFormData().refreshInterval);
    },
    initialValues: {
      refreshInterval: 16,
      sortBy: "memoryUsage"
    }
  });
  createEffect(on(controlFormData, () => handleControlFormSubmit()));

  return (
    <div class="system-process-container flex flex-col h-full">
      <div class="flex-none">
        <form class="control-form flex items-center" use:controlForm>
          <span class="flex-1" />
          <cds-form-item class="flex-none">
            <cds-slider
              label-text={`Top ${controlFormData().refreshInterval}`}
              min={1}
              max={60}
              value={controlFormData().refreshInterval}
              on:cds-slider-changed={(event: CustomEvent) =>
                handleInput({ name: "refreshInterval", setter: setControlFormData }, event)
              }
            >
              <cds-slider-input type="number" />
            </cds-slider>
          </cds-form-item>
          <cds-form-item class="flex-none">
            <cds-select
              label-text="Sort by"
              value={controlFormData().sortBy}
              onInput={[handleInput, { name: "sortBy", setter: setControlFormData }]}
            >
              <cds-select-item value="memoryUsage">Memory usage</cds-select-item>
              <cds-select-item value="cpuUsage">Cpu usage</cds-select-item>
              <cds-select-item value="networkUsage">Network usage</cds-select-item>
            </cds-select>
          </cds-form-item>
        </form>
      </div>

      <div class="flex-auto">
        <cds-tile class="h-full w-full">
          <Switch>
            <Match when={controlFormData().sortBy === "memoryUsage"}>
              <ProcessRealtimeMemoryUsageChart />
            </Match>
            <Match when={controlFormData().sortBy === "cpuUsage"}>
              <ProcessRealtimeCpuUsageChart />
            </Match>
          </Switch>
        </cds-tile>
      </div>
    </div>
  );
}

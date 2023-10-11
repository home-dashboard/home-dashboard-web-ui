import { Wakapi } from "../../../lib/third-party";
import { BreakpointsContext, ConfigurationContext } from "../../../lib/contextes";
import { formatDuration } from "../../../lib/utils/format-duration";
import { typeIsString } from "@siaikin/utils";
import { createEffect, createMemo, For, on, onMount, Show } from "solid-js";
import { Icon } from "@iconify-icon/solid";
import { createForm } from "@felte/solid";
import { handleInput } from "../../../lib/utils/felte-utils";

export default function WakapiGrid() {
  const [stats, { refresh }] = Wakapi.StatsContext.useContext();
  const [configuration] = ConfigurationContext.useContext();

  const [, { largerThan }] = BreakpointsContext.useContext();

  const url = new URL(configuration().current.configuration.serverMonitor.thirdParty.wakapi.apiUrl);
  url.pathname = "";
  const wakapiHost = url.toString();

  const wakapiHumanReadableTime = createMemo(() => formatDuration(stats().total_seconds));

  const {
    form: controlForm,
    data: controlFormData,
    handleSubmit: handleControlFormSubmit,
    setData: setControlFormData
  } = createForm({
    onSubmit: async () => {
      refresh(controlFormData().range, { project: controlFormData().project });
    },
    initialValues: { range: Wakapi.StatsRange.ALL_TIME, max: 5, project: "" }
  });
  // 仅在 range, project 变化时触发提交
  const range = createMemo(() => controlFormData().range);
  const project = createMemo(() => controlFormData().project);
  createEffect(on([range, project], () => handleControlFormSubmit()));
  // 设置一次 range 以触发刷新
  onMount(() => setControlFormData("range", Wakapi.StatsRange.TODAY));

  const wakapiTitle = createMemo(() =>
    typeIsString(controlFormData().project) ? controlFormData().project : "Wakapi"
  );

  const setProject = (project: string) => {
    if (project === controlFormData().project) return;
    setControlFormData("project", project);
  };
  const handleProjectClick = (event: CustomEvent) => {
    // 已选择了 project 时不再处理
    if (controlFormData().project) return;

    const group = event?.detail?.datum?.data?.group;

    if (!typeIsString(group)) return;

    setProject(group);
  };

  return (
    <div class="wakapi-grid cds--css-grid cds--css-grid--condensed">
      <div class="cds--css-grid-column cds--sm:col-span-4 cds--md:col-span-8 cds--lg:col-span-16">
        <form class="control-form" use:controlForm>
          <cds-link href={wakapiHost} target="_blank">
            <Icon width={32} height={32} icon="simple-icons:wakatime" title="Power by Wakapi" />
          </cds-link>
          <header class="flex-auto w-0">
            <h4 class="truncate" title={wakapiTitle()}>
              {wakapiTitle()}
            </h4>
            <p class="truncate" title={wakapiHumanReadableTime()}>
              {wakapiHumanReadableTime()}
            </p>
          </header>

          <Show when={largerThan("sm")}>
            <cds-form-item class="flex-none">
              <cds-slider
                label-text={`Maximum display ${controlFormData().max} items (0 for unlimited)`}
                min={0}
                max={60}
                value={controlFormData().max}
                on:cds-slider-changed={(event: CustomEvent) =>
                  handleInput({ name: "max", setter: setControlFormData }, event)
                }
              >
                <cds-slider-input type="number" />
              </cds-slider>
            </cds-form-item>
            <cds-form-item class="flex-none">
              <cds-select
                label-text="Range"
                on:cds-select-selected={(event: CustomEvent) =>
                  handleInput({ name: "range", setter: setControlFormData }, event)
                }
              >
                <For each={Object.entries(Wakapi.StatsRange)}>
                  {([rangeTypeKey, rangeTypeValue]) => (
                    <cds-select-item
                      value={rangeTypeValue}
                      label={rangeTypeKey}
                      selected={rangeTypeValue === controlFormData().range}
                    />
                  )}
                </For>
              </cds-select>
            </cds-form-item>
            <cds-overflow-menu class="flex-none self-end">
              <Icon slot="icon" icon="carbon:overflow-menu-vertical" />
              <span slot="tooltip-content">More options</span>

              <cds-overflow-menu-body>
                <cds-overflow-menu-item href="/third-party/wakapi">History</cds-overflow-menu-item>
              </cds-overflow-menu-body>
            </cds-overflow-menu>
          </Show>
        </form>
      </div>

      <div class="cds--css-grid-column cds--sm:col-span-4 cds--md:col-span-8 cds--lg:col-span-16">
        <div class="cds--subgrid">
          <div class="cds--css-grid-column cds--sm:col-span-4 cds--md:col-span-4 cds--lg:col-span-8 cds--xlg:col-span-8">
            <div
              class="cds--aspect-ratio"
              classList={{
                "cds--aspect-ratio--1x1": largerThan("sm"),
                "cds--aspect-ratio--2x1": !largerThan("sm")
              }}
            >
              <cds-tile class="h-full w-full absolute">
                <Wakapi.ChartTag
                  filter={typeIsString(controlFormData().project)}
                  position={Wakapi.ChartTagPosition.TOP_LEFT}
                  type="high-contrast"
                  on:cds-tag-beingclosed={(event: CustomEvent) => (
                    event.preventDefault(), setProject("")
                  )}
                >
                  {controlFormData().project ? "Branches" : "Projects"}
                </Wakapi.ChartTag>
                <Wakapi.StatChart
                  type={
                    controlFormData().project
                      ? Wakapi.ChartType.BRANCHES
                      : Wakapi.ChartType.PROJECTS
                  }
                  max={controlFormData().max}
                  legend={{ enabled: largerThan("sm") }}
                  pie={{ labels: { enabled: !largerThan("sm") } }}
                  onSliceClick={handleProjectClick}
                />
              </cds-tile>
            </div>
          </div>
          <Show when={largerThan("sm")}>
            <div class="cds--css-grid-column cds--sm:col-span-4 cds--md:col-span-4 cds--lg:col-span-8 cds--xlg:col-span-8">
              <div class="wakapi__subgrid cds--subgrid">
                <div class="cds--css-grid-column cds--sm:col-span-1 cds--md:col-span-2 cds--lg:col-span-4">
                  <div class="cds--aspect-ratio cds--aspect-ratio--1x1">
                    <cds-tile class="h-full w-full absolute">
                      <Wakapi.ChartTag
                        position={Wakapi.ChartTagPosition.BOTTOM_RIGHT}
                        size="sm"
                        type="high-contrast"
                      >
                        Languages
                      </Wakapi.ChartTag>
                      <Wakapi.StatChart
                        type={Wakapi.ChartType.LANGUAGES}
                        pie={{ labels: { enabled: true } }}
                        max={controlFormData().max}
                        class="h-full"
                      />
                    </cds-tile>
                  </div>
                </div>
                <div class="cds--css-grid-column cds--sm:col-span-1 cds--md:col-span-2 cds--lg:col-span-4">
                  <div class="cds--aspect-ratio cds--aspect-ratio--1x1">
                    <cds-tile class="h-full w-full absolute">
                      <Wakapi.ChartTag
                        position={Wakapi.ChartTagPosition.BOTTOM_LEFT}
                        size="sm"
                        type="high-contrast"
                      >
                        Editors
                      </Wakapi.ChartTag>
                      <Wakapi.StatChart
                        type={Wakapi.ChartType.EDITORS}
                        pie={{ labels: { enabled: true } }}
                        max={controlFormData().max}
                        class="h-full"
                      />
                    </cds-tile>
                  </div>
                </div>
                <div class="cds--css-grid-column cds--sm:col-span-1 cds--md:col-span-2 cds--lg:col-span-4">
                  <div class="cds--aspect-ratio cds--aspect-ratio--1x1">
                    <cds-tile class="h-full w-full absolute">
                      <Wakapi.ChartTag
                        position={Wakapi.ChartTagPosition.TOP_RIGHT}
                        size="sm"
                        type="high-contrast"
                      >
                        Operating Systems
                      </Wakapi.ChartTag>
                      <Wakapi.StatChart
                        type={Wakapi.ChartType.OPERATING_SYSTEMS}
                        pie={{ labels: { enabled: true } }}
                        max={controlFormData().max}
                        class="h-full"
                      />
                    </cds-tile>
                  </div>
                </div>
                <div class="cds--css-grid-column cds--sm:col-span-1 cds--md:col-span-2 cds--lg:col-span-4">
                  <div class="cds--aspect-ratio cds--aspect-ratio--1x1">
                    <cds-tile class="h-full w-full absolute">
                      <Wakapi.ChartTag
                        position={Wakapi.ChartTagPosition.TOP_LEFT}
                        size="sm"
                        type="high-contrast"
                      >
                        Machines
                      </Wakapi.ChartTag>
                      <Wakapi.StatChart
                        type={Wakapi.ChartType.MACHINES}
                        pie={{ labels: { enabled: true } }}
                        max={controlFormData().max}
                        class="h-full"
                      />
                    </cds-tile>
                  </div>
                </div>
              </div>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
}

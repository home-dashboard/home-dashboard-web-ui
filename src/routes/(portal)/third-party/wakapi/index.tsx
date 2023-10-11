import { Wakapi } from "../../../../lib/third-party";
import startOfDay from "date-fns/startOfDay";
import endOfDay from "date-fns/endOfDay";
import formatISO from "date-fns/formatISO";
import { typeIsString } from "@siaikin/utils";
import { createForm } from "@felte/solid";
import { createEffect, createSignal, For, on } from "solid-js";
import { handleInput } from "../../../../lib/utils/felte-utils";
import { Icon } from "@iconify-icon/solid";
import subMonths from "date-fns/subMonths";
import { SearchModal } from "./search-modal";
import { createRouteData } from "solid-start";

import "./styles.scss";

/*************** Wakapi 数据的过滤参数 ***************/
const defaultFilterFormData: Omit<Wakapi.SummariesQueryParams, "start" | "end"> & {
  end: Date;
  start: Date;
  isSpecifiedDate: boolean;
} = {
  project: "",
  language: "",
  editor: "",
  branch: "",
  machine: "",
  operating_system: "",
  range: Wakapi.StatsRange.LAST_30_DAYS,
  start: new Date(),
  end: subMonths(new Date(), 1),
  isSpecifiedDate: false
} as const;

export function routeData() {
  return createRouteData(async () => {
    const [summaries, { refreshAndWait: summariesRefreshAndWait }] =
      Wakapi.SummariesContext.useContext();
    const [stats, { refreshAndWait: statsRefreshAndWait }] = Wakapi.StatsContext.useContext();
    await Promise.all([
      summariesRefreshAndWait(defaultFilterFormData.range, {}),
      statsRefreshAndWait(Wakapi.StatsRange.ALL_TIME, {})
    ]);
    return { summaries, stats };
  });
}

export default function Index() {
  const [, { refresh }] = Wakapi.SummariesContext.useContext();

  const handleModifySummariesQueryParams = (formData: typeof defaultFilterFormData) => {
    if (formData.isSpecifiedDate) {
      refresh(
        {
          start: startOfDay(formData.start).getTime(),
          end: endOfDay(formData.end).getTime()
        },
        formData
      );
    } else {
      refresh(formData.range, formData);
    }
  };

  /**************** 查询表单弹框 ***************/
  const [searchFormModalOpened, setSearchFormModalOpened] = createSignal(false);
  const [searchFormData, setSearchFormData] = createSignal(defaultFilterFormData);
  createEffect(on(searchFormData, () => handleModifySummariesQueryParams(searchFormData())));

  const {
    form: controlForm,
    data: controlFormData,
    // handleSubmit: handleControlFormSubmit,
    setData: setControlFormData
  } = createForm({
    onSubmit: async () => {},
    initialValues: { type: Wakapi.ChartType.PROJECTS }
  });
  createEffect(() => {
    if (
      typeIsString(searchFormData().project) &&
      controlFormData().type === Wakapi.ChartType.PROJECTS
    ) {
      setControlFormData({ type: Wakapi.ChartType.BRANCHES });
    }
  });

  return (
    <>
      <div class="wakapi-container flex flex-col h-full">
        <div class="flex-none">
          <form class="control-form" use:controlForm>
            <cds-form-item class="flex-none">
              <cds-select
                label-text="Type"
                on:cds-select-selected={(event: CustomEvent) =>
                  handleInput({ name: "type", setter: setControlFormData }, event)
                }
              >
                <For each={Object.entries(Wakapi.ChartType)}>
                  {([chartTypeKey, chartTypeValue]) => {
                    //   根据项目过滤时, 隐藏 Wakapi.ChartType.PROJECTS 选项并显示 Wakapi.ChartType.BRANCHES 选项
                    switch (chartTypeValue) {
                      case Wakapi.ChartType.PROJECTS:
                        if (typeIsString(searchFormData().project)) return;
                        break;
                      case Wakapi.ChartType.BRANCHES:
                        if (!typeIsString(searchFormData().project)) return;
                        break;
                      case Wakapi.ChartType.EDITORS:
                        if (typeIsString(searchFormData().editor)) return;
                        break;
                      case Wakapi.ChartType.LANGUAGES:
                        if (typeIsString(searchFormData().language)) return;
                        break;
                      case Wakapi.ChartType.MACHINES:
                        if (typeIsString(searchFormData().machine)) return;
                        break;
                      case Wakapi.ChartType.OPERATING_SYSTEMS:
                        if (typeIsString(searchFormData().operating_system)) return;
                        break;
                    }
                    return (
                      <cds-select-item
                        value={chartTypeValue}
                        label={chartTypeKey}
                        selected={chartTypeValue === controlFormData().type}
                      />
                    );
                  }}
                </For>
              </cds-select>
            </cds-form-item>

            <cds-form-item class="flex-none">
              <cds-form-group legend-text="Filter Wakapi data">
                <div class="flex">
                  <div class="shortcut__content">
                    <div class="flex">
                      <For
                        each={
                          searchFormData().isSpecifiedDate
                            ? (["start", "end"] as const)
                            : (["range"] as const)
                        }
                      >
                        {(key) => (
                          <cds-tag
                            size="sm"
                            style={{
                              "margin-top": "0",
                              "margin-bottom": "0",
                              "min-height": "1rem"
                            }}
                          >
                            {key}:
                            <strong>
                              {searchFormData().isSpecifiedDate
                                ? formatISO(searchFormData()?.[key] as unknown as Date, {
                                    representation: "date"
                                  })
                                : (searchFormData()?.[key] as string)}
                            </strong>
                          </cds-tag>
                        )}
                      </For>
                    </div>
                    <div>
                      <For
                        each={
                          [
                            "project",
                            "language",
                            "editor",
                            "branch",
                            "machine",
                            "operating_system"
                          ] as const
                        }
                      >
                        {(key) => {
                          if (searchFormData()?.[key]) {
                            return (
                              <cds-tag
                                filter=""
                                on:cds-tag-closed={(event: CustomEvent) =>
                                  handleInput({ name: key, setter: setSearchFormData }, event)
                                }
                              >
                                {key}:<strong>{searchFormData()?.[key]}</strong>
                              </cds-tag>
                            );
                          }
                        }}
                      </For>
                    </div>
                  </div>
                  <cds-button size="md" on:click={() => setSearchFormModalOpened(true)}>
                    <Icon slot="icon" icon="carbon:filter" />
                  </cds-button>
                </div>
              </cds-form-group>
            </cds-form-item>
          </form>
        </div>

        <div class="flex-auto">
          <cds-tile class="h-full w-full">
            <Wakapi.SummaryChart class="summary-chart" type={controlFormData().type} />
          </cds-tile>
        </div>
      </div>

      <SearchModal
        formData={searchFormData()}
        open={searchFormModalOpened()}
        onConform={(formData) => setSearchFormData(formData)}
        onClose={() => setSearchFormModalOpened(false)}
      />
    </>
  );
}

import { Wakapi } from "../../../../lib/third-party";
import { createEffect, For, Show, VoidProps } from "solid-js";
import { handleCDSInput, handleInput } from "../../../../lib/utils/felte-utils";
import subMonths from "date-fns/subMonths";
import format from "date-fns/format";
import { createForm } from "@felte/solid";
import { typeIsDate } from "@siaikin/utils";

type FormData = Omit<Wakapi.SummariesQueryParams, "start" | "end"> & {
  end: Date;
  start: Date;
  isSpecifiedDate: boolean;
};

export function SearchModal(
  props: VoidProps<{
    formData: FormData;
    open: boolean;
    onConform: (data: FormData) => void;
    onClose: () => void;
  }>
) {
  const [stats] = Wakapi.StatsContext.useContext();

  const {
    form: searchForm,
    data: searchFormData,
    handleSubmit: handleSearchFormSubmit,
    setData: setSearchFormData,
    reset: resetSearchFormData
  } = createForm({
    onSubmit: async (values) => props.onConform(values),
    initialValues: props.formData
  });

  createEffect(() => setSearchFormData(props.formData));

  return (
    <cds-modal open={props.open} on:cds-modal-closed={() => props.onClose()}>
      <cds-modal-header>
        <cds-modal-close-button />
        <cds-modal-heading>Filter Wakapi Summary</cds-modal-heading>
      </cds-modal-header>
      <cds-modal-body>
        {/*<cds-modal-body-content description="">*/}
        {/*  Custom domains direct requests for your apps in this Cloud Foundry organization to a URL*/}
        {/*  that you own. A custom domain can be a shared domain, a shared subdomain, or a shared*/}
        {/*  domain and host.*/}
        {/*</cds-modal-body-content>*/}
        <form use:searchForm>
          <cds-stack gap={4}>
            <cds-form-item>
              <Show
                when={searchFormData().isSpecifiedDate}
                fallback={
                  <cds-select
                    data-modal-primary-focus=""
                    label-text="Time Range"
                    onInput={[handleInput, { name: "range", setter: setSearchFormData }]}
                  >
                    <For
                      each={[
                        Wakapi.StatsRange.LAST_7_DAYS,
                        Wakapi.StatsRange.LAST_30_DAYS,
                        Wakapi.StatsRange.LAST_6_MONTHS,
                        Wakapi.StatsRange.LAST_12_MONTHS,
                        Wakapi.StatsRange.LAST_YEAR
                      ]}
                    >
                      {(item) => (
                        <cds-select-item
                          value={item}
                          label={item}
                          selected={searchFormData().range === item}
                        />
                      )}
                    </For>
                  </cds-select>
                }
              >
                <cds-date-picker
                  allow-input={false}
                  enabled-range=""
                  on:cds-date-picker-changed={(event: CustomEvent) => {
                    const [start, end] = event.detail.selectedDates as [Date, Date];
                    if (typeIsDate(start)) setSearchFormData("start", start);
                    if (typeIsDate(end)) setSearchFormData("end", end);
                  }}
                >
                  <cds-date-picker-input
                    data-modal-primary-focus=""
                    kind="from"
                    label-text="Start date"
                    value={format(searchFormData().start, "M/d/y")}
                  />
                  <cds-date-picker-input
                    kind="to"
                    label-text="End date"
                    value={format(searchFormData().end, "M/d/y")}
                  />
                </cds-date-picker>
              </Show>
              <cds-checkbox
                label-text="Specified Date"
                on:cds-checkbox-changed={(event: CustomEvent) => {
                  handleCDSInput({ name: "isSpecifiedDate", setter: setSearchFormData }, event);

                  if (searchFormData().isSpecifiedDate) {
                    setSearchFormData("end", new Date());
                    setSearchFormData("start", subMonths(new Date(), 1));
                  } else {
                    setSearchFormData("range", Wakapi.StatsRange.LAST_30_DAYS);
                  }
                }}
              />
            </cds-form-item>

            <cds-form-item>
              <cds-select
                label-text="Project"
                placeholder="Select a Project"
                value={searchFormData().project}
                onInput={[handleInput, { name: "project", setter: setSearchFormData }]}
              >
                <For each={stats().projects}>
                  {(project) => <cds-select-item value={project.name} label={project.name} />}
                </For>
              </cds-select>
            </cds-form-item>

            <cds-form-item>
              <cds-select
                label-text="Language"
                placeholder="Select a Language"
                value={searchFormData().language}
                onInput={[handleInput, { name: "language", setter: setSearchFormData }]}
              >
                <For each={stats().languages}>
                  {(language) => <cds-select-item value={language.name} label={language.name} />}
                </For>
              </cds-select>
            </cds-form-item>

            <cds-form-item>
              <cds-select
                label-text="Editor"
                placeholder="Select a Editor"
                value={searchFormData().editor}
                onInput={[handleInput, { name: "editor", setter: setSearchFormData }]}
              >
                <For each={stats().editors}>
                  {(editor) => <cds-select-item value={editor.name} label={editor.name} />}
                </For>
              </cds-select>
            </cds-form-item>

            <cds-form-item>
              <cds-select
                label-text="Machine"
                placeholder="Select a Machine"
                value={searchFormData().machine}
                onInput={[handleInput, { name: "machine", setter: setSearchFormData }]}
              >
                <For each={stats().machines}>
                  {(machine) => <cds-select-item value={machine.name} label={machine.name} />}
                </For>
              </cds-select>
            </cds-form-item>

            <cds-form-item>
              <cds-select
                label-text="Operating System"
                placeholder="Select a Operating System"
                value={searchFormData().operating_system}
                onInput={[handleInput, { name: "operating_system", setter: setSearchFormData }]}
              >
                <For each={stats().operating_systems}>
                  {(operating_system) => (
                    <cds-select-item value={operating_system.name} label={operating_system.name} />
                  )}
                </For>
              </cds-select>
            </cds-form-item>
          </cds-stack>
        </form>
      </cds-modal-body>

      <cds-modal-footer>
        <cds-modal-footer-button kind="secondary" onClick={() => props.onClose()}>
          Cancel
        </cds-modal-footer-button>
        <cds-modal-footer-button kind="secondary" onClick={() => resetSearchFormData()}>
          Reset
        </cds-modal-footer-button>
        <cds-modal-footer-button
          kind="primary"
          onClick={() => {
            handleSearchFormSubmit();
            props.onClose();
          }}
        >
          Confirm
        </cds-modal-footer-button>
      </cds-modal-footer>
    </cds-modal>
  );
}

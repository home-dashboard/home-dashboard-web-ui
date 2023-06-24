<script lang="ts">
  import {
    Column,
    Grid,
    Row,
    Tile,
    Form,
    Select,
    SelectItem,
    Modal,
    FormGroup,
    Button,
    DatePicker,
    DatePickerInput,
    Checkbox,
    Tag,
  } from "carbon-components-svelte";
  import FilterIcon from "carbon-icons-svelte/lib/Filter.svelte";
  import { mounted } from "$lib/stores/lifecycle";
  import { Wakapi } from "$lib/third-party";
  import type { SummariesQueryParams } from "$lib/third-party/wakapi";
  import startOfDay from "date-fns/startOfDay";
  import endOfDay from "date-fns/endOfDay";
  import subMonths from "date-fns/subMonths";
  import formatISO from "date-fns/formatISO";
  import { clone, typeIsString } from "@siaikin/utils";

  import "./+page.scss";

  const { summariesStoreRefresh, SummaryChart, statsStore } = Wakapi;
  const isMounted = mounted();
  const handleModifySummariesQueryParams = (formData: typeof defaultFilterFormData) => {
    if (formData.isSpecifiedDate)
      summariesStoreRefresh(
        {
          start: startOfDay(new Date(formData.start)).getTime(),
          end: endOfDay(new Date(formData.end)).getTime(),
        },
        formData
      );
    else summariesStoreRefresh(formData.range, formData);
  };

  $: allTimeStats = $statsStore;
  $: $isMounted && Wakapi.statsStoreRefresh(Wakapi.StatsRange.ALL_TIME);

  /*************** Wakapi 数据的过滤参数 ***************/
  const defaultFilterFormData: SummariesQueryParams & {
    isSpecifiedDate: boolean;
  } = {
    project: "",
    language: "",
    editor: "",
    branch: "",
    machine: "",
    operating_system: "",
    range: Wakapi.StatsRange.LAST_30_DAYS,
    start: 0,
    end: 0,
    isSpecifiedDate: false,
  };
  let filterFormData = clone(defaultFilterFormData);
  $: {
    if ($isMounted) handleModifySummariesQueryParams(filterFormData);
  }

  /**************** 查询表单弹框 ***************/
  let isSearchFormModalOpened = false;
  let searchFormModalData = clone(filterFormData);

  const chartOptions = {
    type: Wakapi.ChartType.PROJECTS,
  };
  $: {
    if (typeIsString(filterFormData.project) && chartOptions.type === Wakapi.ChartType.PROJECTS) {
      chartOptions.type = Wakapi.ChartType.BRANCHES;
    }
  }
</script>

<div class="wakapi-container">
  <Form class="control-form">
    <Select labelText="Type" bind:selected="{chartOptions.type}">
      {#each Object.keys(Wakapi.ChartType) as chartTypeKey}
        {@const chartType = Wakapi.ChartType[chartTypeKey]}
        <!-- 根据项目过滤时, 隐藏 Wakapi.ChartType.PROJECTS 选项并显示 Wakapi.ChartType.BRANCHES 选项 -->
        {#if (chartType === Wakapi.ChartType.PROJECTS && !typeIsString(filterFormData.project)) || (chartType === Wakapi.ChartType.BRANCHES && typeIsString(filterFormData.project)) || (chartType === Wakapi.ChartType.EDITORS && !typeIsString(filterFormData.editor)) || (chartType === Wakapi.ChartType.LANGUAGES && !typeIsString(filterFormData.language)) || (chartType === Wakapi.ChartType.MACHINES && !typeIsString(filterFormData.machine)) || (chartType === Wakapi.ChartType.OPERATING_SYSTEMS && !typeIsString(filterFormData.operating_system))}
          <SelectItem value="{chartType}" text="{chartType}" />
        {/if}
      {/each}
    </Select>

    <FormGroup legendText="Filter Wakapi data" class="wakapi-search-form__shortcut">
      <div class="shortcut__content">
        <div style="display: flex">
          {#each filterFormData.isSpecifiedDate ? ["start", "end"] : ["range"] as key}
            <Tag size="sm" style="margin-top: 0; margin-bottom: 0;min-height: 1rem">
              {key}:
              <strong
                >{filterFormData.isSpecifiedDate
                  ? formatISO(filterFormData[key], { representation: "date" })
                  : filterFormData[key]}</strong
              >
            </Tag>
          {/each}
        </div>
        <div>
          {#each ["project", "language", "editor", "branch", "machine", "operating_system"] as key}
            {#if filterFormData[key]}
              <Tag filter on:close="{() => (filterFormData[key] = '')}">
                {key}: <strong>{filterFormData[key]}</strong>
              </Tag>
            {/if}
          {/each}
        </div>
      </div>

      <Button
        class="shortcut__filter-button"
        icon="{FilterIcon}"
        iconDescription="Filter wakapi data"
        tooltipPosition="bottom"
        tooltipAlignment="end"
        on:click="{() => (isSearchFormModalOpened = true)}"
      />
    </FormGroup>
  </Form>

  <Grid fullWidth padding noGutter class="chart-container">
    <Row class="summary-chart-row">
      <Column>
        <Tile class="summary-chart-tile">
          <SummaryChart class="summary-chart" type="{chartOptions.type}" />
        </Tile>
      </Column>
    </Row>
  </Grid>
</div>

<Modal
  bind:open="{isSearchFormModalOpened}"
  modalHeading="Filter Wakapi data"
  primaryButtonText="Confirm"
  secondaryButtons="{[{ text: 'Cancel' }, { text: 'Reset' }]}"
  selectorPrimaryFocus="#search-form__project-select"
  on:click:button--secondary="{({ detail }) => {
    isSearchFormModalOpened = false;
    switch (detail.text) {
      case 'Reset':
        filterFormData = clone(defaultFilterFormData);
        break;
    }
  }}"
  on:click:button--primary="{() => {
    isSearchFormModalOpened = false;
    filterFormData = searchFormModalData;
    handleModifySummariesQueryParams(filterFormData);
  }}"
  on:open="{() => (searchFormModalData = clone(filterFormData))}"
>
  <Form style="min-height: 512px">
    <FormGroup>
      {#if searchFormModalData.isSpecifiedDate}
        <DatePicker
          id="specified-date"
          datePickerType="range"
          maxDate="{new Date()}"
          flatpickrProps="{{ allowInput: false }}"
          bind:valueFrom="{searchFormModalData.start}"
          bind:valueTo="{searchFormModalData.end}"
        >
          <DatePickerInput labelText="Start date" />
          <DatePickerInput labelText="End date" />
        </DatePicker>
      {:else}
        <Select labelText="Time Range" bind:selected="{searchFormModalData.range}">
          {#each [Wakapi.StatsRange.LAST_7_DAYS, Wakapi.StatsRange.LAST_30_DAYS, Wakapi.StatsRange.LAST_6_MONTHS, Wakapi.StatsRange.LAST_12_MONTHS, Wakapi.StatsRange.LAST_YEAR] as range}
            <SelectItem value="{range}" text="{range}" />
          {/each}
        </Select>
      {/if}
      <Checkbox
        labelText="Specified Date"
        bind:checked="{searchFormModalData.isSpecifiedDate}"
        on:check="{(check) => {
          if (check)
            searchFormModalData.start = subMonths(
              (searchFormModalData.end = new Date().getTime()),
              1
            ).getTime();
          else searchFormModalData.range = Wakapi.StatsRange.LAST_30_DAYS;
        }}"
      />
    </FormGroup>

    <FormGroup>
      <Select
        id="search-form__project-select"
        labelText="Project"
        bind:selected="{searchFormModalData.project}"
      >
        <SelectItem value="" disabled hidden text="Select a Project" />
        {#each allTimeStats.projects as project}
          <SelectItem value="{project.name}" text="{project.name}" />
        {/each}
      </Select>
    </FormGroup>

    <FormGroup>
      <Select labelText="Language" bind:selected="{searchFormModalData.language}">
        <SelectItem value="" disabled hidden text="Select a Language" />
        {#each allTimeStats.languages as language}
          <SelectItem value="{language.name}" text="{language.name}" />
        {/each}
      </Select>
    </FormGroup>

    <FormGroup>
      <Select labelText="Editor" bind:selected="{searchFormModalData.editor}">
        <SelectItem value="" disabled hidden text="Select a Editor" />
        {#each allTimeStats.editors as editor}
          <SelectItem value="{editor.name}" text="{editor.name}" />
        {/each}
      </Select>
    </FormGroup>

    <FormGroup>
      <Select labelText="Machine" bind:selected="{searchFormModalData.machine}">
        <SelectItem value="" disabled hidden text="Select a Machine" />
        {#each allTimeStats.machines as machine}
          <SelectItem value="{machine.name}" text="{machine.name}" />
        {/each}
      </Select>
    </FormGroup>

    <FormGroup>
      <Select labelText="Operating System" bind:selected="{searchFormModalData.operating_system}">
        <SelectItem value="" disabled hidden text="Select a Operating System" />
        {#each allTimeStats.operating_systems as operating_system}
          <SelectItem value="{operating_system.name}" text="{operating_system.name}" />
        {/each}
      </Select>
    </FormGroup>
  </Form>
</Modal>

<style lang="scss">
  .wakapi-container {
    height: 100%;
  }
</style>

<script lang="ts">
  import {
    Column,
    Form,
    Grid,
    ImageLoader,
    Link,
    Row,
    Select,
    SelectItem,
    Slider,
    Tile,
    Truncate,
    truncate,
    breakpointObserver,
    AspectRatio,
    OverflowMenu,
    OverflowMenuItem,
  } from "carbon-components-svelte";
  import { Wakapi } from "../../lib/third-party";
  import { formatDuration } from "../../lib/utils/format-duration";
  import { ConfigurationStore as configuration, mounted } from "../../lib/stores";
  import { typeIsString } from "@siaikin/utils";

  import WakapiLogo from "$lib/assets/images/wakapi-logo.png";
  import { base } from "$app/paths";

  const { StatChart, ChartTag, statsStoreRefresh, statsStore } = Wakapi;

  const size = breakpointObserver();
  const largerThanSm = size.largerThan("sm");
  const isMounted = mounted();

  const url = new URL($configuration.current.configuration.serverMonitor.thirdParty.wakapi.apiUrl);
  url.pathname = "";
  const wakapiHost = url.toString();

  $: wakapiHumanReadableTime = formatDuration($statsStore.total_seconds);

  const controlFormData = {
    range: Wakapi.StatsRange.TODAY,
    max: 5,
    project: "",
  };
  $: wakapiTitle = typeIsString(controlFormData.project) ? controlFormData.project : "Wakapi";
  $: {
    if ($isMounted) statsStoreRefresh(controlFormData.range, { project: controlFormData.project });
  }

  const handleProjectClick = (event) => {
    const group = event?.detail?.datum?.data?.group;

    if (!typeIsString(group)) return;

    setProject(group);
  };

  const setProject = (project?: string) => {
    if (project === controlFormData.project) return;
    controlFormData.project = project;
  };
</script>

<Grid condensed class="wakapi-grid">
  <Row>
    <Column sm="{4}" md="{8}" lg="{16}">
      <Form class="control-form">
        <Link href="{wakapiHost}" target="_blank" style="margin-left: 0.5rem">
          <ImageLoader fadeIn alt="Power by Wakapi" style="width: 2rem" src="{WakapiLogo}" />
        </Link>
        <header style="flex: 1 1 auto; width: 0">
          <h4 use:truncate title="{wakapiTitle}">{wakapiTitle}</h4>
          <Truncate title="{wakapiHumanReadableTime}">{wakapiHumanReadableTime}</Truncate>
        </header>

        {#if $largerThanSm}
          <Slider
            labelText="{`Maximum display ${controlFormData.max} items (0 for unlimited)`}"
            min="{0}"
            max="{60}"
            bind:value="{controlFormData.max}"
          />
          <Select labelText="Range" bind:selected="{controlFormData.range}">
            {#each Object.keys(Wakapi.StatsRange) as range}
              <SelectItem value="{Wakapi.StatsRange[range]}" text="{Wakapi.StatsRange[range]}" />
            {/each}
          </Select>
          <OverflowMenu class="control-form__overflow-menu-button">
            <OverflowMenuItem text="History" href="{`${base}/third-party/wakapi`}" />
          </OverflowMenu>
        {/if}
      </Form>
    </Column>
  </Row>

  <Row>
    <Column sm="{4}" md="{4}" lg="{8}" xlg="{8}">
      <AspectRatio ratio="{$largerThanSm ? '1x1' : '2x1'}">
        <Tile class="wakapi-tile">
          <ChartTag
            filter="{typeIsString(controlFormData.project)}"
            position="{Wakapi.ChartTagPosition.TOP_LEFT}"
            type="high-contrast"
            on:close="{() => setProject('')}"
            >{controlFormData.project ? "Branches" : "Projects"}</ChartTag
          >
          <StatChart
            type="{controlFormData.project ? Wakapi.ChartType.BRANCHES : Wakapi.ChartType.PROJECTS}"
            max="{controlFormData.max}"
            legend="{{ enabled: $largerThanSm }}"
            pie="{{ labels: { enabled: !$largerThanSm } }}"
            on:pie-slice-click="{typeIsString(controlFormData.project) ? null : handleProjectClick}"
            class="wakapi-chart"
          />
        </Tile>
      </AspectRatio>
    </Column>
    {#if $largerThanSm}
      <Column sm="{4}" md="{4}" lg="{8}" xlg="{8}">
        <Grid condensed>
          <Row>
            <Column sm="{2}" md="{4}" lg="{8}">
              <AspectRatio ratio="1x1">
                <Tile class="wakapi-tile">
                  <ChartTag
                    position="{Wakapi.ChartTagPosition.BOTTOM_RIGHT}"
                    size="sm"
                    type="high-contrast"
                    >Languages
                  </ChartTag>
                  <StatChart
                    type="{Wakapi.ChartType.LANGUAGES}"
                    pie="{{ labels: { enabled: true } }}"
                    max="{controlFormData.max}"
                    class="wakapi-chart__sub-chart"
                  />
                </Tile>
              </AspectRatio>
            </Column>
            <Column sm="{2}" md="{4}" lg="{8}">
              <AspectRatio ratio="1x1">
                <Tile class="wakapi-tile">
                  <ChartTag
                    position="{Wakapi.ChartTagPosition.BOTTOM_LEFT}"
                    size="sm"
                    type="high-contrast"
                    >Editors
                  </ChartTag>
                  <StatChart
                    type="{Wakapi.ChartType.EDITORS}"
                    pie="{{ labels: { enabled: true } }}"
                    max="{controlFormData.max}"
                    class="wakapi-chart__sub-chart"
                  />
                </Tile>
              </AspectRatio>
            </Column>
          </Row>
          <Row>
            <Column sm="{2}" md="{4}" lg="{8}">
              <AspectRatio ratio="1x1">
                <Tile class="wakapi-tile">
                  <ChartTag
                    position="{Wakapi.ChartTagPosition.TOP_RIGHT}"
                    size="sm"
                    type="high-contrast"
                    >Operating Systems
                  </ChartTag>
                  <StatChart
                    type="{Wakapi.ChartType.OPERATING_SYSTEMS}"
                    pie="{{ labels: { enabled: true } }}"
                    max="{controlFormData.max}"
                    class="wakapi-chart__sub-chart"
                  />
                </Tile>
              </AspectRatio>
            </Column>
            <Column sm="{2}" md="{4}" lg="{8}">
              <AspectRatio ratio="1x1">
                <Tile class="wakapi-tile">
                  <ChartTag
                    position="{Wakapi.ChartTagPosition.TOP_LEFT}"
                    size="sm"
                    type="high-contrast">Machines</ChartTag
                  >
                  <StatChart
                    type="{Wakapi.ChartType.MACHINES}"
                    pie="{{ labels: { enabled: true } }}"
                    max="{controlFormData.max}"
                    class="wakapi-chart__sub-chart"
                  />
                </Tile>
              </AspectRatio>
            </Column>
          </Row>
        </Grid>
      </Column>
    {/if}
  </Row>
</Grid>

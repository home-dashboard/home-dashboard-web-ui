<script lang="ts">
  import { Column, Grid, Row } from "carbon-components-svelte";
  import WakapiGrid from "./wakapi-grid.svelte";
  import GitHubGrid from "./github-grid.svelte";
  import { ConfigurationStore as configuration } from "../../lib/stores";

  import "./+page.scss";

  const wakapiEnabled = $configuration.current.configuration.serverMonitor.thirdParty.wakapi.enable;
  const githubEnabled = $configuration.current.configuration.serverMonitor.thirdParty.github.enable;
</script>

<Grid fullWidth padding noGutter>
  <Row>
    {#if wakapiEnabled}
      <Column noGutter sm="{4}" md="{8}" lg="{12}" xlg="{8}" max="{8}">
        <WakapiGrid />
      </Column>
    {/if}
    {#if githubEnabled}
      <Column noGutter sm="{4}" md="{8}" lg="{4}" xlg="{4}" max="{4}">
        <GitHubGrid />
      </Column>
    {/if}
  </Row>
</Grid>

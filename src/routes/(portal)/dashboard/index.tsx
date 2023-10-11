import { ConfigurationContext } from "../../../lib/contextes";
import { createMemo, Show } from "solid-js";
import WakapiGrid from "./wakapi-grid";
import GitHubGrid from "./github-grid";

import "./styles.scss";

export default function Index() {
  const [configuration] = ConfigurationContext.useContext();

  const wakapiEnabled = createMemo(
    () => configuration().current.configuration.serverMonitor.thirdParty.wakapi.enable
  );
  const githubEnabled = createMemo(
    () => configuration().current.configuration.serverMonitor.thirdParty.github.enable
  );

  return (
    <div class="wakapi-grid cds--css-grid cds--css-grid--full-width">
      <Show when={wakapiEnabled()}>
        <div class="cds--css-grid-column cds--sm:col-span-4 cds--md:col-span-8 cds--lg:col-span-12 cds--xlg:col-span-8 cds--max:col-span-8">
          <WakapiGrid />
        </div>
      </Show>
      <Show when={githubEnabled()}>
        <div class="cds--css-grid-column cds--sm:col-span-4 cds--md:col-span-8 cds--lg:col-span-4 cds--xlg:col-span-4 cds--max:col-span-4">
          <GitHubGrid />
        </div>
      </Show>
    </div>
  );
}

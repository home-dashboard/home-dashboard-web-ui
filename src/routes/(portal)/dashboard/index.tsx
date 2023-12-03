import { ConfigurationContext } from "../../../lib/contextes";
import { createMemo, Show } from "solid-js";
import WakapiGrid from "./wakapi-grid";
import GitHubGrid from "./github-grid";

import "./styles.scss";
import ShortcutGrid from "./shortcut-grid";

export default function Index() {
  const [configuration] = ConfigurationContext.useContext();

  const wakapiEnabled = createMemo(
    () => configuration().current.configuration.serverMonitor.thirdParty.wakapi.enable
  );
  const githubEnabled = createMemo(
    () => configuration().current.configuration.serverMonitor.thirdParty.github.enable
  );

  return (
    <div class="dashboard-container cds--css-grid cds--css-grid--full-width grid-flow-row-dense">
      <Show when={wakapiEnabled()}>
        <div class="cds--css-grid-column cds--sm:col-span-4 cds--md:col-span-8 cds--lg:col-span-16 cds--xlg:col-span-10 cds--max:col-span-10">
          <WakapiGrid />
        </div>
      </Show>
      <div class="cds--css-grid-column cds--sm:col-span-4 cds--md:col-span-4 cds--lg:col-span-8 cds--xlg:col-span-6 cds--max:col-span-6">
        <ShortcutGrid />
      </div>
      <Show when={githubEnabled()}>
        <div class="cds--css-grid-column cds--sm:col-span-4 cds--md:col-span-4 cds--lg:col-span-8 cds--xlg:col-span-8 cds--max:col-span-8">
          <GitHubGrid />
        </div>
      </Show>
    </div>
  );
}

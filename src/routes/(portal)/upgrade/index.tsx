import { OverseerContext, SystemInfoContext } from "../../../lib/contextes";
import { createEffect, createSignal, Show } from "solid-js";
import { upgrade } from "../../../lib/http-interface";
import { useNavigate } from "solid-start";
import { SolidMarkdown } from "solid-markdown";
import { createResourceDefer } from "../../../lib/utils/create-resource";
import { OverseerStatusType } from "../../../lib/http-interface/server-send-event";
import { Icon } from "@iconify-icon/solid";

import "./styles.scss";

export default function Index() {
  const navigate = useNavigate();
  const [{ newVersion, statusMessage }] = OverseerContext.useContext();
  const [{ version: versionInfo }] = SystemInfoContext.useContext();

  const [upgradeResult, { refetch: handleUpgrade }] = createResourceDefer(async () => {
    const { fetcherName, version } = newVersion()!;
    setUpgradeModalOpened(false);

    await upgrade({ fetcherName, version });
    navigate("/upgrade/upgrading");
  });

  const [confirmUpgradeModalOpened, setUpgradeModalOpened] = createSignal(false);

  // 如果当前正处于升级状态, 跳转到升级进度界面
  createEffect(
    () => statusMessage()?.type !== OverseerStatusType.RUNNING && navigate("/upgrade/upgrading")
  );

  return (
    <>
      <div class="upgrade-container">
        <cds-stack gap={4}>
          <h2>
            Upgrade <span class="text-xs">Current version: {versionInfo().version}</span>
          </h2>
          <p>
            Upgrade version:{" "}
            <cds-link size="lg" href={newVersion()?.url} target="_blank" ref="noopener,noreferrer">
              {newVersion()?.version}
              <Icon slot="icon" icon="carbon:launch" />
            </cds-link>
            <span class="text-xs text-gray-600">from {newVersion()?.fetcherName}</span>
          </p>
          <cds-tile>
            <SolidMarkdown children={newVersion()?.releaseNotes} />
          </cds-tile>
          <p>
            <cds-button onClick={[setUpgradeModalOpened, true]}>Upgrade</cds-button>
          </p>
        </cds-stack>
      </div>

      <cds-modal open={confirmUpgradeModalOpened()}>
        <cds-modal-header>
          <cds-modal-heading>Upgrade HOME Dashboard</cds-modal-heading>
        </cds-modal-header>

        <cds-modal-body>
          <cds-stack gap={4}>
            <cds-inline-notification
              class="w-full max-w-none box-border"
              kind="warning"
              hide-close-button=""
              low-contrast=""
            >
              <div slot="title">Updating will cause the service to be temporarily unavailable.</div>
            </cds-inline-notification>
            <p>
              Are you sure you want to upgrade to <strong>{newVersion()?.version}</strong>?
            </p>
          </cds-stack>
          <div />
        </cds-modal-body>

        <cds-modal-footer>
          <cds-modal-footer-button kind="secondary" onClick={[setUpgradeModalOpened, false]}>
            Cancel
          </cds-modal-footer-button>
          <cds-modal-footer-button kind="danger" onClick={[handleUpgrade, true]}>
            <Show when={upgradeResult.loading} fallback={"Upgrade"}>
              <cds-inline-loading class="min-h-0 h-4" status="active">
                Upgrading...
              </cds-inline-loading>
            </Show>
          </cds-modal-footer-button>
        </cds-modal-footer>
      </cds-modal>
    </>
  );
}

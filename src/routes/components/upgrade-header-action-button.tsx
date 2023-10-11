import { createMemo, Show } from "solid-js";
import { Icon } from "@iconify-icon/solid";
import { OverseerContext } from "../../lib/contextes";
import { notUAN, typeIsNumber } from "@siaikin/utils";
import { OverseerStatusType } from "../../lib/http-interface/server-send-event";
import { useLocation, useNavigate } from "solid-start";

import "./upgrade-header-action-button.scss";

export function UpgradeHeaderActionButton() {
  const navigate = useNavigate();
  const location = useLocation();

  const [{ newVersion, statusMessage }] = OverseerContext.useContext();

  const hasNewVersion = createMemo(
    () => notUAN(newVersion()) || statusMessage().type !== OverseerStatusType.RUNNING
  );
  const actionButtonProps = createMemo(() => {
    const { type, text, extra } = statusMessage();

    switch (type) {
      case OverseerStatusType.RUNNING:
        return { text: `New version ${newVersion()?.version} available`, icon: "carbon:upgrade" };
      case OverseerStatusType.UPGRADING: {
        if (typeIsNumber(extra?.downloadPercent)) {
          return { text: text, downloadPercent: extra?.downloadPercent, icon: "carbon:upgrade" };
        } else {
          return { text: text, icon: "carbon:upgrade" };
        }
      }
      case OverseerStatusType.RESTARTING:
        return { text: text, icon: "carbon:restart" };
      default:
        return { text: "", icon: "" };
    }
  });

  return (
    <Show when={hasNewVersion()}>
      <cds-header-global-action
        class="upgrade-action"
        style={{
          "--gradient-color-stop": typeIsNumber(actionButtonProps().downloadPercent)
            ? `${actionButtonProps().downloadPercent}%`
            : undefined
        }}
        tooltip-text={actionButtonProps().text}
        tooltip-alignment={"right"}
        tooltip-position="bottom"
        disabled={location.pathname.startsWith("/upgrade")}
        onClick={[navigate, "/upgrade"]}
      >
        <Show
          when={typeIsNumber(actionButtonProps().downloadPercent)}
          fallback={<Icon slot="icon" width={20} height={20} icon={actionButtonProps().icon} />}
        >
          <div slot="icon">{actionButtonProps().downloadPercent}%</div>
        </Show>
      </cds-header-global-action>
    </Show>
  );
}

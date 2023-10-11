import { OverseerContext } from "../../../lib/contextes";
import { createMemo, Show } from "solid-js";
import { OverseerStatusType } from "../../../lib/http-interface/server-send-event";

import "./styles.scss";
import { Countdown } from "../../../lib/components";

export default function Index() {
  const [{ statusMessage }] = OverseerContext.useContext();

  const status = createMemo(() => statusMessage());

  return (
    <>
      <div class="upgrading-container">
        <cds-stack gap={4}>
          <cds-progress-indicator space-equally="">
            <cds-progress-step
              attr:state={["current", "complete", "complete"][status().type - 1]}
              label="Preparing"
              secondary-label="Preparing to upgrade"
            />
            <cds-progress-step
              attr:state={["incomplete", "current", "complete"][status().type - 1]}
              label="Downloading"
            >
              <cds-progress-bar
                style={{
                  position: "absolute",
                  left: "0px",
                  "margin-top": "1.75rem",
                  "margin-left": "1.5rem"
                }}
                slot="secondary-label-text"
                helper-text={status().text}
                size="sm"
                max={100}
                status={(status().extra?.downloadPercent as number) >= 100 ? "finished" : "active"}
                value={status().extra?.downloadPercent}
              />
            </cds-progress-step>
            <cds-progress-step
              attr:state={["incomplete", "incomplete", "current"][status().type - 1]}
              label="Restarting"
              secondary-label="Installing the upgrade package and restarting the service"
            />
          </cds-progress-indicator>

          <cds-modal open={status().type === OverseerStatusType.RESTARTING}>
            <cds-modal-header>
              <cds-modal-heading>Congratulations, the upgrade is almost complete</cds-modal-heading>
            </cds-modal-header>

            <cds-modal-body>
              <cds-modal-body-content>
                <p>
                  The service is restarting and will return to the homepage in{" "}
                  <strong>
                    <Show when={status().type === OverseerStatusType.RESTARTING}>
                      <Countdown time={10} interval={1000} onFinish={() => (location.href = "/")} />
                    </Show>{" "}
                    seconds
                  </strong>
                  . Or you can click the button below to return to the homepage.
                </p>
              </cds-modal-body-content>
            </cds-modal-body>

            <cds-modal-footer>
              <cds-modal-footer-button kind="primary" onClick={() => (location.href = "/")}>
                Return to the homepage
              </cds-modal-footer-button>
            </cds-modal-footer>
          </cds-modal>
        </cds-stack>
      </div>
    </>
  );
}

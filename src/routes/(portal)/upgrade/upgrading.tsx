import { OverseerContext } from "../../../lib/contextes";
import { createMemo } from "solid-js";

import "./styles.scss";

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
        </cds-stack>
      </div>
    </>
  );
}

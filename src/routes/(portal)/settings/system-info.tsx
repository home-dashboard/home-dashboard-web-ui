import { SystemInfoContext } from "../../../lib/contextes";
import { formatDuration } from "../../../lib/utils/format-duration";
import { DefaultFormatter } from "../../../lib/utils/intl-utils";
import { Icon } from "@iconify-icon/solid";

export function SystemInfoAccordionItem() {
  const [{ version, systemInfo }] = SystemInfoContext.useContext();

  return (
    <cds-accordion-item>
      <div slot="title">
        <Icon icon="carbon:bare-metal-server" inline={true} /> System Info - {systemInfo().hostname}
      </div>
      <cds-structured-list condensed={true}>
        <cds-structured-list-head>
          <cds-structured-list-header-row condensed={true}>
            <cds-structured-list-header-cell class="box-border">
              Name
            </cds-structured-list-header-cell>
            <cds-structured-list-header-cell class="box-border">
              Value
            </cds-structured-list-header-cell>
          </cds-structured-list-header-row>
        </cds-structured-list-head>
        <cds-structured-list-body>
          <cds-structured-list-row condensed={true}>
            <cds-structured-list-cell>System</cds-structured-list-cell>
            <cds-structured-list-cell>
              {systemInfo().os} {systemInfo().kernelArch}
            </cds-structured-list-cell>
          </cds-structured-list-row>
          <cds-structured-list-row condensed={true}>
            <cds-structured-list-cell>Kernel</cds-structured-list-cell>
            <cds-structured-list-cell>
              {systemInfo().kernelArch} {systemInfo().kernelVersion}
            </cds-structured-list-cell>
          </cds-structured-list-row>
          <cds-structured-list-row condensed={true}>
            <cds-structured-list-cell>Uptime</cds-structured-list-cell>
            <cds-structured-list-cell>
              {formatDuration(systemInfo().uptime)}
            </cds-structured-list-cell>
          </cds-structured-list-row>
          <cds-structured-list-row condensed={true}>
            <cds-structured-list-cell>Version</cds-structured-list-cell>
            <cds-structured-list-cell>{version().version}</cds-structured-list-cell>
          </cds-structured-list-row>
          <cds-structured-list-row condensed={true}>
            <cds-structured-list-cell>Commit Hash</cds-structured-list-cell>
            <cds-structured-list-cell>{version().commit}</cds-structured-list-cell>
          </cds-structured-list-row>
          <cds-structured-list-row condensed={true}>
            <cds-structured-list-cell>Build time</cds-structured-list-cell>
            <cds-structured-list-cell>
              {DefaultFormatter.format(version().date)}
            </cds-structured-list-cell>
          </cds-structured-list-row>
        </cds-structured-list-body>
      </cds-structured-list>
    </cds-accordion-item>
  );
}

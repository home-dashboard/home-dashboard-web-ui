import "./styles.scss";

import "@carbon/web-components/es/index.js";
import "@carbon/web-components/es/components/select/index.js";
import "@carbon/web-components/es/components/ui-shell/index.js";
import "@carbon/web-components/es/components/form/index.js";
import "@carbon/web-components/es/components/modal/index.js";

declare module "solid-js" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      [key: string]: unknown;
    }
  }
}

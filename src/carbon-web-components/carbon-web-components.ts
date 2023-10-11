import "@carbon/web-components/es/index";
import "@carbon/web-components/es/components/select/index";
import "@carbon/web-components/es/components/ui-shell/index";
import "@carbon/web-components/es/components/form/index";
import "@carbon/web-components/es/components/modal/index";

declare module "solid-js" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      [key: string]: unknown;
    }
  }
}

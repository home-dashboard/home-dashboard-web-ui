import { isServer as _isServer } from "solid-js/web";

export const BASE_URL = "/v1/web";
export const HTTP_RESPONSE_DELAY = 250;
export const isServer = _isServer;

declare module "solid-js" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface Directives {
      [key: string]: unknown;
    }
  }
}

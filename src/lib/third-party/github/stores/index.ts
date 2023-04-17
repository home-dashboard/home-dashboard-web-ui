import { readable } from "svelte/store";
import type { Readable } from "svelte/store";
import { thirdPartyObservable } from "../../../http-interface/server-send-event";
import { filter } from "rxjs";
import { typeIsArray } from "@siaikin/utils";

export const store: Readable<Array<Notification>> = readable<Array<Notification>>([], (set) => {
  thirdPartyObservable.pipe(filter((data) => data.type === "github")).subscribe(({ data }) => {
    const notifications = data["notifications"];

    if (!typeIsArray(notifications)) return;

    set(notifications as Array<Notification>);
  });
});

/**
 * GitHub 通知
 */
export interface Notification {
  id: string;
  repository: {
    name: string;
    url: string;
  };
  unread: boolean;
  reason: string;
  updatedAt: number;
  title: string;
  type: string;
  url: string;
  lastCommentUrl: string;
}

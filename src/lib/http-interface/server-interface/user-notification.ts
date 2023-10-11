import { httpClient } from "../http-client";
import type { Model } from "./common";
import { typeIsNumber } from "@siaikin/utils";

/**
 * 获取所有未读通知.
 * @param max 最大数量. 默认为 10, max 为 0 时, 获取所有未读通知.
 */
export async function listUnreadNotifications(max = 0): Promise<Array<UserNotification>> {
  const result = await httpClient.get<{ notifications: Array<UserNotification> }>({
    url: "notification/list/unread",
    queryParams: { max },
  });

  return result["notifications"];
}

/**
 * 标记通知为已读, 如果 id 为 null, 则标记所有通知为已读.
 * @param id 通知 id
 */
export async function markUserNotificationAsRead(id?: number): Promise<void> {
  if (typeIsNumber(id)) {
    return httpClient.patch({ url: `notification/read/${id}` });
  } else {
    return httpClient.patch({ url: `notification/read/all` });
  }
}

export interface UserNotification extends Model {
  uniqueId: string;
  read: boolean;
  title: string;
  caption: string;
  link: string;
  kind: UserNotificationKind;
  origin: UserNotificationOrigin;
  originCreateAt: number;
}

export enum UserNotificationKind {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  SUCCESS = "success",
}

export enum UserNotificationOrigin {
  MAIN = "main",
  WAKAPI = "wakapi",
  GITHUB = "github",
}

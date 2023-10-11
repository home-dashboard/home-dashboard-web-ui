import { userNotificationObservable } from "../http-interface/server-send-event";
import { listUnreadNotifications } from "../http-interface";
import type { UserNotification } from "../http-interface";
import { debounceTime, BehaviorSubject } from "rxjs";

export function observe(): [
  BehaviorSubject<Array<UserNotification>>,
  () => Promise<void>,
  () => void
] {
  const subject = new BehaviorSubject<Array<UserNotification>>([]);

  const refresh = async () => subject.next(await listUnreadNotifications());
  const subscription = userNotificationObservable
    .pipe(debounceTime(1000))
    .subscribe(async () => refresh());

  return [subject, refresh, () => subscription.unsubscribe()];
}

const [subject, refresh] = observe();

export const userNotificationsObservable = subject.asObservable();

export function userNotifications() {
  return subject.value;
}

export { refresh };

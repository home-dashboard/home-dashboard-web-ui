import { writable } from "svelte/store";
import { userNotificationObservable } from "../http-interface/server-send-event";
import { listUnreadNotifications } from "../http-interface";
import type { UserNotification } from "../http-interface";
import { debounceTime, Subject, merge } from "rxjs";

const refreshSubject = new Subject<void>();

export const store = writable<{ notifications: Array<UserNotification> }>(
  { notifications: [] },
  (set) => {
    const subscription = merge(refreshSubject, userNotificationObservable)
      .pipe(debounceTime(1000))
      .subscribe(async () => set({ notifications: await listUnreadNotifications() }));

    listUnreadNotifications().then((notifications) => set({ notifications }));

    return () => subscription.unsubscribe();
  }
);

export function refresh() {
  refreshSubject.next();
}

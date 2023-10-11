import type { ConfigurationUpdates } from "../http-interface";
import { BehaviorSubject } from "rxjs";
import { getConfigurationUpdates } from "../http-interface";
import { userNotificationObservable } from "../http-interface/server-send-event";

export function observe() {
  const subject = new BehaviorSubject<ConfigurationUpdates>({} as ConfigurationUpdates);

  const refresh = async () => subject.next(await getConfigurationUpdates());
  const subscription = userNotificationObservable.subscribe(async () => refresh());

  return [subject, refresh, () => subscription.unsubscribe()] as const;
}

const [subject, refresh] = observe();

export const configurationObservable = subject.asObservable();

export function configuration() {
  return subject.value;
}

export { refresh };

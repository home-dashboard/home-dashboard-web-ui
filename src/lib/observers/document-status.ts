import { BehaviorSubject } from "rxjs";
import { isServer } from "../../global-config";

function visibilityStateToBoolean(state: DocumentVisibilityState): boolean {
  switch (state) {
    case "hidden":
      return false;
    case "visible":
      return true;
    default:
      throw new Error(`unknown visible state: ${state}`);
  }
}

export function observe(): [BehaviorSubject<boolean>, () => void] {
  const subject = new BehaviorSubject(visibilityStateToBoolean(document.visibilityState));

  const handle = () => subject.next(visibilityStateToBoolean(document.visibilityState));

  document.addEventListener("visibilitychange", handle);

  return [subject, () => document.removeEventListener("visibilitychange", handle)];
}

const [subject] = isServer ? [new BehaviorSubject(true)] : observe();

export const documentVisibilityStatusObservable = subject.asObservable();

export function documentVisibilityStatus() {
  return subject.value;
}

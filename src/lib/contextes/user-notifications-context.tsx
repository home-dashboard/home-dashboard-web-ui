import { children, createContext, FlowProps, useContext as solidUseContext } from "solid-js";
import { createStore } from "solid-js/store";
import { UserNotifications } from "../observers";

const [store, setStore] = createStore(UserNotifications.userNotifications());
UserNotifications.userNotificationsObservable.subscribe((value) => setStore(value));

const provideValue = [
  store,
  {
    refresh: () => UserNotifications.refresh()
  }
] as const;

const Context = createContext(provideValue);

export function Provider(props: FlowProps) {
  return <Context.Provider value={provideValue}>{props.children}</Context.Provider>;
}

export function useContext() {
  return solidUseContext(Context);
}

import {
  children,
  createContext,
  createSignal,
  FlowProps,
  useContext as solidUseContext
} from "solid-js";
import { Stats } from "../observers";

const [signal, setSignal] = createSignal(Stats.stats());
Stats.statsObservable.subscribe((value) => setSignal(value));

const provideValue = [
  signal,
  {
    refresh: (...args: Parameters<typeof Stats.refresh>) => Stats.refresh(...args),
    refreshAndWait: (...args: Parameters<typeof Stats.refresh>) => Stats.refreshAndWait(...args)
  }
] as const;

const Context = createContext(provideValue);

export function Provider(props: FlowProps) {
  return <Context.Provider value={provideValue}>{props.children}</Context.Provider>;
}

export function useContext() {
  return solidUseContext(Context);
}

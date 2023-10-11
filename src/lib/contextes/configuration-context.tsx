import {
  children,
  createContext,
  createSignal,
  FlowProps,
  useContext as solidUseContext
} from "solid-js";
import { Configuration } from "../observers";

const [signal, setSignal] = createSignal(Configuration.configuration());
Configuration.configurationObservable.subscribe((value) => setSignal(value));

const provideValue = [
  signal,
  {
    refresh: () => Configuration.refresh()
  }
] as const;

const Context = createContext(provideValue);

export function Provider(props: FlowProps) {
  return <Context.Provider value={provideValue}>{props.children}</Context.Provider>;
}

export function useContext() {
  return solidUseContext(Context);
}

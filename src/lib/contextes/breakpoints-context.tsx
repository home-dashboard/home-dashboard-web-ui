import { createContext, createSignal, FlowProps, useContext as solidUseContext } from "solid-js";
import { Breakpoints } from "../observers";

const [signal, setSignal] = createSignal(Breakpoints.breakpoint());
Breakpoints.breakpointObservable.subscribe((value) => setSignal(value));

const provideValue = [
  signal,
  {
    smallerThan: (...args: Parameters<typeof Breakpoints.smallerThan>) => {
      signal();
      return Breakpoints.smallerThan(args[0]);
    },
    largerThan: (...args: Parameters<typeof Breakpoints.largerThan>) => {
      signal();
      return Breakpoints.largerThan(args[0]);
    }
  }
] as const;

const Context = createContext(provideValue);

export function Provider(props: FlowProps) {
  return <Context.Provider value={provideValue}>{props.children}</Context.Provider>;
}

export function useContext() {
  return solidUseContext(Context);
}

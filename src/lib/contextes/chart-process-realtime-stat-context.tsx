import {
  children,
  createContext,
  createSignal,
  FlowProps,
  observable,
  useContext as solidUseContext
} from "solid-js";
import { ChartProcessRealtimeStat, DocumentStatus } from "../observers";
import { from } from "rxjs";

const [isPause, setPause] = createSignal(false);
const [subject] = ChartProcessRealtimeStat.observe(
  DocumentStatus.documentVisibilityStatusObservable,
  from(observable(() => !isPause()))
);
const [signal, setSignal] = createSignal(subject.value, { equals: false });
subject.subscribe((value) => setSignal(value));

const provideValue = [
  signal,
  {
    pause: () => setPause(true),
    resume: () => setPause(false)
  }
] as const;

const Context = createContext(provideValue);
export function Provider(props: FlowProps) {
  return <Context.Provider value={provideValue}>{props.children}</Context.Provider>;
}

export function useContext() {
  return solidUseContext(Context);
}

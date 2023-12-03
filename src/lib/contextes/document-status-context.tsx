import { createContext, createSignal, FlowProps, useContext as solidUseContext } from "solid-js";
import { DocumentStatus } from "../observers";

const [signal, setSignal] = createSignal(DocumentStatus.documentVisibilityStatus());
DocumentStatus.documentVisibilityStatusObservable.subscribe((value) => setSignal(value));

const provideValue = [signal] as const;

const Context = createContext(provideValue);

export function Provider(props: FlowProps) {
  return <Context.Provider value={provideValue}>{props.children}</Context.Provider>;
}

export function useContext() {
  return solidUseContext(Context);
}

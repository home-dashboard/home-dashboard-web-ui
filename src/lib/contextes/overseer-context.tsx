import { createContext, createSignal, FlowProps, useContext as solidUseContext } from "solid-js";
import { Overseer } from "../observers";
import {
  OverseerNewVersionMessage,
  OverseerStatusMessage,
  OverseerStatusType
} from "../http-interface/server-send-event";
import { typeIsNumber } from "@siaikin/utils";

const [newVersion, setNewVersion] = createSignal<OverseerNewVersionMessage>();
Overseer.overseerObservables.newVersion.subscribe((value) => setNewVersion(value));

const [statusMessage, setStatusMessage] = createSignal<OverseerStatusMessage>({
  type: OverseerStatusType.RUNNING,
  text: "Running",
  extra: {}
});
Overseer.overseerObservables.statusMessage.subscribe((value) => {
  switch (value.type) {
    case OverseerStatusType.UPGRADING: {
      const written = value.extra?.written;
      const total = value.extra?.total;
      if (!typeIsNumber(written) || !typeIsNumber(total)) break;

      value.extra.downloadPercent = Number.parseInt(((written / total) * 100).toFixed(0));
    }
  }

  setStatusMessage(value);
});

const provideValue = [{ newVersion, statusMessage }] as const;

const Context = createContext(provideValue);

export function Provider(props: FlowProps) {
  return <Context.Provider value={provideValue}>{props.children}</Context.Provider>;
}

export function useContext() {
  return solidUseContext(Context);
}

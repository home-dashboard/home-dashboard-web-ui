import {
  Accessor,
  createContext,
  createMemo,
  FlowProps,
  useContext as solidUseContext
} from "solid-js";
import { SystemInfoStat, VersionInfo } from "../http-interface";

type ContextValue = {
  version: Accessor<VersionInfo>;
  systemInfo: Accessor<SystemInfoStat>;
};

const Context = createContext([
  {
    version: () => ({ date: 0 }) as VersionInfo,
    systemInfo: () => ({ uptime: 0, bootTime: 0 }) as SystemInfoStat
  } as ContextValue
]);

export function Provider(
  props: FlowProps<
    Partial<{
      versionInfo: VersionInfo;
      systemInfo: SystemInfoStat;
    }>
  >
) {
  const version = createMemo(() => props.versionInfo ?? Context.defaultValue[0].version());
  const systemInfo = createMemo(() => props.systemInfo ?? Context.defaultValue[0].systemInfo());

  const provideValue: [ContextValue] = [{ version, systemInfo }];

  return <Context.Provider value={provideValue}>{props.children}</Context.Provider>;
}

export function useContext() {
  return solidUseContext(Context);
}

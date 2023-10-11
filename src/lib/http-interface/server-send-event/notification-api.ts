import { httpClient } from "../http-client";

export async function modifyCollectStat({
  system,
  process
}: Partial<{
  system: Partial<CollectStatConfig["system"]>;
  process: Partial<CollectStatConfig["process"]>;
}>): Promise<void> {
  const oldConfig = await getCollectStat();

  system = {
    ...oldConfig.system,
    ...system
  };

  process = {
    ...oldConfig.process,
    ...process
  };

  return httpClient.post({ url: "notification/collect", body: { system, process } });
}

export function getCollectStat(): Promise<CollectStatConfig> {
  return httpClient.get({ url: "notification/collect" });
}

export interface CollectStatConfig {
  system: {
    enable: boolean;
  };

  process: {
    enable: boolean;
    sortField: string;
    sortOrder: boolean;
    max: number;
  };
}
